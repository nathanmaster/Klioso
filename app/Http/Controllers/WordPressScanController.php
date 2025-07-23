<?php

namespace App\Http\Controllers;

use App\Models\Website;
use App\Models\Plugin;
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
     * Perform WordPress scan
     */
    public function scan(Request $request)
    {
        // Debug: Log the incoming request data
        Log::info('WordPress scan request received', [
            'all_data' => $request->all(),
            'url' => $request->input('url'),
            'scan_type' => $request->input('scan_type'),
            'content_type' => $request->header('Content-Type'),
        ]);

        $validator = Validator::make($request->all(), [
            'url' => 'required|url',
            'scan_type' => 'nullable|in:plugins,themes,vulnerabilities,all',
        ]);

        if ($validator->fails()) {
            Log::warning('WordPress scan validation failed', [
                'errors' => $validator->errors(),
                'input' => $request->all(),
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $url = $request->input('url');
        $scanType = $request->input('scan_type', 'plugins');

        try {
            // Perform the scan
            $scanResults = $this->scanService->scanWebsite($url, $scanType);
            
            // If scanning for plugins, try to match them with our database
            if ($scanType === 'plugins' || $scanType === 'all') {
                $scanResults['plugins'] = $this->matchPluginsToDatabase($scanResults['plugins'] ?? []);
            }

            return response()->json([
                'success' => true,
                'data' => $scanResults,
                'scanned_url' => $url,
                'scan_type' => $scanType,
                'scanned_at' => now()->toISOString(),
            ]);

        } catch (\Exception $e) {
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
}
