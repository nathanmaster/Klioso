<?php

namespace App\Http\Controllers;

use App\Models\ScheduledScan;
use App\Models\ScanHistory;
use App\Models\Website;
use App\Services\WordPressScanService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Illuminate\Validation\Rule;

class ScheduledScanController extends Controller
{
    protected $scanService;

    public function __construct(WordPressScanService $scanService)
    {
        $this->scanService = $scanService;
    }
    /**
     * Display a listing of scheduled scans.
     */
    public function index()
    {
        // Reset any stuck progress before displaying
        ScheduledScan::where('status', 'running')
            ->where('started_at', '<', now()->subMinutes(30))
            ->each(function ($scan) {
                $scan->resetStuckProgress();
            });

        $scheduledScans = ScheduledScan::with('website')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($scan) {
                return [
                    'id' => $scan->id,
                    'name' => $scan->name,
                    'scan_type' => $scan->scan_type,
                    'target' => $scan->target,
                    'website' => $scan->website ? [
                        'id' => $scan->website->id,
                        'domain_name' => $scan->website->domain_name,
                    ] : null,
                    'frequency' => $scan->frequency,
                    'scheduled_time' => $scan->scheduled_time->format('H:i'),
                    'is_active' => $scan->is_active,
                    
                    // Enhanced status information
                    ...$scan->detailed_status,
                    
                    // Enhanced stats
                    ...$scan->stats,
                    
                    // Formatted timestamps
                    'last_run_formatted' => $scan->last_run_at?->format('M j, Y \a\t g:i A'),
                    'next_run_formatted' => $scan->next_run_at?->format('M j, Y \a\t g:i A'),
                    'last_run_relative' => $scan->last_run_at?->diffForHumans(),
                    'next_run_relative' => $scan->next_run_at?->diffForHumans(),
                    
                    'created_at' => $scan->created_at,
                    'updated_at' => $scan->updated_at,
                ];
            });

        $websites = Website::select('id', 'domain_name')->get();

