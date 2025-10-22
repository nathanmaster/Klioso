<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Artisan;

class InstallKlioso extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'klioso:install {--fresh : Use fresh installation schema} {--force : Force installation without confirmation}';

    /**
     * The console command description.
     */
    protected $description = 'Install Klioso with optimized migration strategy';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🚀 Klioso Installation Manager');
        $this->newLine();

        // Check if this is a fresh installation
        $isFresh = $this->isFreshInstallation();
        $useFresh = $this->option('fresh') || $isFresh;

        if ($isFresh) {
            $this->info('✅ Fresh installation detected');
        } else {
            $this->warn('⚠️  Existing database detected');
        }

        $this->newLine();

        // Show installation options
        if (!$this->option('force')) {
            if ($useFresh && $isFresh) {
                $confirmed = $this->confirm('Use optimized fresh installation schema? (Recommended for new installations)');
                if (!$confirmed) {
                    $useFresh = false;
                }
            } elseif (!$isFresh) {
                $this->warn('Existing database detected. Will use incremental migrations to preserve data.');
                $confirmed = $this->confirm('Continue with incremental migrations?');
                if (!$confirmed) {
                    $this->error('Installation cancelled.');
                    return 1;
                }
                $useFresh = false;
            }
        }

        // Perform installation
        if ($useFresh && $isFresh) {
            return $this->freshInstallation();
        } else {
            return $this->incrementalInstallation();
        }
    }

    /**
     * Check if this is a fresh installation
     */
    private function isFreshInstallation(): bool
    {
        try {
            $tables = Schema::getConnection()->getDoctrineSchemaManager()->listTableNames();
            // Consider it fresh if only migrations table exists or no tables at all
            return count($tables) <= 1;
        } catch (\Exception $e) {
            // If we can't check tables, assume fresh installation
            return true;
        }
    }

    /**
     * Perform fresh installation using consolidated schema
     */
    private function freshInstallation(): int
    {
        $this->info('🔧 Starting fresh installation...');
        $this->newLine();

        try {
            // Run only the fresh installation migration
            $this->info('📋 Creating database schema...');
            $this->call('migrate', [
                '--path' => 'database/migrations/9999_12_31_000000_fresh_installation_schema.php',
                '--force' => true
            ]);

            // Mark all other migrations as run to avoid conflicts
            $this->info('📝 Marking historical migrations as completed...');
            $this->markHistoricalMigrationsAsRun();

            $this->newLine();
            $this->info('✅ Fresh installation completed successfully!');
            $this->showPostInstallationInfo(true);

            return 0;
        } catch (\Exception $e) {
            $this->error('❌ Fresh installation failed: ' . $e->getMessage());
            return 1;
        }
    }

    /**
     * Perform incremental installation using all migrations
     */
    private function incrementalInstallation(): int
    {
        $this->info('🔧 Starting incremental installation...');
        $this->newLine();

        try {
            // Skip the fresh installation migration
            $this->info('📋 Running incremental migrations...');
            $this->call('migrate', [
                '--force' => true
            ]);

            $this->newLine();
            $this->info('✅ Incremental installation completed successfully!');
            $this->showPostInstallationInfo(false);

            return 0;
        } catch (\Exception $e) {
            $this->error('❌ Incremental installation failed: ' . $e->getMessage());
            return 1;
        }
    }

    /**
     * Mark historical migrations as run to avoid conflicts
     */
    private function markHistoricalMigrationsAsRun(): void
    {
        $historicalMigrations = [
            '0001_01_01_000000_create_users_table',
            '0001_01_01_000001_create_cache_table',
            '0001_01_01_000002_create_jobs_table',
            '2024_06_07_000001_create_clients_table',
            '2024_06_07_000002_create_hosting_providers_table',
            '2024_06_07_000003_create_websites_table',
            '2024_06_07_000004_create_credentials_table',
            '2024_06_07_000005_create_plugins_table',
            '2024_06_07_000006_create_website_plugin_table',
            '2024_06_07_000007_create_templates_table',
            '2024_06_07_000008_create_articles_table',
            '2025_01_09_000000_add_health_fields_to_websites_table',
            '2025_01_09_000001_enhance_security_audits_table',
            '2025_07_21_000001_add_fields_to_hosting_providers_table',
            '2025_07_23_201655_create_website_scans_table',
            '2025_07_24_160000_update_hosting_providers_to_providers_with_services',
            '2025_07_24_160001_update_websites_for_multiple_providers',
            '2025_07_24_171844_make_client_id_nullable_in_websites_table',
            '2025_07_24_171937_make_hosting_provider_id_nullable_in_websites_table',
            '2025_07_28_203119_create_scan_history_table',
            '2025_07_29_173652_create_scheduled_scans_table',
            '2025_07_29_174050_create_website_groups_table',
            '2025_07_29_174111_add_group_id_to_websites_table',
            '2025_07_29_202805_create_website_analytics_table',
            '2025_07_29_202834_create_security_audits_table',
            '2025_07_29_202905_create_notifications_table',
            '2025_07_30_143050_fix_clients_table_add_missing_columns',
            '2025_07_30_143107_fix_scheduled_scans_table_add_missing_columns',
            '2025_07_30_143122_fix_scan_history_table_rename_to_scan_histories',
            '2025_07_30_151114_add_last_updated_to_website_plugin_table',
            '2025_07_31_142920_add_status_to_scheduled_scans_table',
            '2025_07_31_180000_add_scheduled_scan_relationship_to_scan_histories',
            '2025_08_05_000000_create_dashboard_panels_table',
            '2025_08_27_161117_add_performance_indexes_to_tables',
            '2025_08_27_165000_add_security_data_to_scans_tables'
        ];

        $batch = DB::table('migrations')->max('batch') + 1;

        foreach ($historicalMigrations as $migration) {
            DB::table('migrations')->updateOrInsert(
                ['migration' => $migration],
                ['batch' => $batch]
            );
        }

        $this->info("✅ Marked " . count($historicalMigrations) . " historical migrations as completed");
    }

    /**
     * Show post-installation information
     */
    private function showPostInstallationInfo(bool $wasFresh): void
    {
        $this->newLine();
        $this->info('🎉 Klioso installation complete!');
        $this->newLine();

        if ($wasFresh) {
            $this->info('📊 Installation Summary:');
            $this->line('• Used optimized fresh installation schema');
            $this->line('• Created 15+ database tables with comprehensive indexes');
            $this->line('• Bypassed 35+ individual migration files');
            $this->line('• Ready for immediate use');
        } else {
            $this->info('📊 Installation Summary:');
            $this->line('• Used incremental migration approach');
            $this->line('• Preserved existing data and schema');
            $this->line('• Applied any pending migrations');
            $this->line('• Database updated to latest schema');
        }

        $this->newLine();
        $this->info('🔧 Next Steps:');
        $this->line('1. Configure your .env file with database and WPScan API settings');
        $this->line('2. Run: php artisan klioso:setup (if available)');
        $this->line('3. Start the development server: php artisan serve');
        $this->line('4. Visit http://localhost:8000 to access Klioso');

        $this->newLine();
        $this->info('📚 Documentation:');
        $this->line('• Setup Guide: docs/setup/COMPLETE_INSTALLATION_GUIDE.md');
        $this->line('• WPScan Integration: docs/WPSCAN_HEALTH_SCORING_IMPLEMENTATION.md');
        $this->line('• Project Overview: README.md');

        $this->newLine();
    }
}