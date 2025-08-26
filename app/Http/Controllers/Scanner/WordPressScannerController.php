<?php

namespace App\Http\Controllers\Scanner;

use App\Http\Controllers\Controller;

use App\Models\WebsiteScan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class WordPressScannerController extends Controller
{
    public function index()
    {
        $scans = WebsiteScan::latest()->take(20)->get();
        
        return Inertia::render('Scanner/Index', [
            'scans' => $scans
        ]);
    }

    public function scan(Request $request)
    {
        $request->validate([
            'url' => 'required|url'
        ]);

        $url = $request->input('url');
        
        // Create scan record
        $scan = WebsiteScan::create([
            'url' => $url,
            'status' => 'pending'
        ]);

        try {
            // Perform the WordPress scan
            $scanResult = $this->performWordPressScan($url);
            
            // Update scan with results
            $scan->update([
                'status' => 'completed',
                'plugins' => $scanResult['plugins'] ?? [],
                'themes' => $scanResult['themes'] ?? [],
                'wordpress_version' => $scanResult['wordpress_version'] ?? null,
                'raw_output' => $scanResult['raw_output'] ?? '',
                'scanned_at' => now()
            ]);

        } catch (\Exception $e) {
            Log::error('WordPress scan failed: ' . $e->getMessage());
            
            $scan->update([
                'status' => 'failed',
                'error_message' => $e->getMessage()
            ]);
        }

        return response()->json([
            'success' => true,
            'scan' => $scan->fresh()
        ]);
    }

    public function show(WebsiteScan $scan)
    {
        return Inertia::render('Scanner/Show', [
            'scan' => $scan
        ]);
    }

    private function performWordPressScan($url)
    {
        // Method 1: Try to detect WordPress using HTTP requests
        $plugins = [];
        $themes = [];
        $wordpressVersion = null;
        $rawOutput = '';

        try {
            // Check if it's a WordPress site
            $response = Http::timeout(30)->get($url);
            $html = $response->body();
            
            // Detect WordPress version
            if (preg_match('/name="generator"\s+content="WordPress\s+([\d.]+)"/i', $html, $matches)) {
                $wordpressVersion = $matches[1];
            }

            // Detect plugins from wp-content/plugins/ links
            if (preg_match_all('/wp-content\/plugins\/([^\/\'"]+)/i', $html, $matches)) {
                $pluginSlugs = array_unique($matches[1]);
                foreach ($pluginSlugs as $slug) {
                    $plugins[] = [
                        'name' => $slug,
                        'slug' => $slug,
                        'version' => 'unknown',
                        'detected_method' => 'html_parsing'
                    ];
                }
            }

            // Detect themes from wp-content/themes/ links
            if (preg_match_all('/wp-content\/themes\/([^\/\'"]+)/i', $html, $matches)) {
                $themeSlugs = array_unique($matches[1]);
                foreach ($themeSlugs as $slug) {
                    $themes[] = [
                        'name' => $slug,
                        'slug' => $slug,
                        'version' => 'unknown',
                        'detected_method' => 'html_parsing'
                    ];
                }
            }

            // Try to get more plugin info from readme files
            $plugins = $this->enrichPluginData($url, $plugins);

            $rawOutput = "WordPress scan completed using HTTP parsing method.\n";
            $rawOutput .= "Plugins found: " . count($plugins) . "\n";
            $rawOutput .= "Themes found: " . count($themes) . "\n";
            $rawOutput .= "WordPress version: " . ($wordpressVersion ?: 'Unknown') . "\n";

        } catch (\Exception $e) {
            throw new \Exception("Failed to scan WordPress site: " . $e->getMessage());
        }

        return [
            'plugins' => $plugins,
            'themes' => $themes,
            'wordpress_version' => $wordpressVersion,
            'raw_output' => $rawOutput
        ];
    }

    private function enrichPluginData($baseUrl, $plugins)
    {
        foreach ($plugins as &$plugin) {
            try {
                // Try to get plugin version from readme.txt
                $readmeUrl = rtrim($baseUrl, '/') . '/wp-content/plugins/' . $plugin['slug'] . '/readme.txt';
                $response = Http::timeout(10)->get($readmeUrl);
                
                if ($response->successful()) {
                    $content = $response->body();
                    
                    // Extract plugin name
                    if (preg_match('/===\s*(.+?)\s*===/i', $content, $matches)) {
                        $plugin['name'] = trim($matches[1]);
                    }
                    
                    // Extract version
                    if (preg_match('/Stable tag:\s*([^\r\n]+)/i', $content, $matches)) {
                        $plugin['version'] = trim($matches[1]);
                    }
                }
            } catch (\Exception $e) {
                // Continue if readme fetch fails
                Log::debug("Could not fetch readme for plugin: " . $plugin['slug']);
            }
        }

        return $plugins;
    }
}
