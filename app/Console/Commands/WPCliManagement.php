<?php

namespace App\Console\Commands;

use App\Services\WPCliService;
use App\Models\Website;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class WPCliManagement extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'wpcli:manage 
                            {action : The action to perform (info|update|backup|check-updates)}
                            {website? : The website ID to manage}
                            {--path= : Local path to WordPress installation}
                            {--plugin= : Specific plugin slug for plugin actions}
                            {--version= : Specific version for updates}
                            {--all : Apply to all active websites}';

    /**
     * The console command description.
     */
    protected $description = 'Manage WordPress installations via WP-CLI';

    /**
     * Execute the console command.
     */
    public function handle(WPCliService $wpCliService)
    {
        if (!$wpCliService->isAvailable()) {
            $this->error('WP-CLI is not available. Please install WP-CLI first.');
            $this->info('Download from: https://wp-cli.org/');
            return Command::FAILURE;
        }

        $action = $this->argument('action');
        $websiteId = $this->argument('website');
        $sitePath = $this->option('path');

        if ($this->option('all')) {
            return $this->handleBulkAction($action, $wpCliService);
        }

        if (!$websiteId && !$sitePath) {
            $this->error('Please provide either a website ID or --path option');
            return Command::FAILURE;
        }

        $website = null;
        if ($websiteId) {
            $website = Website::find($websiteId);
            if (!$website) {
                $this->error("Website with ID {$websiteId} not found");
                return Command::FAILURE;
            }
            
            // For demo purposes, we'll assume local paths are stored or derive them
            // In production, you'd need to configure how to map websites to local paths
            $sitePath = $this->deriveSitePath($website);
        }

        if (!$sitePath || !is_dir($sitePath)) {
            $this->error("WordPress installation not found at: {$sitePath}");
            return Command::FAILURE;
        }

        return $this->executeAction($action, $sitePath, $website, $wpCliService);
    }

    /**
     * Execute the specified action
     */
    private function executeAction($action, $sitePath, $website, WPCliService $wpCliService)
    {
        $this->info("Executing '{$action}' for: {$sitePath}");

        switch ($action) {
            case 'info':
                return $this->showSiteInfo($sitePath, $wpCliService);
            
            case 'update':
                return $this->performUpdates($sitePath, $wpCliService);
            
            case 'backup':
                return $this->createBackup($sitePath, $website, $wpCliService);
            
            case 'check-updates':
                return $this->checkUpdates($sitePath, $wpCliService);
            
            default:
                $this->error("Unknown action: {$action}");
                $this->info('Available actions: info, update, backup, check-updates');
                return Command::FAILURE;
        }
    }

    /**
     * Show comprehensive site information
     */
    private function showSiteInfo($sitePath, WPCliService $wpCliService)
    {
        $this->info('Gathering site information...');
        
        $info = $wpCliService->getSiteInfo($sitePath);

        $this->table(['Property', 'Value'], [
            ['WP-CLI Version', $info['wp_cli_version'] ?? 'Unknown'],
            ['WordPress Version', $info['wordpress_version'] ?? 'Unknown'],
            ['Active Theme', $info['active_theme']['name'] ?? 'Unknown'],
            ['Total Plugins', count($info['plugins'])],
            ['Active Plugins', count(array_filter($info['plugins'], fn($p) => $p['status'] === 'active'))],
            ['Total Themes', count($info['themes'])],
        ]);

        if (!empty($info['updates_available']['core'])) {
            $this->warn('WordPress Core Update Available:');
            $core = $info['updates_available']['core'];
            $this->line("  Current: {$core['version']} → Available: {$core['update_version']}");
            $this->newLine();
        }

        if (!empty($info['updates_available']['plugins'])) {
            $this->warn('Plugin Updates Available:');
            foreach ($info['updates_available']['plugins'] as $plugin) {
                $this->line("  • {$plugin['name']}: {$plugin['version']} → {$plugin['update_version']}");
            }
            $this->newLine();
        }

        if (!empty($info['updates_available']['themes'])) {
            $this->warn('Theme Updates Available:');
            foreach ($info['updates_available']['themes'] as $theme) {
                $this->line("  • {$theme['name']}: {$theme['version']} → {$theme['update_version']}");
            }
            $this->newLine();
        }

        return Command::SUCCESS;
    }

    /**
     * Perform updates
     */
    private function performUpdates($sitePath, WPCliService $wpCliService)
    {
        $plugin = $this->option('plugin');
        $version = $this->option('version');

        if ($plugin) {
            $this->info("Updating plugin: {$plugin}");
            $result = $wpCliService->updatePlugin($sitePath, $plugin, $version);
        } else {
            $this->info('Checking what updates are available...');
            $updates = $wpCliService->checkUpdates($sitePath);

            if (!empty($updates['core']) || !empty($updates['plugins']) || !empty($updates['themes'])) {
                if ($this->confirm('Updates are available. Would you like to proceed with all updates?')) {
                    // Update core if available
                    if (!empty($updates['core'])) {
                        $this->info('Updating WordPress core...');
                        $coreResult = $wpCliService->updateWordPressCore($sitePath, $version);
                        $this->displayResult('WordPress Core', $coreResult);
                    }

                    // Update all plugins
                    if (!empty($updates['plugins'])) {
                        $this->info('Updating all plugins...');
                        $pluginResult = $wpCliService->updateAllPlugins($sitePath);
                        $this->displayResult('Plugins', $pluginResult);
                    }
                } else {
                    $this->info('Update cancelled by user.');
                    return Command::SUCCESS;
                }
            } else {
                $this->info('No updates available.');
                return Command::SUCCESS;
            }
        }

        if (isset($result)) {
            $this->displayResult($plugin ? "Plugin: {$plugin}" : 'Updates', $result);
        }

        return Command::SUCCESS;
    }

    /**
     * Create a database backup
     */
    private function createBackup($sitePath, $website, WPCliService $wpCliService)
    {
        $filename = $website 
            ? "backup-{$website->id}-" . date('Y-m-d-H-i-s') . '.sql'
            : null;

        $this->info('Creating database backup...');
        
        $result = $wpCliService->createDatabaseBackup($sitePath, $filename);

        if ($result['success']) {
            $this->info("Backup created successfully: {$result['backup_path']}");
            
            $fileSize = file_exists($result['backup_path']) 
                ? $this->formatBytes(filesize($result['backup_path']))
                : 'Unknown';
            
            $this->table(['Property', 'Value'], [
                ['Backup File', $result['filename']],
                ['File Size', $fileSize],
                ['Full Path', $result['backup_path']],
                ['Created', now()->toDateTimeString()],
            ]);
        } else {
            $this->error("Backup failed: {$result['error']}");
        }

        return $result['success'] ? Command::SUCCESS : Command::FAILURE;
    }

    /**
     * Check for available updates
     */
    private function checkUpdates($sitePath, WPCliService $wpCliService)
    {
        $this->info('Checking for available updates...');
        
        $updates = $wpCliService->checkUpdates($sitePath);
        
        $totalUpdates = count($updates['plugins']) + count($updates['themes']);
        if (!empty($updates['core'])) {
            $totalUpdates++;
        }

        if ($totalUpdates === 0) {
            $this->info('🎉 Everything is up to date!');
            return Command::SUCCESS;
        }

        $this->warn("Found {$totalUpdates} available updates:");

        if (!empty($updates['core'])) {
            $this->newLine();
            $this->line('<comment>WordPress Core:</comment>');
            $core = $updates['core'];
            $this->line("  Current: {$core['version']} → Available: {$core['update_version']}");
        }

        if (!empty($updates['plugins'])) {
            $this->newLine();
            $this->line('<comment>Plugins:</comment>');
            foreach ($updates['plugins'] as $plugin) {
                $this->line("  • {$plugin['name']}: {$plugin['version']} → {$plugin['update_version']}");
            }
        }

        if (!empty($updates['themes'])) {
            $this->newLine();
            $this->line('<comment>Themes:</comment>');
            foreach ($updates['themes'] as $theme) {
                $this->line("  • {$theme['name']}: {$theme['version']} → {$theme['update_version']}");
            }
        }

        $this->newLine();
        $this->info('Run with action "update" to apply these updates.');

        return Command::SUCCESS;
    }

    /**
     * Handle bulk actions for all websites
     */
    private function handleBulkAction($action, WPCliService $wpCliService)
    {
        $websites = Website::where('status', 'active')->get();
        
        if ($websites->isEmpty()) {
            $this->warn('No active websites found.');
            return Command::SUCCESS;
        }

        $this->info("Performing '{$action}' for {$websites->count()} websites...");
        
        $progressBar = $this->output->createProgressBar($websites->count());
        $progressBar->start();

        $results = [];

        foreach ($websites as $website) {
            $sitePath = $this->deriveSitePath($website);
            
            if (!$sitePath || !is_dir($sitePath)) {
                $results[] = [
                    'website' => $website->url,
                    'success' => false,
                    'message' => 'Site path not found or invalid',
                ];
                $progressBar->advance();
                continue;
            }

            $result = $this->executeAction($action, $sitePath, $website, $wpCliService);
            
            $results[] = [
                'website' => $website->url,
                'success' => $result === Command::SUCCESS,
                'message' => $result === Command::SUCCESS ? 'Completed' : 'Failed',
            ];

            $progressBar->advance();
        }

        $progressBar->finish();
        $this->newLine(2);

        // Display summary
        $successful = count(array_filter($results, fn($r) => $r['success']));
        $failed = count($results) - $successful;

        $this->table(['Website', 'Status'], array_map(function ($result) {
            return [
                $result['website'],
                $result['success'] ? '✅ ' . $result['message'] : '❌ ' . $result['message'],
            ];
        }, $results));

        $this->info("Summary: {$successful} successful, {$failed} failed");

        return Command::SUCCESS;
    }

    /**
     * Display command result
     */
    private function displayResult($operation, $result)
    {
        if ($result['success']) {
            $this->info("✅ {$operation} completed successfully");
            if (!empty($result['output'])) {
                $this->line("Output: {$result['output']}");
            }
        } else {
            $this->error("❌ {$operation} failed");
            if (!empty($result['error'])) {
                $this->line("Error: {$result['error']}");
            }
        }
    }

    /**
     * Derive site path from website model
     * This is a placeholder - you'd implement this based on your infrastructure
     */
    private function deriveSitePath($website)
    {
        // Example implementation - adjust based on your setup
        $domain = parse_url($website->url, PHP_URL_HOST);
        $possiblePaths = [
            "/var/www/{$domain}",
            "/var/www/html/{$domain}",
            "C:\\laragon\\www\\{$domain}",
            "C:\\xampp\\htdocs\\{$domain}",
        ];

        foreach ($possiblePaths as $path) {
            if (is_dir($path) && file_exists($path . '/wp-config.php')) {
                return $path;
            }
        }

        return null;
    }

    /**
     * Format bytes to human readable format
     */
    private function formatBytes($size, $precision = 2)
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        
        for ($i = 0; $size > 1024 && $i < count($units) - 1; $i++) {
            $size /= 1024;
        }
        
        return round($size, $precision) . ' ' . $units[$i];
    }
}