        return Inertia::render('Scheduled/Index', [
            'scheduledScans' => $scheduledScans,
            'websites' => $websites,
        ]);
    }

    /**
     * Store a newly created scheduled scan in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'scan_type' => 'required|in:url,website',
            'target' => 'required_if:scan_type,url|nullable|url',
            'website_id' => 'required_if:scan_type,website|nullable|exists:websites,id',
            'frequency' => 'required|in:daily,weekly,monthly',
            'scheduled_time' => 'required|date_format:H:i',
            'scan_config' => 'required|json',
            'is_active' => 'boolean',
        ]);

        // Set target based on scan type
        if ($validated['scan_type'] === 'website' && $validated['website_id']) {
            $website = Website::find($validated['website_id']);
            $validated['target'] = $website->domain_name ?? 'website';
        }

        // Set default is_active if not provided
        $validated['is_active'] = $validated['is_active'] ?? true;

        $scheduledScan = ScheduledScan::create($validated);

        return redirect()->route('scheduled-scans.index')
            ->with('success', 'Scheduled scan created successfully.');
    }

    /**
     * Show the form for editing the specified scheduled scan.
     */
    public function edit(ScheduledScan $scheduledScan)
    {
        $scheduledScan->load('website');
        $websites = Website::select('id', 'domain_name')->get();

        return Inertia::render('Scheduled/Edit', [
            'scheduledScan' => [
                'id' => $scheduledScan->id,
                'name' => $scheduledScan->name,
                'scan_type' => $scheduledScan->scan_type,
                'target' => $scheduledScan->target,
                'website_id' => $scheduledScan->website_id,
                'website' => $scheduledScan->website ? [
                    'id' => $scheduledScan->website->id,
                    'domain_name' => $scheduledScan->website->domain_name,
                ] : null,
                'frequency' => $scheduledScan->frequency,
                'scheduled_time' => $scheduledScan->scheduled_time,
                'scan_config' => $scheduledScan->scan_config, // Raw JSON string for editing
                'is_active' => $scheduledScan->is_active,
                'status' => $scheduledScan->status,
                'status_label' => $scheduledScan->status_label,
                'status_color' => $scheduledScan->status_color,
                'started_at' => $scheduledScan->started_at,
                'current_stage' => $scheduledScan->current_stage,
                'progress_percent' => $scheduledScan->progress_percent,
                'is_running' => $scheduledScan->isRunning(),
                'is_queued' => $scheduledScan->isQueued(),
                'is_busy' => $scheduledScan->isBusy(),
                'last_run_at' => $scheduledScan->last_run_at,
                'next_run_at' => $scheduledScan->next_run_at,
                'total_runs' => $scheduledScan->total_runs,
                'successful_runs' => $scheduledScan->successful_runs,
                'failed_runs' => $scheduledScan->failed_runs,
                'last_error' => $scheduledScan->last_error,
                'created_at' => $scheduledScan->created_at,
                'updated_at' => $scheduledScan->updated_at,
            ],
            'websites' => $websites,
        ]);
    }

    /**
     * Display the specified scheduled scan.
     */
    public function show(ScheduledScan $scheduledScan)
    {
        $scheduledScan->load('website');
        
        // Reset stuck progress before showing details
        $scheduledScan->resetStuckProgress();

        // Get recent scan history for this scheduled scan
        $scanHistory = ScanHistory::with('website')
            ->where('scheduled_scan_id', $scheduledScan->id)
            ->orderBy('created_at', 'desc')
            ->take(20)
            ->get()
            ->map(function ($scan) {
                return [
                    'id' => $scan->id,
                    'target' => $scan->target,
                    'scan_type' => $scan->scan_type,
                    'scan_trigger' => $scan->scan_trigger,
                    'scan_source' => $scan->scan_source,
                    'status' => $scan->status,
                    'plugins_found' => $scan->plugins_found,
                    'themes_found' => $scan->themes_found,
                    'vulnerabilities_found' => $scan->vulnerabilities_found,
                    'scan_duration_ms' => $scan->scan_duration_ms,
                    'duration' => $scan->duration,
                    'error_message' => $scan->error_message,
                    'formatted_date' => $scan->formatted_date,
                    'relative_time' => $scan->relative_time,
                    'created_at' => $scan->created_at,
                ];
            });

        return Inertia::render('Scheduled/Show', [
            'scheduledScan' => [
                'id' => $scheduledScan->id,
                'name' => $scheduledScan->name,
                'scan_type' => $scheduledScan->scan_type,
                'target' => $scheduledScan->target,
                'website' => $scheduledScan->website ? [
                    'id' => $scheduledScan->website->id,
                    'domain_name' => $scheduledScan->website->domain_name,
                ] : null,
                'frequency' => $scheduledScan->frequency,
                'frequency_label' => $scheduledScan->frequency_label,
                'scheduled_time' => $scheduledScan->scheduled_time->format('H:i'),
                'scan_config' => $scheduledScan->scan_config,
                'is_active' => $scheduledScan->is_active,
                
                // Enhanced status and progress
                ...$scheduledScan->detailed_status,
                
                // Enhanced stats
                ...$scheduledScan->stats,
                
                // Formatted timestamps
                'last_run_formatted' => $scheduledScan->last_run_at?->format('M j, Y \a\t g:i A'),
                'next_run_formatted' => $scheduledScan->next_run_at?->format('M j, Y \a\t g:i A'),
                'last_run_relative' => $scheduledScan->last_run_at?->diffForHumans(),
                'next_run_relative' => $scheduledScan->next_run_at?->diffForHumans(),
                
                'created_at' => $scheduledScan->created_at,
                'updated_at' => $scheduledScan->updated_at,
            ],
            'scanHistory' => $scanHistory,
        ]);
    }

    /**
     * Update the specified scheduled scan in storage.
     */
    public function update(Request $request, ScheduledScan $scheduledScan)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'scan_type' => 'required|in:url,website',
            'target' => 'required_if:scan_type,url|nullable|url',
            'website_id' => 'required_if:scan_type,website|nullable|exists:websites,id',
            'frequency' => 'required|in:daily,weekly,monthly',
            'scheduled_time' => 'required|date_format:H:i',
            'scan_config' => 'required|json',
            'is_active' => 'boolean',
        ]);

        // Set target based on scan type
        if ($validated['scan_type'] === 'website' && $validated['website_id']) {
            $website = Website::find($validated['website_id']);
            $validated['target'] = $website->domain_name ?? 'website';
        }

        $scheduledScan->update($validated);

        return redirect()->route('scheduled-scans.index')
            ->with('success', 'Scheduled scan updated successfully.');
    }

    /**
     * Remove the specified scheduled scan from storage.
     */
    public function destroy(ScheduledScan $scheduledScan)
    {
        $scheduledScan->delete();

        return redirect()->route('scheduled-scans.index')
            ->with('success', 'Scheduled scan deleted successfully.');
    }

    /**
     * Toggle the active status of a scheduled scan.
     */
    public function toggleActive(ScheduledScan $scheduledScan)
    {
        $scheduledScan->update(['is_active' => !$scheduledScan->is_active]);

        $status = $scheduledScan->is_active ? 'activated' : 'deactivated';
        
        return back()->with('success', "Scheduled scan {$status} successfully.");
    }

    /**
     * Reset stuck progress for a scheduled scan.
     */
    public function resetProgress(ScheduledScan $scheduledScan)
    {
        $scheduledScan->resetStuckProgress();
        
        return back()->with('success', 'Scan progress has been reset.');
    }

    /**
     * Run a scheduled scan immediately (manual trigger).
     */
    public function runNow(ScheduledScan $scheduledScan)
    {
        try {
            // Check if already running
            if ($scheduledScan->isBusy()) {
                return back()->with('error', 'Scan is already running or queued.');
            }

            // Start the scan
            $scheduledScan->queueScan();

            // Run the actual WordPress scan
            $this->runActualScan($scheduledScan);

            return back()->with('success', 'Scheduled scan started successfully.');
        } catch (\Exception $e) {
            $scheduledScan->failScan($e->getMessage());
            return back()->with('error', 'Failed to trigger scheduled scan: ' . $e->getMessage());
        }
    }

    /**
     * Run the actual WordPress scan using the scan service
     */
    private function runActualScan(ScheduledScan $scheduledScan)
    {
        // Record start time for duration tracking
        $startTime = microtime(true);
        
        // Start the scan
        $scheduledScan->startScan('Initializing WordPress scan...');
        
        try {
            // Prepare scan options based on scheduled scan config
            $scanConfig = $scheduledScan->scan_config;
            
            // Debug: Log the configuration
            Log::info('Scheduled scan configuration', [
                'scan_config' => $scanConfig,
                'scan_config_type' => gettype($scanConfig),
                'target' => $scheduledScan->target,
                'scan_type' => $scheduledScan->scan_type,
            ]);
            
            // Determine scan type based on config
            $scanType = 'plugins'; // Default
            
            // Check for different scan options
            $checkPlugins = $scanConfig['check_plugins'] ?? true;
            $checkThemes = $scanConfig['check_themes'] ?? false;
            $checkVulnerabilities = $scanConfig['check_vulnerabilities'] ?? false;
            
            if ($checkPlugins && $checkThemes && $checkVulnerabilities) {
                $scanType = 'all';
            } elseif ($checkPlugins && $checkThemes) {
                $scanType = 'all';
            } elseif ($checkPlugins && $checkVulnerabilities) {
                $scanType = 'all';
            } elseif ($checkThemes && $checkVulnerabilities) {
                $scanType = 'all';
            } elseif ($checkPlugins) {
                $scanType = 'plugins';
            } elseif ($checkThemes) {
                $scanType = 'themes';
            } elseif ($checkVulnerabilities) {
                $scanType = 'vulnerabilities';
            }
            
            Log::info('Determined scan type', [
                'scanType' => $scanType,
                'checkPlugins' => $checkPlugins,
                'checkThemes' => $checkThemes,
                'checkVulnerabilities' => $checkVulnerabilities,
            ]);

            // Update progress
            $scheduledScan->updateProgress(25, 'Connecting to website...');

            Log::info('About to run WordPress scan', [
                'target' => $scheduledScan->target,
                'scanType' => $scanType,
                'scan_id' => $scheduledScan->id,
            ]);

            // Ensure the URL has a proper protocol
            $targetUrl = $scheduledScan->target;
            if (!str_starts_with($targetUrl, 'http://') && !str_starts_with($targetUrl, 'https://')) {
                // Try HTTPS first for better security and compatibility
                $targetUrl = 'https://' . $targetUrl;
            } elseif (str_starts_with($targetUrl, 'http://')) {
                // If HTTP is specified but might fail, we could try HTTPS as fallback
                $httpsUrl = str_replace('http://', 'https://', $targetUrl);
                Log::info('HTTP URL detected, will try HTTPS if HTTP fails', [
                    'original' => $targetUrl,
                    'https_fallback' => $httpsUrl,
                ]);
            }

            // Run the actual scan using the WordPress scan service
            $result = $this->scanService->scanWebsite($targetUrl, $scanType);
            
            // If HTTP failed and we haven't tried HTTPS yet, try HTTPS
            if (!empty($result['errors']) && str_starts_with($targetUrl, 'http://')) {
                $httpsUrl = str_replace('http://', 'https://', $targetUrl);
                Log::info('HTTP scan failed, trying HTTPS', [
                    'http_errors' => $result['errors'],
                    'trying_https' => $httpsUrl,
                ]);
                
                $scheduledScan->updateProgress(40, 'Retrying with HTTPS...');
                $result = $this->scanService->scanWebsite($httpsUrl, $scanType);
                
                if (empty($result['errors']) || ($result['wordpress_detected'] ?? false)) {
                    Log::info('HTTPS scan succeeded where HTTP failed');
                    $targetUrl = $httpsUrl; // Update the target URL for history
                }
            }

            Log::info('WordPress scan completed', [
                'target' => $scheduledScan->target,
                'result_keys' => array_keys($result),
                'wordpress_detected' => $result['wordpress_detected'] ?? 'not_set',
                'errors' => $result['errors'] ?? [],
            ]);

            $scheduledScan->updateProgress(75, 'Processing scan results...');

            // Calculate scan duration
            $endTime = microtime(true);
            $scanDurationMs = round(($endTime - $startTime) * 1000);

            // Determine status based on results
            $status = 'completed';
            $errorMessage = null;
            
            if (!empty($result['errors'])) {
                $status = 'failed';
                $errorMessage = implode('; ', $result['errors']);
            }

            // Create scan history record
            $scanHistory = ScanHistory::create([
                'scan_type' => $scheduledScan->scan_type,
                'scan_trigger' => 'scheduled',
                'target' => $targetUrl, // Use the final working URL
                'website_id' => $scheduledScan->website_id,
                'scheduled_scan_id' => $scheduledScan->id,
                'plugins_found' => count($result['plugins'] ?? []),
                'themes_found' => count($result['themes'] ?? []),
                'vulnerabilities_found' => count($result['vulnerabilities'] ?? []),
                'auto_sync_enabled' => true,
                'plugins_added_to_db' => 0, // TODO: Implement auto-sync
                'status' => $status,
                'error_message' => $errorMessage,
                'scan_duration_ms' => $scanDurationMs,
                'scan_results' => $result,
                'scan_summary' => [
                    'scheduled_scan_id' => $scheduledScan->id,
                    'scheduled_scan_name' => $scheduledScan->name,
                    'frequency' => $scheduledScan->frequency,
                    'executed_at' => now()->toISOString(),
                    'wordpress_detected' => $result['wordpress_detected'] ?? false,
                    'wp_version' => $result['wp_version'] ?? null,
                    'total_plugins' => count($result['plugins'] ?? []),
                    'total_themes' => count($result['themes'] ?? []),
                    'total_vulnerabilities' => count($result['vulnerabilities'] ?? []),
                    'final_url_used' => $targetUrl, // Track which URL worked
                    'scan_duration_ms' => $scanDurationMs,
                ],
                'scan_started_at' => $scheduledScan->started_at,
                'scan_completed_at' => now(),
            ]);

            $scheduledScan->updateProgress(100, 'Scan completed successfully');

            // Complete the scan
            if ($status === 'completed') {
                $scheduledScan->completeScan();
            } else {
                $scheduledScan->failScan($errorMessage);
            }

        } catch (\Exception $e) {
            // Calculate duration even for failed scans
            $endTime = microtime(true);
            $scanDurationMs = round(($endTime - $startTime) * 1000);
            
            $scheduledScan->failScan($e->getMessage());
            
            // Create failed scan history record
            ScanHistory::create([
                'scan_type' => $scheduledScan->scan_type,
                'scan_trigger' => 'scheduled',
                'target' => $scheduledScan->target,
                'website_id' => $scheduledScan->website_id,
                'scheduled_scan_id' => $scheduledScan->id,
                'status' => 'failed',
                'error_message' => $e->getMessage(),
                'scan_duration_ms' => $scanDurationMs,
                'plugins_found' => 0,
                'themes_found' => 0,
                'vulnerabilities_found' => 0,
                'auto_sync_enabled' => false,
                'plugins_added_to_db' => 0,
                'scan_results' => [
                    'url' => $scheduledScan->target,
                    'scan_type' => $scanType ?? 'plugins',
                    'wordpress_detected' => false,
                    'plugins' => [],
                    'themes' => [],
                    'vulnerabilities' => [],
                    'wp_version' => null,
                    'errors' => [$e->getMessage()],
                ],
                'scan_summary' => [
                    'scheduled_scan_id' => $scheduledScan->id,
                    'scheduled_scan_name' => $scheduledScan->name,
                    'frequency' => $scheduledScan->frequency,
                    'executed_at' => now()->toISOString(),
                    'scan_failed' => true,
                    'failure_reason' => $e->getMessage(),
                    'scan_duration_ms' => $scanDurationMs,
                ],
                'scan_started_at' => $scheduledScan->started_at,
                'scan_completed_at' => now(),
            ]);
            
            throw $e;
        }
    }

    /**
     * Get scheduled scans that are due to run.
     */
    public function due()
    {
        $dueScans = ScheduledScan::due()->with('website')->get();

        return response()->json($dueScans->map(function ($scan) {
            return [
                'id' => $scan->id,
                'name' => $scan->name,
                'target' => $scan->target,
                'scan_config' => json_decode($scan->scan_config, true),
                'website' => $scan->website,
            ];
        }));
    }

    /**
     * Bulk create scheduled scans for multiple websites
     */
    public function bulkCreate(Request $request)
    {
        $validated = $request->validate([
            'website_ids' => 'required|array',
            'website_ids.*' => 'exists:websites,id',
            'name_template' => 'required|string|max:255',
            'frequency' => 'required|in:daily,weekly,monthly',
            'scheduled_time' => 'required|date_format:H:i',
            'scan_config' => 'required|array',
            'is_active' => 'boolean',
        ]);

        $websiteIds = $validated['website_ids'];
        $nameTemplate = $validated['name_template'];
        $scanConfig = json_encode($validated['scan_config']);
        $isActive = $validated['is_active'] ?? true;

        $createdScans = [];
        $errors = [];

        foreach ($websiteIds as $websiteId) {
            try {
                $website = Website::find($websiteId);
                
                // Replace template placeholder with website domain name
                $scheduleName = str_replace('{website}', $website->domain_name, $nameTemplate);
                
                $scheduledScan = ScheduledScan::create([
                    'name' => $scheduleName,
                    'scan_type' => 'website',
                    'target' => $website->domain_name ?? 'website',
                    'website_id' => $websiteId,
                    'frequency' => $validated['frequency'],
                    'scheduled_time' => $validated['scheduled_time'],
                    'scan_config' => $scanConfig,
                    'is_active' => $isActive,
                ]);

                $createdScans[] = [
                    'website_id' => $websiteId,
                    'website_name' => $website->domain_name,
                    'schedule_id' => $scheduledScan->id,
                    'schedule_name' => $scheduleName,
                ];

            } catch (\Exception $e) {
                $website = Website::find($websiteId);
                $errors[] = [
                    'website_id' => $websiteId,
                    'website_name' => $website->domain_name ?? 'Unknown',
                    'error' => $e->getMessage(),
                ];
            }
        }

        $successCount = count($createdScans);
        $errorCount = count($errors);
        $totalCount = count($websiteIds);

        $message = "Bulk schedule creation completed: {$successCount} successful, {$errorCount} failed out of {$totalCount} websites.";

        if ($errorCount > 0) {
            return back()->with('warning', $message . ' Check the details for specific errors.');
        }

        return back()->with('success', $message);
    }
}
