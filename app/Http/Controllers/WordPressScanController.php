<?php

namespace App\Http\Controllers;

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
        $query = ScanHistory::with('website')
            ->orderBy('created_at', 'desc');

        // Apply filters if provided
        if ($request->has('type') && $request->type !== 'all') {
            $query->where('scan_type', $request->type);
        }

        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->has('search') && $request->search) {
            $query->where('target', 'like', '%' . $request->search . '%');
        }

        $scanHistory = $query->paginate(20)->withQueryString();

        return Inertia::render('Scanner/History', [
            'scanHistory' => $scanHistory,
            'filters' => [
                'type' => $request->get('type', 'all'),
                'status' => $request->get('status', 'all'),
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
}
