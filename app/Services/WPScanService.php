<?php

namespace App\Services;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class WPScanService
{
    private $client;
    private $apiToken;
    private $baseUrl;
    
    public function __construct()
    {
        $this->client = new Client([
            'timeout' => 30,
            'verify' => true,
        ]);
        
        $this->apiToken = config('services.wpscan.api_token');
        $this->baseUrl = config('services.wpscan.base_url', 'https://wpscan.com/api/v3');
    }
    
    /**
     * Get vulnerability data for a WordPress version
     */
    public function getWordPressVulnerabilities($version)
    {
        try {
            $cacheKey = "wpscan_wp_vulns_{$version}";
            
            return Cache::remember($cacheKey, 3600, function () use ($version) {
                $response = $this->client->get($this->baseUrl . '/wordpresses/' . $version, [
                    'headers' => [
                        'Authorization' => 'Token token=' . $this->apiToken,
                        'User-Agent' => 'Klioso Scanner v1.0',
                    ],
                ]);
                
                $data = json_decode($response->getBody(), true);
                
                return [
                    'version' => $version,
                    'vulnerabilities' => $data[$version]['vulnerabilities'] ?? [],
                    'total_vulnerabilities' => count($data[$version]['vulnerabilities'] ?? []),
                    'last_updated' => now(),
                ];
            });
        } catch (RequestException $e) {
            Log::error('WPScan API error for WordPress version: ' . $version, [
                'error' => $e->getMessage(),
                'status_code' => $e->getResponse() ? $e->getResponse()->getStatusCode() : null,
            ]);
            
            return [
                'version' => $version,
                'vulnerabilities' => [],
                'total_vulnerabilities' => 0,
                'error' => 'Failed to fetch vulnerability data',
                'last_updated' => now(),
            ];
        }
    }
    
    /**
     * Get vulnerability data for a plugin
     */
    public function getPluginVulnerabilities($pluginSlug)
    {
        try {
            $cacheKey = "wpscan_plugin_vulns_{$pluginSlug}";
            
            return Cache::remember($cacheKey, 3600, function () use ($pluginSlug) {
                $response = $this->client->get($this->baseUrl . '/plugins/' . $pluginSlug, [
                    'headers' => [
                        'Authorization' => 'Token token=' . $this->apiToken,
                        'User-Agent' => 'Klioso Scanner v1.0',
                    ],
                ]);
                
                $data = json_decode($response->getBody(), true);
                
                return [
                    'plugin' => $pluginSlug,
                    'vulnerabilities' => $data[$pluginSlug]['vulnerabilities'] ?? [],
                    'total_vulnerabilities' => count($data[$pluginSlug]['vulnerabilities'] ?? []),
                    'last_updated' => now(),
                ];
            });
        } catch (RequestException $e) {
            Log::error('WPScan API error for plugin: ' . $pluginSlug, [
                'error' => $e->getMessage(),
                'status_code' => $e->getResponse() ? $e->getResponse()->getStatusCode() : null,
            ]);
            
            return [
                'plugin' => $pluginSlug,
                'vulnerabilities' => [],
                'total_vulnerabilities' => 0,
                'error' => 'Failed to fetch vulnerability data',
                'last_updated' => now(),
            ];
        }
    }
    
    /**
     * Get vulnerability data for a theme
     */
    public function getThemeVulnerabilities($themeSlug)
    {
        try {
            $cacheKey = "wpscan_theme_vulns_{$themeSlug}";
            
            return Cache::remember($cacheKey, 3600, function () use ($themeSlug) {
                $response = $this->client->get($this->baseUrl . '/themes/' . $themeSlug, [
                    'headers' => [
                        'Authorization' => 'Token token=' . $this->apiToken,
                        'User-Agent' => 'Klioso Scanner v1.0',
                    ],
                ]);
                
                $data = json_decode($response->getBody(), true);
                
                return [
                    'theme' => $themeSlug,
                    'vulnerabilities' => $data[$themeSlug]['vulnerabilities'] ?? [],
                    'total_vulnerabilities' => count($data[$themeSlug]['vulnerabilities'] ?? []),
                    'last_updated' => now(),
                ];
            });
        } catch (RequestException $e) {
            Log::error('WPScan API error for theme: ' . $themeSlug, [
                'error' => $e->getMessage(),
                'status_code' => $e->getResponse() ? $e->getResponse()->getStatusCode() : null,
            ]);
            
            return [
                'theme' => $themeSlug,
                'vulnerabilities' => [],
                'total_vulnerabilities' => 0,
                'error' => 'Failed to fetch vulnerability data',
                'last_updated' => now(),
            ];
        }
    }
    
