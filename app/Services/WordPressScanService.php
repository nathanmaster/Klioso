<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WordPressScanService
{
    protected $timeout = 30;
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
                'error' => $e->getMessage(),
            ]);
            $results['errors'][] = $e->getMessage();
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

            $content = $response->body();
            
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
            $loginResponse = Http::timeout($this->timeout)
                ->withUserAgent($this->userAgent)
                ->get($url . '/wp-admin/');
            
            if ($loginResponse->successful() && strpos($loginResponse->body(), 'wp-login') !== false) {
                return true;
            }

            return false;

        } catch (\Exception $e) {
            Log::warning('Failed to detect WordPress', ['url' => $url, 'error' => $e->getMessage()]);
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

            $content = $response->body();
            
            // Look for version in meta generator tag
            if (preg_match('/name=["\']generator["\'] content=["\']WordPress ([0-9.]+)["\']/', $content, $matches)) {
                return $matches[1];
            }

            // Look for version in readme.html
            $readmeResponse = Http::timeout($this->timeout)
                ->withUserAgent($this->userAgent)
                ->get($url . '/readme.html');
            
            if ($readmeResponse->successful()) {
                $readmeContent = $readmeResponse->body();
                if (preg_match('/Version ([0-9.]+)/', $readmeContent, $matches)) {
                    return $matches[1];
                }
            }

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

            if ($response->successful()) {
                $content = $response->body();
                
                // Look for directory links
                preg_match_all('/<a href="([^"]+)\/?">[^<]*([^\/]+)\/?<\/a>/', $content, $matches);
                
                if (!empty($matches[1])) {
                    foreach ($matches[1] as $index => $pluginSlug) {
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

        } catch (\Exception $e) {
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

            if ($response->successful()) {
                $content = $response->body();
                
                // Look for plugin references in wp-content/plugins/
                preg_match_all('/wp-content\/plugins\/([^\/\'"?]+)/', $content, $matches);
                
                if (!empty($matches[1])) {
                    foreach (array_unique($matches[1]) as $pluginSlug) {
                        $plugins[] = [
                            'name' => $this->formatPluginName($pluginSlug),
                            'slug' => $pluginSlug,
                            'status' => 'active',
                            'version' => $this->getPluginVersion($url, $pluginSlug),
                        ];
                    }
                }
            }

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

        foreach ($commonPlugins as $pluginSlug) {
            try {
                $response = Http::timeout(5) // Shorter timeout for individual checks
                    ->withUserAgent($this->userAgent)
                    ->get($url . '/wp-content/plugins/' . $pluginSlug . '/');

                if ($response->successful()) {
                    $plugins[] = [
                        'name' => $this->formatPluginName($pluginSlug),
                        'slug' => $pluginSlug,
                        'status' => 'active',
                        'version' => $this->getPluginVersion($url, $pluginSlug),
                    ];
                }

            } catch (\Exception $e) {
                // Plugin not found or not accessible, continue
                continue;
            }
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

            if ($readmeResponse->successful()) {
                $content = $readmeResponse->body();
                
                if (preg_match('/Stable tag:\s*([0-9.]+)/', $content, $matches)) {
                    return $matches[1];
                }
                
                if (preg_match('/Version:\s*([0-9.]+)/', $content, $matches)) {
                    return $matches[1];
                }
            }

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

            if ($response->successful()) {
                $content = $response->body();
                
                // Look for theme references
                preg_match_all('/wp-content\/themes\/([^\/\'"?]+)/', $content, $matches);
                
                if (!empty($matches[1])) {
                    foreach (array_unique($matches[1]) as $themeSlug) {
                        $themes[] = [
                            'name' => $this->formatPluginName($themeSlug),
                            'slug' => $themeSlug,
                            'status' => 'active',
                        ];
                    }
                }
            }

        } catch (\Exception $e) {
            Log::warning('Theme scan failed', ['url' => $url, 'error' => $e->getMessage()]);
        }

        return $themes;
    }

    /**
     * Scan for vulnerabilities (placeholder - would integrate with actual vulnerability database)
     */
    protected function scanVulnerabilities($url)
    {
        $vulnerabilities = [];
        
        // This is a placeholder. In a real implementation, you would:
        // 1. Integrate with WPScan vulnerability database
        // 2. Check against CVE databases
        // 3. Use APIs like WPVulnDB
        
        // For now, return empty array
        return $vulnerabilities;
    }
}
