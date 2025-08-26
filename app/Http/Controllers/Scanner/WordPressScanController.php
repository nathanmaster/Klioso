<?php

namespace App\Http\Controllers\Scanner;

use App\Http\Controllers\Controller;

use App\Models\Website;
use App\Models\Plugin;
use App\Models\ScanHistory;
use App\Services\WordPressScanService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class WordPressScanController extends Controller
{
    protected $scanService;

    public function __construct(WordPressScanService $scanService)
    {
        $this->scanService = $scanService;
    }

    /**
     * Show the WordPress scanner page
     */
    public function index()
    {
        $websites = Website::with('client')->get()->map(function ($website) {
            return [
                'id' => $website->id,
                'domain_name' => $website->domain_name,
                'platform' => $website->platform,
                'client_name' => $website->client ? $website->client->name : null,
            ];
        });

        return Inertia::render('Scanner/Index', [
            'websites' => $websites,
        ]);
    }

    /**
     * Show scan history page
     */
    public function history(Request $request)
    {
        $query = ScanHistory::with(['website', 'scheduledScan'])
            ->orderBy('created_at', 'desc');

        // Apply filters if provided
        if ($request->has('type') && $request->type !== 'all') {
            $query->where('scan_type', $request->type);
        }

        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->has('trigger') && $request->trigger !== 'all') {
            $query->where('scan_trigger', $request->trigger);
        }

        if ($request->has('search') && $request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('target', 'like', '%' . $request->search . '%')
                  ->orWhereHas('scheduledScan', function ($sq) use ($request) {
                      $sq->where('name', 'like', '%' . $request->search . '%');
                  });
            });
        }

        $scanHistory = $query->paginate(20)->withQueryString();

        // Transform data for frontend
        $scanHistory->getCollection()->transform(function ($scan) {
            return [
                'id' => $scan->id,
                'scan_type' => $scan->scan_type,
                'scan_trigger' => $scan->scan_trigger,
                'scan_source' => $scan->scan_source,
                'target' => $scan->target,
                'website' => $scan->website ? [
                    'id' => $scan->website->id,
                    'domain_name' => $scan->website->domain_name,
                ] : null,
                'scheduled_scan' => $scan->scheduledScan ? [
                    'id' => $scan->scheduledScan->id,
                    'name' => $scan->scheduledScan->name,
                ] : null,
                'plugins_found' => $scan->plugins_found,
                'themes_found' => $scan->themes_found,
                'vulnerabilities_found' => $scan->vulnerabilities_found,
                'total_items_found' => $scan->total_items_found,
                'auto_sync_enabled' => $scan->auto_sync_enabled,
                'plugins_added_to_db' => $scan->plugins_added_to_db,
                'status' => $scan->status,
                'error_message' => $scan->error_message,
                'scan_duration_ms' => $scan->scan_duration_ms,
                'scan_results' => $scan->scan_results, // Add the actual scan results
                'scan_summary' => $scan->scan_summary, // Add the scan summary
                'duration' => $scan->duration,
                'formatted_date' => $scan->formatted_date,
                'relative_time' => $scan->relative_time,
                'created_at' => $scan->created_at,
            ];
        });

        return Inertia::render('Scanner/History', [
            'scanHistory' => $scanHistory,
            'filters' => [
                'type' => $request->get('type', 'all'),
                'status' => $request->get('status', 'all'),
                'trigger' => $request->get('trigger', 'all'),
                'search' => $request->get('search', '')
            ]
        ]);
    }

    /**
     * Export scan results to CSV or JSON
     */
    public function export(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'scan_id' => 'required|exists:scan_history,id',
            'format' => 'required|in:csv,json'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $scan = ScanHistory::findOrFail($request->scan_id);
        $format = $request->format;
        
        $filename = 'scan_' . $scan->id . '_' . date('Y-m-d_H-i-s') . '.' . $format;

        if ($format === 'csv') {
            return $this->exportToCsv($scan, $filename);
        } else {
            return $this->exportToJson($scan, $filename);
        }
    }

    /**
     * Export scan results to CSV format
     */
    private function exportToCsv($scan, $filename)
    {
        $csvData = [];
        $results = $scan->scan_results;

        // Add header row
        $csvData[] = [
            'Type', 'Name', 'Slug', 'Description', 'Version', 'Status', 
            'Active', 'In Database', 'Is Paid', 'Last Updated'
        ];

        // Add plugins
        if (isset($results['plugins']) && is_array($results['plugins'])) {
            foreach ($results['plugins'] as $plugin) {
                $csvData[] = [
                    'Plugin',
                    $plugin['name'] ?? '',
                    $plugin['slug'] ?? '',
                    $plugin['description'] ?? '',
                    $plugin['version'] ?? '',
                    $plugin['status'] ?? '',
                    isset($plugin['active']) ? ($plugin['active'] ? 'Yes' : 'No') : 'Unknown',
                    isset($plugin['in_database']) ? ($plugin['in_database'] ? 'Yes' : 'No') : 'No',
                    isset($plugin['is_paid']) ? ($plugin['is_paid'] ? 'Yes' : 'No') : 'Unknown',
                    $plugin['last_updated'] ?? ''
                ];
            }
        }

        // Add themes
        if (isset($results['themes']) && is_array($results['themes'])) {
            foreach ($results['themes'] as $theme) {
                $csvData[] = [
                    'Theme',
                    $theme['name'] ?? '',
                    $theme['slug'] ?? '',
                    $theme['description'] ?? '',
                    $theme['version'] ?? '',
                    $theme['status'] ?? '',
                    isset($theme['active']) ? ($theme['active'] ? 'Yes' : 'No') : 'Unknown',
                    'No', // Themes not stored in database yet
                    'Unknown',
                    $theme['last_updated'] ?? ''
                ];
            }
        }

        // Add vulnerabilities
        if (isset($results['vulnerabilities']) && is_array($results['vulnerabilities'])) {
            foreach ($results['vulnerabilities'] as $vuln) {
                $csvData[] = [
                    'Vulnerability',
                    $vuln['title'] ?? '',
                    $vuln['plugin_slug'] ?? '',
                    $vuln['description'] ?? '',
                    $vuln['affected_version'] ?? '',
                    $vuln['severity'] ?? '',
                    'N/A',
                    'N/A',
                    'N/A',
                    $vuln['published'] ?? ''
                ];
            }
        }

        $callback = function() use ($csvData) {
            $file = fopen('php://output', 'w');
            foreach ($csvData as $row) {
                fputcsv($file, $row);
            }
            fclose($file);
        };

        return response()->stream($callback, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ]);
    }

    /**
     * Export scan results to JSON format
     */
    private function exportToJson($scan, $filename)
    {
        $exportData = [
            'scan_info' => [
                'id' => $scan->id,
                'scan_type' => $scan->scan_type,
                'target' => $scan->target,
                'status' => $scan->status,
                'scanned_at' => $scan->created_at->toISOString(),
                'duration' => $scan->duration,
                'summary' => [
                    'plugins_found' => $scan->plugins_found,
                    'themes_found' => $scan->themes_found,
                    'vulnerabilities_found' => $scan->vulnerabilities_found,
                    'total_items' => $scan->total_items_found
                ]
            ],
            'scan_results' => $scan->scan_results,
            'exported_at' => now()->toISOString(),
            'exported_by' => auth()->user()->name ?? 'Unknown'
        ];

        return response()->json($exportData)
            ->header('Content-Type', 'application/json')
            ->header('Content-Disposition', 'attachment; filename="' . $filename . '"');
    }

    /**
     * Perform WordPress scan
     */
    public function scan(Request $request)
    {
        // Debug: Log the incoming request data (sanitized)
        $url = $request->input('url');
        $domain = $url ? parse_url($url, PHP_URL_HOST) : null;
        
        Log::info('WordPress scan request received', [
            'domain' => $domain,
            'scan_type' => $request->input('scan_type'),
            'content_type' => $request->header('Content-Type'),
            'has_url' => !empty($url),
        ]);

        $validator = Validator::make($request->all(), [
            'url' => 'required|url',
            'scan_type' => 'nullable|in:plugins,themes,vulnerabilities,all',
        ]);

        if ($validator->fails()) {
            Log::warning('WordPress scan validation failed', [
                'errors' => $validator->errors(),
                'domain' => $domain,
                'scan_type' => $request->input('scan_type'),
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $url = $request->input('url');
        $scanType = $request->input('scan_type', 'plugins');
        $startTime = microtime(true);

        try {
            // Perform the scan
            $scanResults = $this->scanService->scanWebsite($url, $scanType);
            
            // If scanning for plugins, try to match them with our database
            if ($scanType === 'plugins' || $scanType === 'all') {
                $scanResults['plugins'] = $this->matchPluginsToDatabase($scanResults['plugins'] ?? []);
            }

            $endTime = microtime(true);
            $scanDurationMs = round(($endTime - $startTime) * 1000);

            // Save scan history
            $this->saveScanHistory([
                'scan_type' => 'url',
                'scan_trigger' => 'manual',
                'target' => $url,
                'website_id' => null,
                'scan_results' => $scanResults,
                'scan_summary' => [
                    'url' => $url,
                    'scan_type' => $scanType,
                    'scanned_at' => now()->toISOString(),
                ],
                'plugins_found' => count($scanResults['plugins'] ?? []),
                'themes_found' => count($scanResults['themes'] ?? []),
                'vulnerabilities_found' => count($scanResults['vulnerabilities'] ?? []),
                'auto_sync_enabled' => false,
                'plugins_added_to_db' => 0,
                'status' => 'completed',
                'scan_duration_ms' => $scanDurationMs,
                'scan_started_at' => now()->subMilliseconds($scanDurationMs),
                'scan_completed_at' => now(),
            ]);

            return response()->json([
                'success' => true,
                'data' => $scanResults,
                'scanned_url' => $url,
                'scan_type' => $scanType,
                'scanned_at' => now()->toISOString(),
                'scan_duration' => $scanDurationMs . 'ms',
            ]);

        } catch (\Exception $e) {
            $endTime = microtime(true);
            $scanDurationMs = round(($endTime - $startTime) * 1000);

            // Save failed scan history
            $this->saveScanHistory([
                'scan_type' => 'url',
                'scan_trigger' => 'manual',
                'target' => $url,
                'website_id' => null,
                'scan_results' => [],
                'scan_summary' => [
                    'url' => $url,
                    'scan_type' => $scanType,
                    'error' => $e->getMessage(),
                ],
                'plugins_found' => 0,
                'themes_found' => 0,
                'vulnerabilities_found' => 0,
                'auto_sync_enabled' => false,
                'plugins_added_to_db' => 0,
                'status' => 'failed',
                'error_message' => $e->getMessage(),
                'scan_duration_ms' => $scanDurationMs,
                'scan_started_at' => now()->subMilliseconds($scanDurationMs),
                'scan_completed_at' => now(),
                'error_message' => $e->getMessage(),
                'scan_duration_ms' => $scanDurationMs,
            ]);

            Log::error('WordPress scan failed', [
                'url' => $url,
                'scan_type' => $scanType,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Scan failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Scan a website from the database
     */
    public function scanWebsite(Request $request, Website $website)
    {
        $scanType = $request->input('scan_type', 'plugins');
        
        try {
            $url = $this->buildWebsiteUrl($website->domain_name);
            $scanResults = $this->scanService->scanWebsite($url, $scanType);
            
            if ($scanType === 'plugins' || $scanType === 'all') {
                $scanResults['plugins'] = $this->matchPluginsToDatabase($scanResults['plugins'] ?? []);
                
                // Optionally auto-sync discovered plugins
                if ($request->input('auto_sync', false)) {
                    $this->syncPluginsToWebsite($website, $scanResults['plugins']);
                }
            }

            return response()->json([
                'success' => true,
                'data' => $scanResults,
                'website' => [
                    'id' => $website->id,
                    'domain_name' => $website->domain_name,
                ],
                'scanned_url' => $url,
                'scan_type' => $scanType,
                'scanned_at' => now()->toISOString(),
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Scan failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Match discovered plugins with our database
     */
    private function matchPluginsToDatabase($discoveredPlugins)
    {
        $plugins = Plugin::all()->keyBy('name');
        $matchedPlugins = [];

        foreach ($discoveredPlugins as $plugin) {
            $pluginName = $plugin['name'] ?? '';
            $matchedPlugin = $plugins->get($pluginName);

            $matchedPlugins[] = [
                'name' => $pluginName,
                'version' => $plugin['version'] ?? null,
                'slug' => $plugin['slug'] ?? null,
                'status' => $plugin['status'] ?? 'unknown',
                'in_database' => $matchedPlugin !== null,
                'database_id' => $matchedPlugin ? $matchedPlugin->id : null,
                'is_paid' => $matchedPlugin ? $matchedPlugin->is_paid : null,
                'description' => $matchedPlugin ? $matchedPlugin->description : ($plugin['description'] ?? null),
                'vulnerabilities' => $plugin['vulnerabilities'] ?? [],
            ];
        }

        return $matchedPlugins;
    }

    /**
     * Sync discovered plugins to website
     */
    private function syncPluginsToWebsite(Website $website, $plugins)
    {
        foreach ($plugins as $plugin) {
            if ($plugin['in_database'] && $plugin['database_id']) {
                // Check if plugin is already attached
                if (!$website->plugins()->where('plugin_id', $plugin['database_id'])->exists()) {
                    $website->plugins()->attach($plugin['database_id'], [
                        'version' => $plugin['version'],
                        'is_active' => $plugin['status'] === 'active',
                    ]);
                } else {
                    // Update existing plugin version
                    $website->plugins()->updateExistingPivot($plugin['database_id'], [
                        'version' => $plugin['version'],
                        'is_active' => $plugin['status'] === 'active',
                    ]);
                }
            }
        }
    }

    /**
     * Build proper URL from domain name
     */
    private function buildWebsiteUrl($domainName)
    {
        if (!str_starts_with($domainName, 'http://') && !str_starts_with($domainName, 'https://')) {
            return 'https://' . $domainName;
        }
        return $domainName;
    }

    /**
     * Add discovered plugin to database
     */
    public function addPlugin(Request $request)
    {
        $request->validate([
            'name' => 'required|string|unique:plugins,name',
            'description' => 'nullable|string',
            'slug' => 'nullable|string',
        ]);

        $plugin = Plugin::create([
            'name' => $request->input('name'),
            'description' => $request->input('description'),
            'is_paid' => false, // Default to free, can be updated later
            'install_source' => 'WordPress Repository', // Default source
        ]);

        return response()->json([
            'success' => true,
            'plugin' => $plugin,
        ]);
    }

    /**
     * Bulk add multiple discovered plugins to database
     */
    public function bulkAddPlugins(Request $request)
    {
        $request->validate([
            'plugins' => 'required|array',
            'plugins.*.name' => 'required|string',
            'plugins.*.description' => 'nullable|string',
            'plugins.*.slug' => 'nullable|string',
        ]);

        $addedPlugins = [];
        $errors = [];

        foreach ($request->input('plugins') as $pluginData) {
            try {
                // Check if plugin already exists
                $existingPlugin = Plugin::where('name', $pluginData['name'])->first();
                
                if ($existingPlugin) {
                    $addedPlugins[] = $existingPlugin;
                    continue;
                }

                $plugin = Plugin::create([
                    'name' => $pluginData['name'],
                    'description' => $pluginData['description'] ?? null,
                    'is_paid' => false, // Default to free, can be updated later
                    'install_source' => 'WordPress Repository', // Default source
                ]);

                $addedPlugins[] = $plugin;

            } catch (\Exception $e) {
                $errors[] = [
                    'plugin' => $pluginData['name'],
                    'error' => $e->getMessage()
                ];
            }
        }

        return response()->json([
            'success' => true,
            'plugins' => $addedPlugins,
            'errors' => $errors,
            'message' => count($addedPlugins) . ' plugins processed successfully'
        ]);
    }

    /**
     * Save scan history to database
     */
    private function saveScanHistory(array $data)
    {
        try {
            ScanHistory::create($data);
        } catch (\Exception $e) {
            Log::error('Failed to save scan history', [
                'error' => $e->getMessage(),
                'data' => $data
            ]);
        }
    }

    /**
     * Bulk scan multiple websites
     */
    public function bulkScan(Request $request)
    {
        $validated = $request->validate([
            'website_ids' => 'required|array',
            'website_ids.*' => 'exists:websites,id',
            'scan_config' => 'required|array',
        ]);

        $websiteIds = $validated['website_ids'];
        $scanConfig = $validated['scan_config'];
        
        // Set execution time limit for bulk operations
        set_time_limit(300); // 5 minutes max
        
        $results = [];
        $successCount = 0;
        $errorCount = 0;
        $startTime = microtime(true);
        $maxExecutionTime = 240; // 4 minutes to leave buffer

        foreach ($websiteIds as $index => $websiteId) {
            // Check if we're approaching time limit
            $elapsedTime = microtime(true) - $startTime;
            if ($elapsedTime > $maxExecutionTime) {
                Log::warning('Bulk scan timeout approaching, stopping early', [
                    'processed' => $index,
                    'total' => count($websiteIds),
                    'elapsed_time' => $elapsedTime
                ]);
                break;
            }
            
            try {
                $website = Website::find($websiteId);
                
                // Determine the URL to scan
                $url = $website->url ?? $website->domain_name;
                if (!str_starts_with($url, 'http')) {
                    $url = 'https://' . $url;
                }

                $scanResult = $this->scanService->scanWordPressSite($website);

                // Save scan history
                $historyData = [
                    'scan_type' => 'bulk_scan',
                    'scan_trigger' => 'manual',
                    'target' => $url,
                    'website_id' => $websiteId,
                    'scan_results' => $scanResult,
                    'scan_summary' => [
                        'plugins_found' => count($scanResult['plugins'] ?? []),
                        'themes_found' => count($scanResult['themes'] ?? []),
                        'vulnerabilities_found' => count($scanResult['vulnerabilities'] ?? []),
                        'wordpress_version' => $scanResult['wp_version'] ?? null,
                    ],
                    'plugins_found' => count($scanResult['plugins'] ?? []),
                    'themes_found' => count($scanResult['themes'] ?? []),
                    'vulnerabilities_found' => count($scanResult['vulnerabilities'] ?? []),
                    'auto_sync_enabled' => false,
                    'plugins_added_to_db' => 0,
                    'status' => 'completed',
                    'scan_duration_ms' => ($scanResult['scan_duration'] ?? 0) * 1000,
                    'scan_started_at' => now()->subSeconds($scanResult['scan_duration'] ?? 0),
                    'scan_completed_at' => now(),
                ];

                $this->saveScanHistory($historyData);

                // Update website last scan
                $website->update([
                    'last_scan' => now(),
                    'wordpress_version' => $scanResult['wordpress_version'] ?? $website->wordpress_version,
                ]);

                $results[] = [
                    'website_id' => $websiteId,
                    'website_name' => $website->display_name,
                    'url' => $url,
                    'success' => true,
                    'data' => $scanResult
                ];

                $successCount++;

            } catch (\Exception $e) {
                Log::error('Bulk scan failed for website', [
                    'website_id' => $websiteId,
                    'url' => $url ?? 'unknown',
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);

                // Save failed scan history with correct structure
                $historyData = [
                    'scan_type' => 'bulk_scan',
                    'scan_trigger' => 'manual',
                    'target' => $url ?? 'unknown',
                    'website_id' => $websiteId,
                    'scan_results' => ['error' => $e->getMessage()],
                    'scan_summary' => [
                        'plugins_found' => 0,
                        'themes_found' => 0,
                        'vulnerabilities_found' => 0,
                        'error' => $e->getMessage(),
                    ],
                    'plugins_found' => 0,
                    'themes_found' => 0,
                    'vulnerabilities_found' => 0,
                    'auto_sync_enabled' => false,
                    'plugins_added_to_db' => 0,
                    'status' => 'failed',
                    'error_message' => $e->getMessage(),
                    'scan_duration_ms' => 0,
                    'scan_started_at' => now(),
                    'scan_completed_at' => now(),
                ];

                $this->saveScanHistory($historyData);

                $website = Website::find($websiteId);
                $results[] = [
                    'website_id' => $websiteId,
                    'website_name' => $website->display_name ?? 'Unknown Website',
                    'url' => $url ?? 'unknown',
                    'success' => false,
                    'error' => $e->getMessage()
                ];

                $errorCount++;
            }
        }

        $totalWebsites = count($websiteIds);
        $message = "Bulk scan completed: {$successCount} successful, {$errorCount} failed out of {$totalWebsites} websites.";

        return back()->with('success', $message);
    }
}
