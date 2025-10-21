<?php

namespace App\Console\Commands;

use App\Services\AutomatedUpdateService;
use App\Models\Website;
use Illuminate\Console\Command;

class RunAutomatedUpdates extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'updates:run 
                            {website? : Specific website ID to update}
                            {--all : Run updates for all due websites}
                            {--force : Force updates even if not due}
                            {--dry-run : Show what would be updated without making changes}';

    /**
     * The console command description.
     */
    protected $description = 'Run automated WordPress updates for websites';

    /**
     * Execute the console command.
     */
    public function handle(AutomatedUpdateService $updateService)
    {
        $websiteId = $this->argument('website');
        $isDryRun = $this->option('dry-run');

        if ($websiteId) {
            return $this->updateSingleWebsite($websiteId, $updateService, $isDryRun);
        }

        if ($this->option('all')) {
            return $this->updateAllDueWebsites($updateService, $isDryRun);
        }

        $this->error('Please specify a website ID or use --all flag');
        return Command::FAILURE;
    }

    /**
     * Update a single website
     */
    private function updateSingleWebsite($websiteId, AutomatedUpdateService $updateService, $isDryRun)
    {
        $website = Website::find($websiteId);
        
        if (!$website) {
            $this->error("Website with ID {$websiteId} not found");
            return Command::FAILURE;
        }

        $schedule = $updateService->getUpdateSchedule($website);
        
        if (!$schedule) {
            $this->error("No automated update schedule found for website: {$website->url}");
            return Command::FAILURE;
        }

        if (!$this->option('force') && $schedule->next_run_at > now()) {
            $this->warn("Updates not due yet for {$website->url}. Next run: {$schedule->next_run_at}");
            $this->info('Use --force to run updates anyway');
            return Command::SUCCESS;
        }

        $this->info("Processing automated updates for: {$website->url}");

        if ($isDryRun) {
            $this->warn('DRY RUN MODE - No actual updates will be performed');
            $this->showUpdatePlan($website, $schedule->scan_config ?? []);
            return Command::SUCCESS;
        }

        $result = $updateService->executeAutomatedUpdates($website, $schedule->scan_config ?? []);
        
        $this->displayUpdateResults($website, $result);

        // Update next run time
        if ($result['success']) {
            $schedule->update([
                'last_run_at' => now(),
                'next_run_at' => $updateService->calculateNextRun(
                    $schedule->frequency,
                    $schedule->time_of_day
                ),
            ]);
        }

        return $result['success'] ? Command::SUCCESS : Command::FAILURE;
    }

    /**
     * Update all websites that are due for updates
     */
    private function updateAllDueWebsites(AutomatedUpdateService $updateService, $isDryRun)
    {
        $dueWebsites = $updateService->getWebsitesDueForUpdate();
        
        if (empty($dueWebsites)) {
            $this->info('No websites are due for automated updates');
            return Command::SUCCESS;
        }

        $this->info("Found " . count($dueWebsites) . " websites due for updates");

        if ($isDryRun) {
            $this->warn('DRY RUN MODE - No actual updates will be performed');
            foreach ($dueWebsites as $item) {
                $this->line("• {$item['website']->url} (due since {$item['due_since']})");
            }
            return Command::SUCCESS;
        }

        $progressBar = $this->output->createProgressBar(count($dueWebsites));
        $progressBar->start();

        $results = [];

        foreach ($dueWebsites as $item) {
            $website = $item['website'];
            $config = $item['config'];
            $scheduledScan = $item['scheduled_scan'];

            try {
                $result = $updateService->executeAutomatedUpdates($website, $config);
                
                $results[] = [
                    'website' => $website,
                    'success' => $result['success'],
                    'summary' => $result['summary'] ?? 'No summary available',
                    'errors' => $result['errors'] ?? [],
                ];

                // Update next run time if successful
                if ($result['success']) {
                    $scheduledScan->update([
                        'last_run_at' => now(),
                        'next_run_at' => $updateService->calculateNextRun(
                            $scheduledScan->frequency,
                            $scheduledScan->time_of_day
                        ),
                    ]);
                }

            } catch (\Exception $e) {
                $results[] = [
                    'website' => $website,
                    'success' => false,
                    'summary' => 'Exception occurred: ' . $e->getMessage(),
                    'errors' => [$e->getMessage()],
                ];
            }

            $progressBar->advance();
        }

        $progressBar->finish();
        $this->newLine(2);

        $this->displayBulkResults($results);

        return Command::SUCCESS;
    }

    /**
     * Show what would be updated in dry-run mode
     */
    private function showUpdatePlan($website, $config)
    {
        $this->table(['Setting', 'Enabled'], [
            ['Update WordPress Core', $config['update_core'] ?? false ? '✅ Yes' : '❌ No'],
            ['Update Plugins', $config['update_plugins'] ?? true ? '✅ Yes' : '❌ No'],
            ['Update Themes', $config['update_themes'] ?? false ? '✅ Yes' : '❌ No'],
            ['Create Backup', $config['backup_before_update'] ?? true ? '✅ Yes' : '❌ No'],
            ['Test After Update', $config['test_after_update'] ?? true ? '✅ Yes' : '❌ No'],
            ['Auto Rollback', $config['auto_rollback'] ?? false ? '✅ Yes' : '❌ No'],
        ]);

        if (!empty($config['exclude_plugins'])) {
            $this->warn('Excluded Plugins: ' . implode(', ', $config['exclude_plugins']));
        }

        if (!empty($config['exclude_themes'])) {
            $this->warn('Excluded Themes: ' . implode(', ', $config['exclude_themes']));
        }
    }

    /**
     * Display results for a single website update
     */
    private function displayUpdateResults($website, $result)
    {
        $this->newLine();
        $this->line("Results for {$website->url}:");
        $this->line(str_repeat('=', 50));

        if ($result['success']) {
            $this->info('✅ Update process completed successfully');
        } else {
            $this->error('❌ Update process failed');
        }

        if (!empty($result['summary'])) {
            $this->newLine();
            $this->line($result['summary']);
        }

        if ($result['backup_created']) {
            $this->newLine();
            $this->info("Backup created: {$result['backup_path']}");
        }

        if ($result['core_updated']) {
            $this->info('WordPress core was updated');
        }

        if (!empty($result['plugins_updated'])) {
            $this->newLine();
            $this->line('Plugin Updates:');
            foreach ($result['plugins_updated'] as $plugin) {
                $status = $plugin['success'] ? '✅' : '❌';
                $version = isset($plugin['to_version']) ? " ({$plugin['from_version']} → {$plugin['to_version']})" : '';
                $this->line("  {$status} {$plugin['name']}{$version}");
                
                if (!$plugin['success'] && isset($plugin['error'])) {
                    $this->line("     Error: {$plugin['error']}");
                }
            }
        }

        if (!empty($result['errors'])) {
            $this->newLine();
            $this->error('Errors encountered:');
            foreach ($result['errors'] as $error) {
                $this->line("  • {$error}");
            }
        }

        if (!empty($result['warnings'])) {
            $this->newLine();
            $this->warn('Warnings:');
            foreach ($result['warnings'] as $warning) {
                $this->line("  • {$warning}");
            }
        }
    }

    /**
     * Display results for bulk updates
     */
    private function displayBulkResults($results)
    {
        $successful = count(array_filter($results, fn($r) => $r['success']));
        $failed = count($results) - $successful;

        $this->info("Update Summary: {$successful} successful, {$failed} failed");
        $this->newLine();

        $tableData = [];
        foreach ($results as $result) {
            $status = $result['success'] ? '✅ Success' : '❌ Failed';
            $summary = $result['summary'];
            
            if (!$result['success'] && !empty($result['errors'])) {
                $summary .= ' | Errors: ' . implode(', ', array_slice($result['errors'], 0, 2));
            }

            $tableData[] = [
                $result['website']->url,
                $status,
                $summary,
            ];
        }

        $this->table(['Website', 'Status', 'Summary'], $tableData);

        // Show detailed errors for failed updates
        $failedResults = array_filter($results, fn($r) => !$r['success']);
        if (!empty($failedResults)) {
            $this->newLine();
            $this->error('Detailed Errors:');
            foreach ($failedResults as $result) {
                $this->line("• {$result['website']->url}:");
                foreach ($result['errors'] as $error) {
                    $this->line("  - {$error}");
                }
            }
        }
    }
}
