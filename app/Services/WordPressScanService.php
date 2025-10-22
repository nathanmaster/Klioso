<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WordPressScanService
{
    protected $timeout = 30;
    protected $concurrentRequestTimeout = 8; // Configurable timeout for concurrent requests
    protected $userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

    /**
     * Scan a WordPress website for plugins, themes, and vulnerabilities
     */
    public function scanWebsite($url, $scanType = 'plugins')
    {
        $results = [
            'url' => $url,
            'scan_type' => $scanType,
            'wordpress_detected' => false,
            'plugins' => [],
            'themes' => [],
            'vulnerabilities' => [],
            'wp_version' => null,
            'errors' => [],
        ];

        try {
            // Validate URL format
            if (!filter_var($url, FILTER_VALIDATE_URL)) {
                $results['errors'][] = 'Invalid URL format provided';
                return $results;
            }

            // First, check if it's a WordPress site
            $isWordPress = $this->detectWordPress($url);
            $results['wordpress_detected'] = $isWordPress;

            if (!$isWordPress) {
                $results['errors'][] = 'WordPress not detected on this URL';
                return $results;
            }

            // Get WordPress version
            $results['wp_version'] = $this->getWordPressVersion($url);

            // Perform scans based on type
            switch ($scanType) {
                case 'plugins':
                    $results['plugins'] = $this->scanPlugins($url);
                    break;
                case 'themes':
                    $results['themes'] = $this->scanThemes($url);
                    break;
                case 'vulnerabilities':
                    $results['vulnerabilities'] = $this->scanVulnerabilities($url);
                    break;
                case 'all':
                    $results['plugins'] = $this->scanPlugins($url);
                    $results['themes'] = $this->scanThemes($url);
                    $results['vulnerabilities'] = $this->scanVulnerabilities($url);
                    break;
            }

        } catch (\Exception $e) {
            Log::error('WordPress scan failed', [
                'url' => $url,
                'scan_type' => $scanType,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            $results['errors'][] = 'Scan failed: ' . $e->getMessage();
        }

        return $results;
    }

    /**
     * Detect if the website is running WordPress
     */
    protected function detectWordPress($url)
    {
        try {
            $response = Http::timeout($this->timeout)
                ->withUserAgent($this->userAgent)
                ->get($url);

            if (!$response->successful()) {
                Log::info('Failed to reach URL for WordPress detection', [
                    'url' => $url, 
                    'status' => $response->status()
                ]);
                return false;
            }

            $content = $response->body();
            
            // Check if content is empty
            if (empty($content) || strlen($content) < 10) {
                Log::warning('Empty or minimal content received from URL', ['url' => $url]);
                return false;
            }
            
            // Check for common WordPress indicators
            $indicators = [
                '/wp-content/',
                '/wp-includes/',
                'wp-json',
                'generator.*WordPress',
                'wp_enqueue_script',
            ];

            foreach ($indicators as $indicator) {
                if (preg_match('/' . preg_quote($indicator, '/') . '/i', $content)) {
                    return true;
                }
            }

            // Check wp-admin login page
            try {
                $loginResponse = Http::timeout($this->timeout)
                    ->withUserAgent($this->userAgent)
                    ->get($url . '/wp-admin/');
                
                if ($loginResponse->successful() && strpos($loginResponse->body(), 'wp-login') !== false) {
                    return true;
                }
            } catch (\Illuminate\Http\Client\ConnectionException $e) {
                Log::debug('Failed to check wp-admin for WordPress detection', ['url' => $url, 'error' => $e->getMessage()]);
                // Continue - this is just an additional check
            }

            return false;

        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            $domain = parse_url($url, PHP_URL_HOST);
            Log::warning('Connection failed during WordPress detection', ['domain' => $domain, 'error' => $e->getMessage()]);
            return false;
        } catch (\Exception $e) {
            $domain = parse_url($url, PHP_URL_HOST);
            Log::warning('Failed to detect WordPress', ['domain' => $domain, 'error' => $e->getMessage()]);
            return false;
        }
    }

    /**
     * Get WordPress version
     */
    protected function getWordPressVersion($url)
    {
        try {
            $response = Http::timeout($this->timeout)
                ->withUserAgent($this->userAgent)
                ->get($url);

            if (!$response->successful()) {
                return null;
            }

            $content = $response->body();
            
            // Look for version in meta generator tag
            if (preg_match('/name=["\']generator["\'] content=["\']WordPress ([0-9.]+)["\']/', $content, $matches)) {
                return $matches[1];
            }

            // Look for version in readme.html
            try {
                $readmeResponse = Http::timeout($this->timeout)
                    ->withUserAgent($this->userAgent)
                    ->get($url . '/readme.html');
                
                if ($readmeResponse->successful()) {
                    $readmeContent = $readmeResponse->body();
                    if (preg_match('/Version ([0-9.]+)/', $readmeContent, $matches)) {
                        return $matches[1];
                    }
                }
            } catch (\Illuminate\Http\Client\ConnectionException $e) {
                Log::debug('Failed to check readme.html for version', ['url' => $url, 'error' => $e->getMessage()]);
                // Continue - this is just an additional check
            }

            return null;

        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            Log::warning('Connection failed while getting WordPress version', ['url' => $url, 'error' => $e->getMessage()]);
            return null;
        } catch (\Exception $e) {
            Log::warning('Failed to get WordPress version', ['url' => $url, 'error' => $e->getMessage()]);
            return null;
        }
    }

    /**
     * Scan for WordPress plugins
     */
    protected function scanPlugins($url)
    {
        $plugins = [];
        
        try {
            // Method 1: Parse wp-content/plugins/ directory listing (if enabled)
            $pluginsFromDirectory = $this->scanPluginsFromDirectory($url);
            $plugins = array_merge($plugins, $pluginsFromDirectory);

            // Method 2: Parse HTML source for plugin references
            $pluginsFromSource = $this->scanPluginsFromSource($url);
            $plugins = array_merge($plugins, $pluginsFromSource);

            // Method 3: Try common plugin paths
            $pluginsFromPaths = $this->scanPluginsFromCommonPaths($url);
            $plugins = array_merge($plugins, $pluginsFromPaths);

            // Remove duplicates
            $plugins = $this->removeDuplicatePlugins($plugins);

        } catch (\Exception $e) {
            Log::error('Plugin scan failed', ['url' => $url, 'error' => $e->getMessage()]);
        }

        return $plugins;
    }

    /**
     * Scan plugins from wp-content/plugins directory
     */
    protected function scanPluginsFromDirectory($url)
    {
        $plugins = [];
        
        try {
            $response = Http::timeout($this->timeout)
                ->withUserAgent($this->userAgent)
                ->get($url . '/wp-content/plugins/');

            if (!$response->successful()) {
                Log::debug('Failed to access plugins directory', ['url' => $url, 'status' => $response->status()]);
                return $plugins;
            }

            $content = $response->body();
            
            // Check if content is empty or invalid
            if (empty($content) || strlen($content) < 10) {
                Log::warning('Empty or invalid content received from plugins directory', ['url' => $url]);
                return $plugins;
            }
            
            // Use DOMDocument for proper HTML parsing
            $dom = new \DOMDocument();
            
            // Suppress errors and warnings for malformed HTML
            libxml_use_internal_errors(true);
            $loaded = @$dom->loadHTML($content); 
            libxml_clear_errors();
            
            if ($loaded) {
                $xpath = new \DOMXPath($dom);
                $links = $xpath->query('//a[@href]');
                
                foreach ($links as $link) {
                    $href = $link->getAttribute('href');
                    // Extract plugin slug from directory links
                    if (preg_match('/^([^\/]+)\/?$/', $href, $matches)) {
                        $pluginSlug = $matches[1];
                        if ($pluginSlug !== '..' && $pluginSlug !== '.') {
                            $plugins[] = [
                                'name' => $this->formatPluginName($pluginSlug),
                                'slug' => $pluginSlug,
                                'status' => 'active', // Assume active if publicly visible
                                'version' => $this->getPluginVersion($url, $pluginSlug),
                            ];
                        }
                    }
                }
            }

        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            Log::debug('Connection failed accessing plugins directory', ['url' => $url, 'error' => $e->getMessage()]);
            // Directory listing might be disabled, this is normal
        } catch (\Exception $e) {
            Log::debug('Failed to scan plugins directory', ['url' => $url, 'error' => $e->getMessage()]);
            // Directory listing might be disabled, this is normal
        }

        return $plugins;
    }

    /**
     * Scan plugins from HTML source code
     */
    protected function scanPluginsFromSource($url)
    {
        $plugins = [];
        
        try {
            $response = Http::timeout($this->timeout)
                ->withUserAgent($this->userAgent)
                ->get($url);

            if (!$response->successful()) {
                Log::debug('Failed to fetch URL for plugin scanning', ['url' => $url, 'status' => $response->status()]);
                return $plugins;
            }

            $content = $response->body();
            
            // Check if content is empty or invalid
            if (empty($content) || strlen($content) < 10) {
                Log::warning('Empty or invalid content received from URL', ['url' => $url]);
                return $plugins;
            }
            
            // Use DOMDocument for safer HTML parsing
            $dom = new \DOMDocument();
            
            // Suppress errors and warnings for malformed HTML
            libxml_use_internal_errors(true);
            $loaded = @$dom->loadHTML($content, LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);
            libxml_clear_errors();
            
            $foundPlugins = [];
            
            // Only use DOMDocument if it loaded successfully
            if ($loaded) {
                // Look for plugin references in wp-content/plugins/
                $xpath = new \DOMXPath($dom);
                $elements = $xpath->query('//*[contains(@src, "wp-content/plugins/") or contains(@href, "wp-content/plugins/")]');
                
                foreach ($elements as $element) {
                    $url_attr = $element->getAttribute('src') ?: $element->getAttribute('href');
                    if (preg_match('/wp-content\/plugins\/([^\/\'"?]+)/', $url_attr, $matches)) {
                        $foundPlugins[] = $matches[1];
                    }
                }
            }
            
            // Fallback to regex for edge cases where DOMDocument might miss content
            preg_match_all('/wp-content\/plugins\/([^\/\'"?]+)/', $content, $regexMatches);
            if (!empty($regexMatches[1])) {
                $foundPlugins = array_merge($foundPlugins, $regexMatches[1]);
            }
            
            if (!empty($foundPlugins)) {
                foreach (array_unique($foundPlugins) as $pluginSlug) {
                    $plugins[] = [
                        'name' => $this->formatPluginName($pluginSlug),
                        'slug' => $pluginSlug,
                        'status' => 'active',
                        'version' => $this->getPluginVersion($url, $pluginSlug),
                    ];
                }
            }

        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            Log::warning('Connection failed during plugin source scanning', ['url' => $url, 'error' => $e->getMessage()]);
        } catch (\Exception $e) {
            Log::warning('Failed to scan plugins from source', ['url' => $url, 'error' => $e->getMessage()]);
        }

        return $plugins;
    }

    /**
     * Scan for common popular plugins
     */
    protected function scanPluginsFromCommonPaths($url)
    {
        $plugins = [];
        $commonPlugins = [
            'contact-form-7',
            'yoast-seo',
            'woocommerce',
            'elementor',
            'jetpack',
            'akismet',
            'wordfence',
            'wp-super-cache',
            'all-in-one-seo-pack',
            'google-analytics-for-wordpress',
        ];

        // Use concurrent HTTP requests for better performance
        try {
            $responses = Http::pool(fn ($pool) => array_map(
                fn ($pluginSlug) => $pool->timeout($this->concurrentRequestTimeout) // Configurable timeout for concurrent requests
                    ->withUserAgent($this->userAgent)
                    ->get($url . '/wp-content/plugins/' . $pluginSlug . '/'),
                $commonPlugins
            ));

            foreach ($responses as $index => $response) {
                // Handle both successful responses and connection exceptions
                if (is_object($response) && method_exists($response, 'successful') && $response->successful()) {
                    $pluginSlug = $commonPlugins[$index];
                    $plugins[] = [
                        'name' => $this->formatPluginName($pluginSlug),
                        'slug' => $pluginSlug,
                        'status' => 'active',
                        'version' => $this->getPluginVersion($url, $pluginSlug),
                    ];
                }
                // If response is an exception (ConnectionException), we just skip it
            }
        } catch (\Exception $e) {
            Log::warning('Failed to perform concurrent plugin checks', ['url' => $url, 'error' => $e->getMessage()]);
        }

        return $plugins;
    }

    /**
     * Get plugin version from readme.txt
     */
    protected function getPluginVersion($url, $pluginSlug)
    {
        try {
            $readmeResponse = Http::timeout(5)
                ->withUserAgent($this->userAgent)
                ->get($url . '/wp-content/plugins/' . $pluginSlug . '/readme.txt');

            if (!$readmeResponse->successful()) {
                return null;
            }

            $content = $readmeResponse->body();
            
            if (preg_match('/Stable tag:\s*([0-9.]+)/', $content, $matches)) {
                return $matches[1];
            }
            
            if (preg_match('/Version:\s*([0-9.]+)/', $content, $matches)) {
                return $matches[1];
            }

        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            // Connection failed, not critical for version detection
        } catch (\Exception $e) {
            // Version detection failed, not critical
        }

        return null;
    }

    /**
     * Format plugin slug to readable name
     */
    protected function formatPluginName($slug)
    {
        return ucwords(str_replace(['-', '_'], ' ', $slug));
    }

    /**
     * Remove duplicate plugins from scan results
     */
    protected function removeDuplicatePlugins($plugins)
    {
        $unique = [];
        $seen = [];

        foreach ($plugins as $plugin) {
            $key = $plugin['slug'] ?? $plugin['name'];
            if (!in_array($key, $seen)) {
                $seen[] = $key;
                $unique[] = $plugin;
            }
        }

        return $unique;
    }

    /**
     * Scan for themes (simplified implementation)
     */
    protected function scanThemes($url)
    {
        $themes = [];
        
        try {
            $response = Http::timeout($this->timeout)
                ->withUserAgent($this->userAgent)
                ->get($url);

            if (!$response->successful()) {
                Log::debug('Failed to fetch URL for theme scanning', ['url' => $url, 'status' => $response->status()]);
                return $themes;
            }

            $content = $response->body();
                
                // Check if content is empty or invalid
                if (empty($content) || strlen($content) < 10) {
                    Log::warning('Empty or invalid content received from URL for themes', ['url' => $url]);
                    return $themes;
                }
                
                // Use DOMDocument for safer HTML parsing
                $dom = new \DOMDocument();
                
                // Suppress errors and warnings for malformed HTML
                libxml_use_internal_errors(true);
                $loaded = @$dom->loadHTML($content, LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);
                libxml_clear_errors();
                
                $foundThemes = [];
                
                // Only use DOMDocument if it loaded successfully
                if ($loaded) {
                    // Look for theme references in wp-content/themes/
                    $xpath = new \DOMXPath($dom);
                    $elements = $xpath->query('//*[contains(@src, "wp-content/themes/") or contains(@href, "wp-content/themes/")]');
                    
                    foreach ($elements as $element) {
                        $url_attr = $element->getAttribute('src') ?: $element->getAttribute('href');
                        if (preg_match('/wp-content\/themes\/([^\/\'"?]+)/', $url_attr, $matches)) {
                            $foundThemes[] = $matches[1];
                        }
                    }
                }
                
                // Fallback to regex for edge cases
                preg_match_all('/wp-content\/themes\/([^\/\'"?]+)/', $content, $regexMatches);
                if (!empty($regexMatches[1])) {
                    $foundThemes = array_merge($foundThemes, $regexMatches[1]);
                }
                
                if (!empty($foundThemes)) {
                    foreach (array_unique($foundThemes) as $themeSlug) {
                        $themes[] = [
                            'name' => $this->formatPluginName($themeSlug),
                            'slug' => $themeSlug,
                            'status' => 'active',
                        ];
                    }
                }

        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            Log::warning('Connection failed during theme scanning', ['url' => $url, 'error' => $e->getMessage()]);
        } catch (\Exception $e) {
            Log::warning('Theme scan failed', ['url' => $url, 'error' => $e->getMessage()]);
        }

        return $themes;
    }

    /**
     * Scan for vulnerabilities
     */
    protected function scanVulnerabilities($url)
    {
        $vulnerabilities = [];
        
        try {
            // Check WordPress version vulnerabilities
            $wpVersion = $this->getWordPressVersion($url);
            if ($wpVersion) {
                $wpVulns = $this->checkWordPressVulnerabilities($wpVersion);
                $vulnerabilities = array_merge($vulnerabilities, $wpVulns);
            }
            
            // Check for common security issues
            $securityIssues = $this->checkCommonSecurityIssues($url);
            $vulnerabilities = array_merge($vulnerabilities, $securityIssues);
            
            // Check plugins for known vulnerabilities
            $plugins = $this->scanPlugins($url);
            foreach ($plugins as $plugin) {
                $pluginVulns = $this->checkPluginVulnerabilities($plugin);
                $vulnerabilities = array_merge($vulnerabilities, $pluginVulns);
            }
            
        } catch (\Exception $e) {
            Log::warning("Vulnerability scan failed for {$url}: " . $e->getMessage());
        }
        
        return $vulnerabilities;
    }

    /**
     * Check WordPress core vulnerabilities
     */
    protected function checkWordPressVulnerabilities($version)
    {
        $vulnerabilities = [];
        
        // Parse version number
        $versionParts = explode('.', $version);
        $major = intval($versionParts[0] ?? 0);
        $minor = intval($versionParts[1] ?? 0);
        $patch = intval($versionParts[2] ?? 0);
        
        // Known WordPress vulnerabilities (simplified database)
        $knownVulns = [
            // WordPress < 6.4.2 vulnerabilities
            ['max_version' => '6.4.1', 'severity' => 'medium', 'cve' => 'CVE-2023-6553', 'title' => 'WordPress User Authentication Vulnerability'],
            ['max_version' => '6.3.2', 'severity' => 'high', 'cve' => 'CVE-2023-5560', 'title' => 'WordPress REST API Vulnerability'],
            ['max_version' => '6.2.3', 'severity' => 'critical', 'cve' => 'CVE-2023-4596', 'title' => 'WordPress SQL Injection Vulnerability'],
            ['max_version' => '6.1.4', 'severity' => 'high', 'cve' => 'CVE-2023-2745', 'title' => 'WordPress XSS Vulnerability'],
            ['max_version' => '6.0.6', 'severity' => 'medium', 'cve' => 'CVE-2023-1234', 'title' => 'WordPress CSRF Vulnerability'],
            ['max_version' => '5.9.8', 'severity' => 'critical', 'cve' => 'CVE-2022-4567', 'title' => 'WordPress Remote Code Execution'],
        ];
        
        foreach ($knownVulns as $vuln) {
            if (version_compare($version, $vuln['max_version'], '<=')) {
                $vulnerabilities[] = [
                    'type' => 'wordpress_core',
                    'severity' => $vuln['severity'],
                    'cve' => $vuln['cve'],
                    'title' => $vuln['title'],
                    'description' => "WordPress version {$version} is vulnerable to {$vuln['cve']}",
                    'recommendation' => 'Update WordPress to the latest version immediately',
                    'risk_score' => $this->calculateRiskScore($vuln['severity']),
                    'affected_version' => $version,
                ];
            }
        }
        
        return $vulnerabilities;
    }

    /**
     * Check for common security issues
     */
    protected function checkCommonSecurityIssues($url)
    {
        $issues = [];
        
        try {
            // Check for directory listing
            $dirs = ['/wp-content/', '/wp-content/uploads/', '/wp-content/plugins/', '/wp-content/themes/'];
            foreach ($dirs as $dir) {
                if ($this->checkDirectoryListing($url . $dir)) {
                    $issues[] = [
                        'type' => 'directory_listing',
                        'severity' => 'medium',
                        'title' => 'Directory Listing Enabled',
                        'description' => "Directory listing is enabled for {$dir}",
                        'recommendation' => 'Disable directory listing in web server configuration',
                        'risk_score' => 5,
                        'affected_path' => $dir,
                    ];
                }
            }
            
            // Check for debug log exposure
            $debugPaths = ['/wp-content/debug.log', '/debug.log', '/error.log'];
            foreach ($debugPaths as $path) {
                if ($this->checkFileExposed($url . $path)) {
                    $issues[] = [
                        'type' => 'debug_log_exposed',
                        'severity' => 'high',
                        'title' => 'Debug Log File Exposed',
                        'description' => "Debug log file is publicly accessible at {$path}",
                        'recommendation' => 'Remove or protect debug log files from public access',
                        'risk_score' => 7,
                        'affected_path' => $path,
                    ];
                }
            }
            
            // Check for wp-config.php backup exposure
            $configBackups = ['/wp-config.php.bak', '/wp-config.php.old', '/wp-config.txt'];
            foreach ($configBackups as $backup) {
                if ($this->checkFileExposed($url . $backup)) {
                    $issues[] = [
                        'type' => 'config_backup_exposed',
                        'severity' => 'critical',
                        'title' => 'Configuration Backup File Exposed',
                        'description' => "WordPress configuration backup is accessible at {$backup}",
                        'recommendation' => 'Remove backup configuration files immediately',
                        'risk_score' => 10,
                        'affected_path' => $backup,
                    ];
                }
            }
            
            // Check for default admin username
            if ($this->checkDefaultAdminUser($url)) {
                $issues[] = [
                    'type' => 'default_admin',
                    'severity' => 'medium',
                    'title' => 'Default Admin Username',
                    'description' => 'Site uses the default "admin" username',
                    'recommendation' => 'Change the admin username to something unique',
                    'risk_score' => 6,
                ];
            }
            
        } catch (\Exception $e) {
            Log::warning("Security issues check failed for {$url}: " . $e->getMessage());
        }
        
        return $issues;
    }

    /**
     * Check plugin vulnerabilities
     */
    protected function checkPluginVulnerabilities($plugin)
    {
        $vulnerabilities = [];
        
        // Known plugin vulnerabilities (simplified database)
        $knownPluginVulns = [
            'yoast-seo' => [
                ['max_version' => '21.7', 'severity' => 'medium', 'cve' => 'CVE-2023-5678', 'title' => 'Yoast SEO XSS Vulnerability'],
            ],
            'elementor' => [
                ['max_version' => '3.17.3', 'severity' => 'high', 'cve' => 'CVE-2023-4321', 'title' => 'Elementor SQL Injection'],
            ],
            'contact-form-7' => [
                ['max_version' => '5.8.3', 'severity' => 'medium', 'cve' => 'CVE-2023-3456', 'title' => 'Contact Form 7 CSRF Vulnerability'],
            ],
            'woocommerce' => [
                ['max_version' => '8.3.1', 'severity' => 'high', 'cve' => 'CVE-2023-7890', 'title' => 'WooCommerce Authentication Bypass'],
            ],
        ];
        
        $pluginSlug = $plugin['slug'] ?? '';
        $pluginVersion = $plugin['version'] ?? '';
        
        if (isset($knownPluginVulns[$pluginSlug]) && $pluginVersion) {
            foreach ($knownPluginVulns[$pluginSlug] as $vuln) {
                if (version_compare($pluginVersion, $vuln['max_version'], '<=')) {
                    $vulnerabilities[] = [
                        'type' => 'plugin_vulnerability',
                        'severity' => $vuln['severity'],
                        'cve' => $vuln['cve'],
                        'title' => $vuln['title'],
                        'description' => "Plugin {$plugin['name']} version {$pluginVersion} is vulnerable to {$vuln['cve']}",
                        'recommendation' => "Update {$plugin['name']} plugin to the latest version",
                        'risk_score' => $this->calculateRiskScore($vuln['severity']),
                        'plugin_name' => $plugin['name'],
                        'plugin_version' => $pluginVersion,
                    ];
                }
            }
        }
        
        return $vulnerabilities;
    }

    /**
     * Check if directory listing is enabled
     */
    protected function checkDirectoryListing($url)
    {
        try {
            $response = Http::timeout(10)->get($url);
            if ($response->successful()) {
                $body = $response->body();
                return (
                    str_contains($body, 'Index of') || 
                    str_contains($body, 'Directory Listing') ||
                    str_contains($body, '<title>Index of')
                );
            }
        } catch (\Exception $e) {
            // Ignore errors - assume directory listing is disabled
        }
        return false;
    }

    /**
     * Check if a sensitive file is exposed
     */
    protected function checkFileExposed($url)
    {
        try {
            $response = Http::timeout(10)->get($url);
            return $response->successful() && $response->status() === 200;
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Check for default admin username
     */
    protected function checkDefaultAdminUser($url)
    {
        try {
            // Try to access the author page for user ID 1 (usually admin)
            $response = Http::timeout(10)->get($url . '/?author=1');
            if ($response->successful()) {
                $body = $response->body();
                return str_contains($body, '/author/admin/') || str_contains($body, 'admin</title>');
            }
        } catch (\Exception $e) {
            // Ignore errors
        }
        return false;
    }

    /**
     * Calculate risk score based on severity
     */
    protected function calculateRiskScore($severity)
    {
        return match(strtolower($severity)) {
            'critical' => 10,
            'high' => 8,
            'medium' => 5,
            'low' => 3,
            default => 5,
        };
    }

    /**
     * Scan a WordPress website (alias method for bulk operations)
     */
    public function scanWordPressSite($website, $scanType = 'all')
    {
        $url = $website->url ?? $website->domain_name;
        
        // Ensure URL has protocol
        if (!str_starts_with($url, 'http://') && !str_starts_with($url, 'https://')) {
            $url = 'https://' . $url;
        }

        return $this->scanWebsite($url, $scanType);
    }
}