    /**
     * Perform comprehensive security scan using WPScan data
     */
    public function performSecurityScan($scanResults)
    {
        $securityReport = [
            'scan_date' => now(),
            'wordpress_vulnerabilities' => [],
            'plugin_vulnerabilities' => [],
            'theme_vulnerabilities' => [],
            'total_vulnerabilities' => 0,
            'severity_breakdown' => [
                'critical' => 0,
                'high' => 0,
                'medium' => 0,
                'low' => 0,
            ],
        ];
        
        // Check WordPress core vulnerabilities
        if (isset($scanResults['wordpress_version'])) {
            $wpVulns = $this->getWordPressVulnerabilities($scanResults['wordpress_version']);
            $securityReport['wordpress_vulnerabilities'] = $wpVulns;
            $securityReport['total_vulnerabilities'] += $wpVulns['total_vulnerabilities'];
            
            foreach ($wpVulns['vulnerabilities'] as $vuln) {
                $this->categorizeVulnerability($vuln, $securityReport['severity_breakdown']);
            }
        }
        
        // Check plugin vulnerabilities
        if (isset($scanResults['plugins'])) {
            foreach ($scanResults['plugins'] as $plugin) {
                $pluginSlug = $this->extractPluginSlug($plugin);
                if ($pluginSlug) {
                    $pluginVulns = $this->getPluginVulnerabilities($pluginSlug);
                    $securityReport['plugin_vulnerabilities'][] = $pluginVulns;
                    $securityReport['total_vulnerabilities'] += $pluginVulns['total_vulnerabilities'];
                    
                    foreach ($pluginVulns['vulnerabilities'] as $vuln) {
                        $this->categorizeVulnerability($vuln, $securityReport['severity_breakdown']);
                    }
                }
            }
        }
        
        // Check theme vulnerabilities
        if (isset($scanResults['themes'])) {
            foreach ($scanResults['themes'] as $theme) {
                $themeSlug = $this->extractThemeSlug($theme);
                if ($themeSlug) {
                    $themeVulns = $this->getThemeVulnerabilities($themeSlug);
                    $securityReport['theme_vulnerabilities'][] = $themeVulns;
                    $securityReport['total_vulnerabilities'] += $themeVulns['total_vulnerabilities'];
                    
                    foreach ($themeVulns['vulnerabilities'] as $vuln) {
                        $this->categorizeVulnerability($vuln, $securityReport['severity_breakdown']);
                    }
                }
            }
        }
        
        return $securityReport;
    }
    
    /**
     * Check API status and remaining requests
     */
    public function getApiStatus()
    {
        try {
            $response = $this->client->get($this->baseUrl . '/status', [
                'headers' => [
                    'Authorization' => 'Token token=' . $this->apiToken,
                    'User-Agent' => 'Klioso Scanner v1.0',
                ],
            ]);
            
            return json_decode($response->getBody(), true);
        } catch (RequestException $e) {
            Log::error('WPScan API status check failed', [
                'error' => $e->getMessage(),
            ]);
            
            return [
                'error' => 'Failed to check API status',
                'requests_remaining' => 0,
            ];
        }
    }
    
    /**
     * Extract plugin slug from plugin data
     */
    private function extractPluginSlug($plugin)
    {
        if (is_array($plugin) && isset($plugin['slug'])) {
            return $plugin['slug'];
        }
        
        if (is_array($plugin) && isset($plugin['name'])) {
            return strtolower(str_replace([' ', '_'], '-', $plugin['name']));
        }
        
        if (is_string($plugin)) {
            return strtolower(str_replace([' ', '_'], '-', $plugin));
        }
        
        return null;
    }
    
    /**
     * Extract theme slug from theme data
     */
    private function extractThemeSlug($theme)
    {
        if (is_array($theme) && isset($theme['slug'])) {
            return $theme['slug'];
        }
        
        if (is_array($theme) && isset($theme['name'])) {
            return strtolower(str_replace([' ', '_'], '-', $theme['name']));
        }
        
        if (is_string($theme)) {
            return strtolower(str_replace([' ', '_'], '-', $theme));
        }
        
        return null;
    }
    
    /**
     * Categorize vulnerability by severity
     */
    private function categorizeVulnerability($vulnerability, &$severityBreakdown)
    {
        $severity = strtolower($vulnerability['severity'] ?? 'medium');
        
        if (isset($severityBreakdown[$severity])) {
            $severityBreakdown[$severity]++;
        } else {
            $severityBreakdown['medium']++;
        }
    }
}
