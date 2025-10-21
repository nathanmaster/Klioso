<?php

namespace App\Services;

use App\Models\Website;
use App\Models\ScheduledScan;
use App\Services\WPCliService;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class AutomatedUpdateService
{
    public function __construct(
        private WPCliService $wpCliService
    ) {}

    /**
     * Schedule automated updates for a website
     */
    public function scheduleUpdates(Website $website, array $config): array
    {
        try {
            DB::beginTransaction();

            // Create scheduled scan for automated updates
            $scheduledScan = ScheduledScan::create([
                'website_id' => $website->id,
                'name' => "Automated Updates - {$website->name}",
                'scan_type' => 'automated_updates',
                'frequency' => $config['frequency'] ?? 'weekly',
                'time_of_day' => $config['time_of_day'] ?? '02:00',
                'is_active' => true,
                'scan_config' => [
                    'update_core' => $config['update_core'] ?? false,
                    'update_plugins' => $config['update_plugins'] ?? true,
                    'update_themes' => $config['update_themes'] ?? false,
                    'backup_before_update' => $config['backup_before_update'] ?? true,
                    'notification_email' => $config['notification_email'] ?? null,
                    'exclude_plugins' => $config['exclude_plugins'] ?? [],
                    'exclude_themes' => $config['exclude_themes'] ?? [],
                    'auto_rollback' => $config['auto_rollback'] ?? false,
                    'test_after_update' => $config['test_after_update'] ?? true,
                ],
                'next_run_at' => $this->calculateNextRun($config['frequency'], $config['time_of_day'] ?? '02:00'),
            ]);

            DB::commit();

            Log::info('Automated updates scheduled', [
                'website_id' => $website->id,
                'scheduled_scan_id' => $scheduledScan->id,
                'config' => $config,
            ]);

            return [
                'success' => true,
                'scheduled_scan_id' => $scheduledScan->id,
                'next_run_at' => $scheduledScan->next_run_at,
                'message' => 'Automated updates scheduled successfully',
            ];
        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('Failed to schedule automated updates', [
                'website_id' => $website->id,
                'error' => $e->getMessage(),
                'config' => $config,
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
                'message' => 'Failed to schedule automated updates',
            ];
        }
    }

    /**
     * Execute automated updates for a website
     */
    public function executeAutomatedUpdates(Website $website, array $config): array
    {
        $sitePath = $this->deriveSitePath($website);
        
        if (!$sitePath || !is_dir($sitePath)) {
            return [
                'success' => false,
                'error' => 'Website path not found or invalid',
                'message' => 'Cannot locate WordPress installation',
            ];
        }

        $results = [
            'success' => true,
            'backup_created' => false,
            'backup_path' => null,
            'core_updated' => false,
            'plugins_updated' => [],
            'themes_updated' => [],
            'errors' => [],
            'warnings' => [],
            'summary' => '',
        ];

        try {
            // Step 1: Create backup if requested
            if ($config['backup_before_update'] ?? true) {
                $this->info('Creating pre-update backup...', $results);
                $backupResult = $this->wpCliService->createDatabaseBackup(
                    $sitePath, 
                    "pre-update-{$website->id}-" . date('Y-m-d-H-i-s') . '.sql'
                );
                
                if ($backupResult['success']) {
                    $results['backup_created'] = true;
                    $results['backup_path'] = $backupResult['backup_path'];
                    $this->info('Backup created successfully', $results);
                } else {
                    $this->error('Backup failed: ' . $backupResult['error'], $results);
                    if ($config['require_backup'] ?? false) {
                        return $results;
                    }
                }
            }

            // Step 2: Check what updates are available
            $this->info('Checking for available updates...', $results);
            $availableUpdates = $this->wpCliService->checkUpdates($sitePath);

            // Step 3: Update WordPress core if enabled
            if (($config['update_core'] ?? false) && !empty($availableUpdates['core'])) {
                $this->info('Updating WordPress core...', $results);
                $coreResult = $this->wpCliService->updateWordPressCore($sitePath);
                
                if ($coreResult['success']) {
                    $results['core_updated'] = true;
                    $this->info('WordPress core updated successfully', $results);
                } else {
                    $this->error('Core update failed: ' . $coreResult['error'], $results);
                }
            }

            // Step 4: Update plugins if enabled
            if ($config['update_plugins'] ?? true) {
                $excludePlugins = $config['exclude_plugins'] ?? [];
                $availablePluginUpdates = array_filter($availableUpdates['plugins'], function($plugin) use ($excludePlugins) {
                    return !in_array($plugin['name'], $excludePlugins);
                });

                if (!empty($availablePluginUpdates)) {
                    $this->info('Updating plugins...', $results);
                    
                    foreach ($availablePluginUpdates as $plugin) {
                        $pluginResult = $this->wpCliService->updatePlugin($sitePath, $plugin['name']);
                        
                        if ($pluginResult['success']) {
                            $results['plugins_updated'][] = [
                                'name' => $plugin['name'],
                                'from_version' => $plugin['version'],
                                'to_version' => $plugin['update_version'],
                                'success' => true,
                            ];
                        } else {
                            $results['plugins_updated'][] = [
                                'name' => $plugin['name'],
                                'from_version' => $plugin['version'],
                                'to_version' => $plugin['update_version'],
                                'success' => false,
                                'error' => $pluginResult['error'],
                            ];
                            $this->error("Plugin update failed ({$plugin['name']}): " . $pluginResult['error'], $results);
                        }
                    }
                }
            }

            // Step 5: Update themes if enabled
            if ($config['update_themes'] ?? false) {
                $excludeThemes = $config['exclude_themes'] ?? [];
                $availableThemeUpdates = array_filter($availableUpdates['themes'], function($theme) use ($excludeThemes) {
                    return !in_array($theme['name'], $excludeThemes);
                });

                if (!empty($availableThemeUpdates)) {
                    $this->info('Updating themes...', $results);
                    // Theme updates would be implemented similarly to plugins
                    // For now, we'll log that theme updates are available
                    $this->info('Theme updates available but not implemented in this version', $results);
                }
            }

            // Step 6: Test website functionality if enabled
            if ($config['test_after_update'] ?? true) {
                $this->info('Testing website functionality...', $results);
                $testResult = $this->performPostUpdateTest($website);
                
                if (!$testResult['success']) {
                    $this->error('Post-update test failed: ' . $testResult['error'], $results);
                    
                    // Implement rollback if configured
                    if ($config['auto_rollback'] ?? false) {
                        $this->warning('Auto-rollback not implemented in this version', $results);
                    }
                }
            }

            // Step 7: Generate summary
            $results['summary'] = $this->generateUpdateSummary($results);

            Log::info('Automated updates completed', [
                'website_id' => $website->id,
                'results' => $results,
            ]);

        } catch (\Exception $e) {
            $results['success'] = false;
            $this->error('Automated update process failed: ' . $e->getMessage(), $results);
            
            Log::error('Automated updates failed', [
                'website_id' => $website->id,
                'error' => $e->getMessage(),
                'results' => $results,
            ]);
        }

        return $results;
    }

    /**
     * Get automated update schedule for a website
     */
    public function getUpdateSchedule(Website $website): ?ScheduledScan
    {
        return $website->scheduledScans()
            ->where('scan_type', 'automated_updates')
            ->where('is_active', true)
            ->first();
    }

    /**
     * Update automated update configuration
     */
    public function updateSchedule(Website $website, array $config): array
    {
        try {
            $scheduledScan = $this->getUpdateSchedule($website);
            
            if (!$scheduledScan) {
                return $this->scheduleUpdates($website, $config);
            }

            $scheduledScan->update([
                'frequency' => $config['frequency'] ?? $scheduledScan->frequency,
                'time_of_day' => $config['time_of_day'] ?? $scheduledScan->time_of_day,
                'is_active' => $config['is_active'] ?? $scheduledScan->is_active,
                'scan_config' => array_merge($scheduledScan->scan_config ?? [], $config),
                'next_run_at' => $this->calculateNextRun(
                    $config['frequency'] ?? $scheduledScan->frequency,
                    $config['time_of_day'] ?? $scheduledScan->time_of_day
                ),
            ]);

            return [
                'success' => true,
                'scheduled_scan_id' => $scheduledScan->id,
                'message' => 'Update schedule updated successfully',
            ];
        } catch (\Exception $e) {
            Log::error('Failed to update schedule', [
                'website_id' => $website->id,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
                'message' => 'Failed to update schedule',
            ];
        }
    }

    /**
     * Disable automated updates for a website
     */
    public function disableAutomatedUpdates(Website $website): array
    {
        try {
            $scheduledScan = $this->getUpdateSchedule($website);
            
            if ($scheduledScan) {
                $scheduledScan->update(['is_active' => false]);
            }

            return [
                'success' => true,
                'message' => 'Automated updates disabled successfully',
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage(),
                'message' => 'Failed to disable automated updates',
            ];
        }
    }

    /**
     * Get websites due for automated updates
     */
    public function getWebsitesDueForUpdate(): array
    {
        $dueScans = ScheduledScan::where('scan_type', 'automated_updates')
            ->where('is_active', true)
            ->where('next_run_at', '<=', now())
            ->with('website')
            ->get();

        return $dueScans->map(function ($scan) {
            return [
                'website' => $scan->website,
                'scheduled_scan' => $scan,
                'config' => $scan->scan_config ?? [],
                'due_since' => $scan->next_run_at,
            ];
        })->toArray();
    }

    /**
     * Calculate next run time based on frequency
     */
    public function calculateNextRun($frequency, $timeOfDay): \DateTime
    {
        $nextRun = now();
        
        switch ($frequency) {
            case 'daily':
                $nextRun->addDay();
                break;
            case 'weekly':
                $nextRun->addWeek();
                break;
            case 'monthly':
                $nextRun->addMonth();
                break;
            default:
                $nextRun->addWeek(); // Default to weekly
        }

        // Set specific time
        [$hour, $minute] = explode(':', $timeOfDay);
        $nextRun->setTime((int)$hour, (int)$minute, 0);

        return $nextRun;
    }

    /**
     * Derive site path from website - placeholder implementation
     */
    private function deriveSitePath($website)
    {
        // This is a placeholder - implement based on your infrastructure
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
     * Perform basic functionality test after updates
     */
    private function performPostUpdateTest($website): array
    {
        try {
            // Basic HTTP check
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $website->url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_TIMEOUT, 30);
            curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
            curl_setopt($ch, CURLOPT_USERAGENT, 'Klioso Update Tester');
            
            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $error = curl_error($ch);
            curl_close($ch);

            if ($error) {
                return [
                    'success' => false,
                    'error' => "cURL error: {$error}",
                ];
            }

            if ($httpCode >= 200 && $httpCode < 400) {
                return [
                    'success' => true,
                    'http_code' => $httpCode,
                    'message' => 'Website is responding normally',
                ];
            } else {
                return [
                    'success' => false,
                    'error' => "HTTP {$httpCode} response",
                ];
            }
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Generate update summary
     */
    private function generateUpdateSummary(array $results): string
    {
        $summary = [];
        
        if ($results['backup_created']) {
            $summary[] = '✅ Pre-update backup created';
        }
        
        if ($results['core_updated']) {
            $summary[] = '✅ WordPress core updated';
        }
        
        $pluginSuccesses = count(array_filter($results['plugins_updated'], fn($p) => $p['success']));
        $pluginFailures = count(array_filter($results['plugins_updated'], fn($p) => !$p['success']));
        
        if ($pluginSuccesses > 0) {
            $summary[] = "✅ {$pluginSuccesses} plugins updated successfully";
        }
        
        if ($pluginFailures > 0) {
            $summary[] = "❌ {$pluginFailures} plugin updates failed";
        }
        
        if (empty($summary)) {
            $summary[] = 'ℹ️ No updates were available or processed';
        }
        
        return implode("\n", $summary);
    }

    /**
     * Helper method to add info messages
     */
    private function info($message, &$results)
    {
        $results['warnings'][] = $message;
    }

    /**
     * Helper method to add warning messages
     */
    private function warning($message, &$results)
    {
        $results['warnings'][] = $message;
    }

    /**
     * Helper method to add error messages
     */
    private function error($message, &$results)
    {
        $results['errors'][] = $message;
        $results['success'] = false;
    }
}
