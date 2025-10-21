<?php

namespace App\Services;

use App\Models\Website;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;

class BackupIntegrationService
{
    /**
     * Supported backup providers
     */
    private const SUPPORTED_PROVIDERS = [
        'updraftplus' => 'UpdraftPlus',
        'backupbuddy' => 'BackupBuddy',
        'backwpup' => 'BackWPup',
        'duplicator' => 'Duplicator',
        'wp_time_capsule' => 'WP Time Capsule',
        'jetpack_backup' => 'Jetpack Backup',
        'blogvault' => 'BlogVault',
        'wpcli' => 'WP-CLI (Built-in)',
    ];

    public function __construct(
        private WPCliService $wpCliService
    ) {}

    /**
     * Detect backup plugins on a website
     */
    public function detectBackupPlugins(Website $website): array
    {
        $sitePath = $this->deriveSitePath($website);
        
        if (!$sitePath) {
            return [
                'success' => false,
                'error' => 'Website path not found',
                'detected_plugins' => [],
            ];
        }

        try {
            $plugins = $this->wpCliService->getPlugins($sitePath);
            $backupPlugins = [];

            foreach ($plugins as $plugin) {
                $pluginSlug = $plugin['name'] ?? '';
                $pluginTitle = $plugin['title'] ?? '';
                $isActive = ($plugin['status'] ?? '') === 'active';

                // Check for known backup plugins
                if (str_contains($pluginSlug, 'updraftplus') || str_contains($pluginTitle, 'UpdraftPlus')) {
                    $backupPlugins[] = [
                        'type' => 'updraftplus',
                        'name' => 'UpdraftPlus',
                        'slug' => $pluginSlug,
                        'version' => $plugin['version'] ?? 'Unknown',
                        'is_active' => $isActive,
                        'supported' => true,
                    ];
                } elseif (str_contains($pluginSlug, 'backupbuddy') || str_contains($pluginTitle, 'BackupBuddy')) {
                    $backupPlugins[] = [
                        'type' => 'backupbuddy',
                        'name' => 'BackupBuddy',
                        'slug' => $pluginSlug,
                        'version' => $plugin['version'] ?? 'Unknown',
                        'is_active' => $isActive,
                        'supported' => true,
                    ];
                } elseif (str_contains($pluginSlug, 'backwpup') || str_contains($pluginTitle, 'BackWPup')) {
                    $backupPlugins[] = [
                        'type' => 'backwpup',
                        'name' => 'BackWPup',
                        'slug' => $pluginSlug,
                        'version' => $plugin['version'] ?? 'Unknown',
                        'is_active' => $isActive,
                        'supported' => false,
                    ];
                } elseif (str_contains($pluginSlug, 'duplicator') || str_contains($pluginTitle, 'Duplicator')) {
                    $backupPlugins[] = [
                        'type' => 'duplicator',
                        'name' => 'Duplicator',
                        'slug' => $pluginSlug,
                        'version' => $plugin['version'] ?? 'Unknown',
                        'is_active' => $isActive,
                        'supported' => false,
                    ];
                } elseif (str_contains($pluginSlug, 'jetpack') && str_contains($pluginTitle, 'Backup')) {
                    $backupPlugins[] = [
                        'type' => 'jetpack_backup',
                        'name' => 'Jetpack Backup',
                        'slug' => $pluginSlug,
                        'version' => $plugin['version'] ?? 'Unknown',
                        'is_active' => $isActive,
                        'supported' => false,
                    ];
                }
            }

            // Always include WP-CLI as a fallback option
            $backupPlugins[] = [
                'type' => 'wpcli',
                'name' => 'WP-CLI (Built-in)',
                'slug' => 'wp-cli',
                'version' => 'System',
                'is_active' => $this->wpCliService->isAvailable(),
                'supported' => true,
            ];

            Log::info('Backup plugins detected', [
                'website_id' => $website->id,
                'plugins_found' => count($backupPlugins),
                'active_plugins' => count(array_filter($backupPlugins, fn($p) => $p['is_active'])),
            ]);

            return [
                'success' => true,
                'detected_plugins' => $backupPlugins,
                'total_plugins' => count($backupPlugins),
                'active_plugins' => count(array_filter($backupPlugins, fn($p) => $p['is_active'])),
            ];

        } catch (\Exception $e) {
            Log::error('Failed to detect backup plugins', [
                'website_id' => $website->id,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
                'detected_plugins' => [],
            ];
        }
    }

    /**
     * Create a backup using the specified provider
     */
    public function createBackup(Website $website, array $config = []): array
    {
        $provider = $config['provider'] ?? 'wpcli';
        $backupType = $config['type'] ?? 'full'; // full, database, files
        
        switch ($provider) {
            case 'wpcli':
                return $this->createWPCliBackup($website, $config);
            
            case 'updraftplus':
                return $this->createUpdraftPlusBackup($website, $config);
            
            case 'backupbuddy':
                return $this->createBackupBuddyBackup($website, $config);
            
            default:
                return [
                    'success' => false,
                    'error' => "Backup provider '{$provider}' is not supported",
                    'supported_providers' => array_keys(self::SUPPORTED_PROVIDERS),
                ];
        }
    }

    /**
     * Create backup using WP-CLI
     */
    private function createWPCliBackup(Website $website, array $config): array
    {
        $sitePath = $this->deriveSitePath($website);
        
        if (!$sitePath) {
            return [
                'success' => false,
                'error' => 'Website path not found',
            ];
        }

        try {
            $backupType = $config['type'] ?? 'full';
            $results = [
                'success' => true,
                'provider' => 'wpcli',
                'backup_type' => $backupType,
                'files' => [],
                'total_size' => 0,
                'backup_path' => storage_path("app/backups/website-{$website->id}"),
            ];

            // Ensure backup directory exists
            $backupDir = $results['backup_path'];
            if (!is_dir($backupDir)) {
                mkdir($backupDir, 0755, true);
            }

            $timestamp = date('Y-m-d-H-i-s');

            // Database backup
            if (in_array($backupType, ['full', 'database'])) {
                $dbFilename = "database-{$timestamp}.sql";
                $dbResult = $this->wpCliService->createDatabaseBackup($sitePath, $dbFilename);
                
                if ($dbResult['success']) {
                    $results['files'][] = [
                        'type' => 'database',
                        'filename' => $dbFilename,
                        'path' => $dbResult['backup_path'],
                        'size' => file_exists($dbResult['backup_path']) ? filesize($dbResult['backup_path']) : 0,
                    ];
                    $results['total_size'] += $results['files'][0]['size'];
                } else {
                    $results['success'] = false;
                    $results['error'] = 'Database backup failed: ' . $dbResult['error'];
                    return $results;
                }
            }

            // Files backup (simplified - in production you'd want proper file archiving)
            if (in_array($backupType, ['full', 'files'])) {
                $filesResult = $this->createFilesBackup($sitePath, $backupDir, $timestamp);
                
                if ($filesResult['success']) {
                    $results['files'][] = $filesResult['file_info'];
                    $results['total_size'] += $filesResult['file_info']['size'];
                } else {
                    // Files backup failure is not critical for database-only backups
                    if ($backupType === 'files') {
                        $results['success'] = false;
                        $results['error'] = 'Files backup failed: ' . $filesResult['error'];
                    } else {
                        $results['warnings'][] = 'Files backup failed: ' . $filesResult['error'];
                    }
                }
            }

            Log::info('WP-CLI backup completed', [
                'website_id' => $website->id,
                'backup_type' => $backupType,
                'total_size' => $results['total_size'],
                'files_count' => count($results['files']),
            ]);

            return $results;

        } catch (\Exception $e) {
            Log::error('WP-CLI backup failed', [
                'website_id' => $website->id,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
                'provider' => 'wpcli',
            ];
        }
    }

    /**
     * Create backup using UpdraftPlus API
     */
    private function createUpdraftPlusBackup(Website $website, array $config): array
    {
        // This would integrate with UpdraftPlus API
        // For now, return a placeholder implementation
        
        return [
            'success' => false,
            'error' => 'UpdraftPlus integration not yet implemented',
            'provider' => 'updraftplus',
            'note' => 'This would integrate with UpdraftPlus REST API endpoints',
        ];
    }

    /**
     * Create backup using BackupBuddy API
     */
    private function createBackupBuddyBackup(Website $website, array $config): array
    {
        // This would integrate with BackupBuddy API
        // For now, return a placeholder implementation
        
        return [
            'success' => false,
            'error' => 'BackupBuddy integration not yet implemented',
            'provider' => 'backupbuddy',
            'note' => 'This would integrate with BackupBuddy API endpoints',
        ];
    }

    /**
     * Schedule automatic backups for a website
     */
    public function scheduleBackups(Website $website, array $config): array
    {
        try {
            $scheduledScan = $website->scheduledScans()->create([
                'name' => "Automated Backups - {$website->name}",
                'scan_type' => 'backup',
                'frequency' => $config['frequency'] ?? 'daily',
                'time_of_day' => $config['time_of_day'] ?? '01:00',
                'is_active' => true,
                'scan_config' => [
                    'provider' => $config['provider'] ?? 'wpcli',
                    'backup_type' => $config['backup_type'] ?? 'full',
                    'retention_days' => $config['retention_days'] ?? 30,
                    'notification_email' => $config['notification_email'] ?? null,
                    'compress_backups' => $config['compress_backups'] ?? true,
                    'remote_storage' => $config['remote_storage'] ?? null,
                ],
                'next_run_at' => $this->calculateNextRun($config['frequency'] ?? 'daily', $config['time_of_day'] ?? '01:00'),
            ]);

            Log::info('Backup schedule created', [
                'website_id' => $website->id,
                'scheduled_scan_id' => $scheduledScan->id,
                'frequency' => $config['frequency'] ?? 'daily',
            ]);

            return [
                'success' => true,
                'scheduled_scan_id' => $scheduledScan->id,
                'next_backup' => $scheduledScan->next_run_at,
                'message' => 'Backup schedule created successfully',
            ];

        } catch (\Exception $e) {
            Log::error('Failed to schedule backups', [
                'website_id' => $website->id,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
                'message' => 'Failed to schedule backups',
            ];
        }
    }

    /**
     * Get backup history for a website
     */
    public function getBackupHistory(Website $website, $limit = 50): array
    {
        try {
            $backupDir = storage_path("app/backups/website-{$website->id}");
            $backups = [];

            if (is_dir($backupDir)) {
                $files = glob($backupDir . '/*');
                
                foreach ($files as $file) {
                    if (is_file($file)) {
                        $backups[] = [
                            'filename' => basename($file),
                            'path' => $file,
                            'size' => filesize($file),
                            'created_at' => date('Y-m-d H:i:s', filemtime($file)),
                            'type' => $this->guessBackupType($file),
                        ];
                    }
                }

                // Sort by creation time (newest first)
                usort($backups, fn($a, $b) => strtotime($b['created_at']) - strtotime($a['created_at']));
                
                // Limit results
                $backups = array_slice($backups, 0, $limit);
            }

            return [
                'success' => true,
                'backups' => $backups,
                'total_backups' => count($backups),
                'total_size' => array_sum(array_column($backups, 'size')),
            ];

        } catch (\Exception $e) {
            Log::error('Failed to get backup history', [
                'website_id' => $website->id,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
                'backups' => [],
            ];
        }
    }

    /**
     * Create a simple files backup (placeholder implementation)
     */
    private function createFilesBackup($sitePath, $backupDir, $timestamp): array
    {
        try {
            // This is a simplified implementation
            // In production, you'd want to use proper archiving (zip, tar.gz)
            $filename = "files-{$timestamp}.info";
            $infoFile = $backupDir . '/' . $filename;
            
            $info = [
                'site_path' => $sitePath,
                'backup_date' => date('Y-m-d H:i:s'),
                'note' => 'Files backup placeholder - implement proper archiving',
            ];
            
            file_put_contents($infoFile, json_encode($info, JSON_PRETTY_PRINT));
            
            return [
                'success' => true,
                'file_info' => [
                    'type' => 'files',
                    'filename' => $filename,
                    'path' => $infoFile,
                    'size' => filesize($infoFile),
                ],
            ];

        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Guess backup type from filename
     */
    private function guessBackupType($filepath): string
    {
        $filename = basename($filepath);
        
        if (str_contains($filename, 'database') || str_ends_with($filename, '.sql')) {
            return 'database';
        } elseif (str_contains($filename, 'files') || str_ends_with($filename, '.zip') || str_ends_with($filename, '.tar.gz')) {
            return 'files';
        } else {
            return 'unknown';
        }
    }

    /**
     * Calculate next run time for backups
     */
    private function calculateNextRun($frequency, $timeOfDay): \DateTime
    {
        $nextRun = now();
        
        switch ($frequency) {
            case 'hourly':
                $nextRun->addHour();
                break;
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
                $nextRun->addDay();
        }

        // Set specific time
        [$hour, $minute] = explode(':', $timeOfDay);
        $nextRun->setTime((int)$hour, (int)$minute, 0);

        return $nextRun;
    }

    /**
     * Derive site path from website
     */
    private function deriveSitePath($website)
    {
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
     * Get supported backup providers
     */
    public function getSupportedProviders(): array
    {
        return self::SUPPORTED_PROVIDERS;
    }
}
