<?php

namespace App\Services;

use Illuminate\Support\Facades\Process;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class WPCliService
{
    private $defaultTimeout = 300; // 5 minutes
    
    /**
     * Check if WP-CLI is available
     */
    public function isAvailable(): bool
    {
        try {
            $result = Process::timeout(10)->run('wp --version');
            return $result->successful();
        } catch (\Exception $e) {
            Log::warning('WP-CLI availability check failed', ['error' => $e->getMessage()]);
            return false;
        }
    }

    /**
     * Get WordPress version from a website
     */
    public function getWordPressVersion($sitePath): ?string
    {
        try {
            $result = Process::timeout(30)
                ->path($sitePath)
                ->run('wp core version');

            if ($result->successful()) {
                return trim($result->output());
            }

            Log::error('Failed to get WordPress version', [
                'path' => $sitePath,
                'error' => $result->errorOutput(),
            ]);

            return null;
        } catch (\Exception $e) {
            Log::error('WP-CLI WordPress version check failed', [
                'path' => $sitePath,
                'error' => $e->getMessage(),
            ]);
            return null;
        }
    }

    /**
     * Get all installed plugins
     */
    public function getPlugins($sitePath): array
    {
        try {
            $result = Process::timeout(60)
                ->path($sitePath)
                ->run('wp plugin list --format=json');

            if ($result->successful()) {
                $plugins = json_decode($result->output(), true);
                return is_array($plugins) ? $plugins : [];
            }

            Log::error('Failed to get plugins list', [
                'path' => $sitePath,
                'error' => $result->errorOutput(),
            ]);

            return [];
        } catch (\Exception $e) {
            Log::error('WP-CLI plugin list failed', [
                'path' => $sitePath,
                'error' => $e->getMessage(),
            ]);
            return [];
        }
    }

    /**
     * Get all installed themes
     */
    public function getThemes($sitePath): array
    {
        try {
            $result = Process::timeout(60)
                ->path($sitePath)
                ->run('wp theme list --format=json');

            if ($result->successful()) {
                $themes = json_decode($result->output(), true);
                return is_array($themes) ? $themes : [];
            }

            Log::error('Failed to get themes list', [
                'path' => $sitePath,
                'error' => $result->errorOutput(),
            ]);

            return [];
        } catch (\Exception $e) {
            Log::error('WP-CLI theme list failed', [
                'path' => $sitePath,
                'error' => $e->getMessage(),
            ]);
            return [];
        }
    }

    /**
     * Update WordPress core
     */
    public function updateWordPressCore($sitePath, $version = null): array
    {
        try {
            $command = $version ? "wp core update --version={$version}" : 'wp core update';
            
            $result = Process::timeout($this->defaultTimeout)
                ->path($sitePath)
                ->run($command);

            $response = [
                'success' => $result->successful(),
                'output' => $result->output(),
                'error' => $result->errorOutput(),
                'command' => $command,
            ];

            if ($result->successful()) {
                Log::info('WordPress core updated successfully', [
                    'path' => $sitePath,
                    'version' => $version,
                ]);
            } else {
                Log::error('WordPress core update failed', [
                    'path' => $sitePath,
                    'version' => $version,
                    'error' => $result->errorOutput(),
                ]);
            }

            return $response;
        } catch (\Exception $e) {
            Log::error('WP-CLI core update failed', [
                'path' => $sitePath,
                'version' => $version,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'output' => '',
                'error' => $e->getMessage(),
                'command' => $command ?? 'wp core update',
            ];
        }
    }

    /**
     * Update a specific plugin
     */
    public function updatePlugin($sitePath, $pluginSlug, $version = null): array
    {
        try {
            $command = $version 
                ? "wp plugin update {$pluginSlug} --version={$version}"
                : "wp plugin update {$pluginSlug}";
            
            $result = Process::timeout($this->defaultTimeout)
                ->path($sitePath)
                ->run($command);

            $response = [
                'success' => $result->successful(),
                'output' => $result->output(),
                'error' => $result->errorOutput(),
                'command' => $command,
                'plugin' => $pluginSlug,
            ];

            if ($result->successful()) {
                Log::info('Plugin updated successfully', [
                    'path' => $sitePath,
                    'plugin' => $pluginSlug,
                    'version' => $version,
                ]);
            } else {
                Log::error('Plugin update failed', [
                    'path' => $sitePath,
                    'plugin' => $pluginSlug,
                    'version' => $version,
                    'error' => $result->errorOutput(),
                ]);
            }

            return $response;
        } catch (\Exception $e) {
            Log::error('WP-CLI plugin update failed', [
                'path' => $sitePath,
                'plugin' => $pluginSlug,
                'version' => $version,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'output' => '',
                'error' => $e->getMessage(),
                'command' => $command ?? "wp plugin update {$pluginSlug}",
                'plugin' => $pluginSlug,
            ];
        }
    }

    /**
     * Update all plugins
     */
    public function updateAllPlugins($sitePath): array
    {
        try {
            $result = Process::timeout($this->defaultTimeout)
                ->path($sitePath)
                ->run('wp plugin update --all');

            $response = [
                'success' => $result->successful(),
                'output' => $result->output(),
                'error' => $result->errorOutput(),
                'command' => 'wp plugin update --all',
            ];

            if ($result->successful()) {
                Log::info('All plugins updated successfully', ['path' => $sitePath]);
            } else {
                Log::error('All plugins update failed', [
                    'path' => $sitePath,
                    'error' => $result->errorOutput(),
                ]);
            }

            return $response;
        } catch (\Exception $e) {
            Log::error('WP-CLI all plugins update failed', [
                'path' => $sitePath,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'output' => '',
                'error' => $e->getMessage(),
                'command' => 'wp plugin update --all',
            ];
        }
    }

    /**
     * Check for available updates
     */
    public function checkUpdates($sitePath): array
    {
        $updates = [
            'core' => null,
            'plugins' => [],
            'themes' => [],
        ];

        try {
            // Check core updates
            $coreResult = Process::timeout(30)
                ->path($sitePath)
                ->run('wp core check-update --format=json');

            if ($coreResult->successful()) {
                $coreUpdates = json_decode($coreResult->output(), true);
                if (!empty($coreUpdates)) {
                    $updates['core'] = $coreUpdates[0] ?? null;
                }
            }

            // Check plugin updates
            $pluginResult = Process::timeout(60)
                ->path($sitePath)
                ->run('wp plugin list --update=available --format=json');

            if ($pluginResult->successful()) {
                $pluginUpdates = json_decode($pluginResult->output(), true);
                $updates['plugins'] = is_array($pluginUpdates) ? $pluginUpdates : [];
            }

            // Check theme updates
            $themeResult = Process::timeout(60)
                ->path($sitePath)
                ->run('wp theme list --update=available --format=json');

            if ($themeResult->successful()) {
                $themeUpdates = json_decode($themeResult->output(), true);
                $updates['themes'] = is_array($themeUpdates) ? $themeUpdates : [];
            }

            Log::info('Updates check completed', [
                'path' => $sitePath,
                'core_updates' => !empty($updates['core']),
                'plugin_updates' => count($updates['plugins']),
                'theme_updates' => count($updates['themes']),
            ]);

        } catch (\Exception $e) {
            Log::error('WP-CLI updates check failed', [
                'path' => $sitePath,
                'error' => $e->getMessage(),
            ]);
        }

        return $updates;
    }

    /**
     * Create a database backup
     */
    public function createDatabaseBackup($sitePath, $filename = null): array
    {
        try {
            $filename = $filename ?: 'backup-' . date('Y-m-d-H-i-s') . '.sql';
            $backupPath = storage_path("app/backups/{$filename}");
            
            // Ensure backup directory exists
            $backupDir = dirname($backupPath);
            if (!is_dir($backupDir)) {
                mkdir($backupDir, 0755, true);
            }

            $result = Process::timeout($this->defaultTimeout)
                ->path($sitePath)
                ->run("wp db export {$backupPath}");

            $response = [
                'success' => $result->successful(),
                'output' => $result->output(),
                'error' => $result->errorOutput(),
                'backup_path' => $result->successful() ? $backupPath : null,
                'filename' => $filename,
            ];

            if ($result->successful()) {
                Log::info('Database backup created successfully', [
                    'path' => $sitePath,
                    'backup_path' => $backupPath,
                ]);
            } else {
                Log::error('Database backup failed', [
                    'path' => $sitePath,
                    'error' => $result->errorOutput(),
                ]);
            }

            return $response;
        } catch (\Exception $e) {
            Log::error('WP-CLI database backup failed', [
                'path' => $sitePath,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'output' => '',
                'error' => $e->getMessage(),
                'backup_path' => null,
                'filename' => $filename ?? 'unknown',
            ];
        }
    }

    /**
     * Get comprehensive site information
     */
    public function getSiteInfo($sitePath): array
    {
        $info = [
            'wordpress_version' => null,
            'plugins' => [],
            'themes' => [],
            'active_theme' => null,
            'database_info' => null,
            'updates_available' => [],
            'wp_cli_version' => null,
        ];

        try {
            // Get WP-CLI version
            $versionResult = Process::timeout(10)->run('wp --version');
            if ($versionResult->successful()) {
                $info['wp_cli_version'] = trim($versionResult->output());
            }

            // Get WordPress version
            $info['wordpress_version'] = $this->getWordPressVersion($sitePath);

            // Get plugins
            $info['plugins'] = $this->getPlugins($sitePath);

            // Get themes
            $themes = $this->getThemes($sitePath);
            $info['themes'] = $themes;
            
            // Find active theme
            foreach ($themes as $theme) {
                if (isset($theme['status']) && $theme['status'] === 'active') {
                    $info['active_theme'] = $theme;
                    break;
                }
            }

            // Check for updates
            $info['updates_available'] = $this->checkUpdates($sitePath);

            // Get database info
            $dbResult = Process::timeout(30)
                ->path($sitePath)
                ->run('wp db size --format=json');
            
            if ($dbResult->successful()) {
                $info['database_info'] = json_decode($dbResult->output(), true);
            }

        } catch (\Exception $e) {
            Log::error('WP-CLI site info gathering failed', [
                'path' => $sitePath,
                'error' => $e->getMessage(),
            ]);
        }

        return $info;
    }
}
