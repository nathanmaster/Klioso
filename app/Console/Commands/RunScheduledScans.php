<?php

namespace App\Console\Commands;

use App\Models\ScheduledScan;
use App\Models\ScanHistory;
use App\Services\WordPressScanService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class RunScheduledScans extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'scans:run-scheduled {--dry-run : Show what would be executed without running}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Run all scheduled WordPress scans that are due';

    protected WordPressScanService $scanService;

    public function __construct(WordPressScanService $scanService)
    {
        parent::__construct();
        $this->scanService = $scanService;
    }

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🔍 Checking for scheduled scans...');

        $dueScans = ScheduledScan::due()->get();

        if ($dueScans->isEmpty()) {
            $this->info('✅ No scheduled scans are due at this time.');
            return 0;
        }

        $this->info("📋 Found {$dueScans->count()} scheduled scan(s) to run:");

        foreach ($dueScans as $scheduledScan) {
            $this->line("  • {$scheduledScan->name} ({$scheduledScan->frequency_label})");
        }

        if ($this->option('dry-run')) {
            $this->warn('🚫 Dry run mode - no scans will be executed.');
            return 0;
        }

        $this->newLine();
        $successCount = 0;
        $failureCount = 0;

        foreach ($dueScans as $scheduledScan) {
            $this->info("🚀 Running: {$scheduledScan->name}");
            
            $startTime = microtime(true);
            
            try {
                $scanResults = $this->executeScan($scheduledScan);
                $endTime = microtime(true);
                $duration = round(($endTime - $startTime) * 1000);

                // Save scan history
                $this->saveScanHistory($scheduledScan, $scanResults, $duration, 'completed');
                
                // Mark as successful
                $scheduledScan->markSuccessful();
                
                $pluginCount = count($scanResults['plugins'] ?? []);
                $themeCount = count($scanResults['themes'] ?? []);
                $vulnCount = count($scanResults['vulnerabilities'] ?? []);
                
                $this->info("✅ Completed: Found {$pluginCount} plugins, {$themeCount} themes, {$vulnCount} vulnerabilities");
                $successCount++;

            } catch (\Exception $e) {
                $endTime = microtime(true);
                $duration = round(($endTime - $startTime) * 1000);

                $errorMessage = $e->getMessage();
                $this->error("❌ Failed: {$errorMessage}");
                
                // Save failed scan history
                $this->saveScanHistory($scheduledScan, [], $duration, 'failed', $errorMessage);
                
                // Mark as failed
                $scheduledScan->markFailed($errorMessage);
                
                $failureCount++;
                
                Log::error('Scheduled scan failed', [
                    'scheduled_scan_id' => $scheduledScan->id,
                    'name' => $scheduledScan->name,
                    'error' => $errorMessage,
                ]);
            }
        }

        $this->newLine();
        $this->info("📊 Scheduled scan summary:");
        $this->info("  ✅ Successful: {$successCount}");
        if ($failureCount > 0) {
            $this->error("  ❌ Failed: {$failureCount}");
        }

        return $failureCount > 0 ? 1 : 0;
    }

    /**
     * Execute a scheduled scan
     */
    private function executeScan(ScheduledScan $scheduledScan): array
    {
        $config = $scheduledScan->scan_config;
        
        if ($scheduledScan->scan_type === 'url') {
            return $this->scanService->scanWebsite(
                $scheduledScan->target,
                $config['scan_type'] ?? 'plugins'
            );
        } else {
            // For website scans, we'll need to build the URL
            $website = $scheduledScan->website;
            if (!$website) {
                throw new \Exception('Website not found for scheduled scan');
            }
            
            $url = $this->buildWebsiteUrl($website->domain_name);
            return $this->scanService->scanWebsite(
                $url,
                $config['scan_type'] ?? 'plugins'
            );
        }
    }

    /**
     * Build website URL from domain name
     */
    private function buildWebsiteUrl(string $domainName): string
    {
        // Add protocol if not present
        if (!str_starts_with($domainName, 'http://') && !str_starts_with($domainName, 'https://')) {
            $domainName = 'https://' . $domainName;
        }
        return $domainName;
    }

    /**
     * Save scan history
     */
    private function saveScanHistory(
        ScheduledScan $scheduledScan, 
        array $scanResults, 
        int $duration, 
        string $status, 
        ?string $errorMessage = null
    ): void {
        ScanHistory::create([
            'scan_type' => $scheduledScan->scan_type,
            'target' => $scheduledScan->target,
            'website_id' => $scheduledScan->website_id,
            'scan_results' => $scanResults,
            'scan_summary' => [
                'scheduled_scan_id' => $scheduledScan->id,
                'scheduled_scan_name' => $scheduledScan->name,
                'frequency' => $scheduledScan->frequency,
                'executed_at' => now()->toISOString(),
            ],
            'plugins_found' => count($scanResults['plugins'] ?? []),
            'themes_found' => count($scanResults['themes'] ?? []),
            'vulnerabilities_found' => count($scanResults['vulnerabilities'] ?? []),
            'auto_sync_enabled' => $scheduledScan->scan_config['auto_sync'] ?? false,
            'plugins_added_to_db' => 0, // TODO: Implement auto-sync for scheduled scans
            'status' => $status,
            'error_message' => $errorMessage,
            'scan_duration_ms' => $duration,
        ]);
    }
}
