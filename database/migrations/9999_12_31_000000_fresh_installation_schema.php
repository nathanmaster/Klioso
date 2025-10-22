<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Fresh Installation Schema - Complete Klioso Database Schema
     * 
     * This migration contains the complete database schema for fresh installations.
     * It consolidates all individual migrations into a single comprehensive schema.
     * 
     * For existing installations, continue using the individual migration files.
     * For fresh installations, use this file to avoid running 35+ individual migrations.
     */
    public function up(): void
    {
        // Check if this is a fresh installation
        if ($this->isFreshInstallation()) {
            $this->createFreshSchema();
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Only drop tables if this was a fresh installation
        if ($this->isFreshInstallation()) {
            $this->dropFreshSchema();
        }
    }

    /**
     * Check if this is a fresh installation
     */
    private function isFreshInstallation(): bool
    {
        // If no tables exist except migrations, it's a fresh installation
        $tables = Schema::getConnection()->getDoctrineSchemaManager()->listTableNames();
        return count($tables) <= 1; // Only migrations table exists
    }

    /**
     * Create the complete fresh installation schema
     */
    private function createFreshSchema(): void
    {
        // Core Laravel tables
        $this->createUsersTable();
        $this->createCacheTable();
        $this->createJobsTable();

        // Klioso core tables
        $this->createClientsTable();
        $this->createHostingProvidersTable();
        $this->createWebsitesTable();
        $this->createCredentialsTable();
        $this->createPluginsTable();
        $this->createWebsitePluginTable();
        $this->createTemplatesTable();
        $this->createArticlesTable();

        // Scanning and monitoring tables
        $this->createWebsiteScansTable();
        $this->createScanHistoriesTable();
        $this->createScheduledScansTable();
        $this->createWebsiteGroupsTable();
        $this->createWebsiteAnalyticsTable();
        $this->createSecurityAuditsTable();
        $this->createNotificationsTable();
        $this->createDashboardPanelsTable();

        // Create indexes for performance
        $this->createPerformanceIndexes();
    }

    private function createUsersTable(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->rememberToken();
            $table->timestamps();
        });

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    private function createCacheTable(): void
    {
        Schema::create('cache', function (Blueprint $table) {
            $table->string('key')->primary();
            $table->mediumText('value');
            $table->integer('expiration');
        });

        Schema::create('cache_locks', function (Blueprint $table) {
            $table->string('key')->primary();
            $table->string('owner');
            $table->integer('expiration');
        });
    }

    private function createJobsTable(): void
    {
        Schema::create('jobs', function (Blueprint $table) {
            $table->id();
            $table->string('queue')->index();
            $table->longText('payload');
            $table->unsignedTinyInteger('attempts');
            $table->unsignedInteger('reserved_at')->nullable();
            $table->unsignedInteger('available_at');
            $table->unsignedInteger('created_at');
        });

        Schema::create('job_batches', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('name');
            $table->integer('total_jobs');
            $table->integer('pending_jobs');
            $table->integer('failed_jobs');
            $table->longText('failed_job_ids');
            $table->mediumText('options')->nullable();
            $table->integer('cancelled_at')->nullable();
            $table->integer('created_at');
            $table->integer('finished_at')->nullable();
        });

        Schema::create('failed_jobs', function (Blueprint $table) {
            $table->id();
            $table->string('uuid')->unique();
            $table->text('connection');
            $table->text('queue');
            $table->longText('payload');
            $table->longText('exception');
            $table->timestamp('failed_at')->useCurrent();
        });
    }

    private function createClientsTable(): void
    {
        Schema::create('clients', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->text('address')->nullable();
            $table->text('notes')->nullable();
            $table->string('status')->default('active');
            $table->string('contact_person')->nullable();
            $table->string('business_type')->nullable();
            $table->date('contract_start_date')->nullable();
            $table->date('contract_end_date')->nullable();
            $table->decimal('monthly_retainer', 10, 2)->nullable();
            $table->timestamps();
        });
    }

    private function createHostingProvidersTable(): void
    {
        Schema::create('hosting_providers', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('website')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            
            // Service fields
            $table->boolean('provides_hosting')->default(true);
            $table->boolean('provides_dns')->default(false);
            $table->boolean('provides_email')->default(false);
            $table->boolean('provides_domain_registration')->default(false);
            $table->string('hosting_type')->nullable();
            $table->json('service_features')->nullable();
            $table->decimal('monthly_cost', 8, 2)->nullable();
            $table->string('support_email')->nullable();
            $table->string('support_phone')->nullable();
            $table->text('control_panel_url')->nullable();
            $table->enum('support_rating', ['excellent', 'good', 'average', 'poor'])->nullable();
        });
    }

    private function createWebsitesTable(): void
    {
        Schema::create('websites', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('url');
            $table->foreignId('client_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('hosting_provider_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('dns_provider_id')->nullable()->constrained('hosting_providers')->onDelete('set null');
            $table->foreignId('email_provider_id')->nullable()->constrained('hosting_providers')->onDelete('set null');
            $table->foreignId('domain_registrar_id')->nullable()->constrained('hosting_providers')->onDelete('set null');
            $table->string('domain_name')->nullable();
            $table->string('platform')->default('wordpress');
            $table->string('status')->default('active');
            $table->text('notes')->nullable();
            $table->string('wordpress_version')->nullable();
            $table->timestamp('last_scan')->nullable();
            $table->foreignId('credential_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('group_id')->nullable()->constrained('website_groups')->onDelete('set null');
            
            // Health scoring fields
            $table->decimal('health_score', 5, 2)->nullable()->comment('Overall health score 0-100');
            $table->string('security_grade', 1)->nullable()->comment('Security grade A-F');
            $table->string('risk_level', 20)->nullable()->comment('Risk level: low, medium, high, critical');
            $table->timestamp('last_health_check')->nullable()->comment('Last health score calculation');
            
            $table->timestamps();
        });
    }

    private function createCredentialsTable(): void
    {
        Schema::create('credentials', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('username');
            $table->string('password'); // Should be encrypted
            $table->string('type')->default('wp_admin'); // wp_admin, ftp, cpanel, etc.
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    private function createPluginsTable(): void
    {
        Schema::create('plugins', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('version')->nullable();
            $table->string('author')->nullable();
            $table->string('author_uri')->nullable();
            $table->string('plugin_uri')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    private function createWebsitePluginTable(): void
    {
        Schema::create('website_plugin', function (Blueprint $table) {
            $table->id();
            $table->foreignId('website_id')->constrained()->onDelete('cascade');
            $table->foreignId('plugin_id')->constrained()->onDelete('cascade');
            $table->string('version')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamp('last_updated')->nullable();
            $table->timestamps();
            
            $table->unique(['website_id', 'plugin_id']);
        });
    }

    private function createTemplatesTable(): void
    {
        Schema::create('templates', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->longText('content');
            $table->string('type')->default('email'); // email, sms, etc.
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    private function createArticlesTable(): void
    {
        Schema::create('articles', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('excerpt')->nullable();
            $table->longText('content');
            $table->string('status')->default('draft'); // draft, published, archived
            $table->string('author')->nullable();
            $table->json('tags')->nullable();
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
        });
    }

    private function createWebsiteScansTable(): void
    {
        Schema::create('website_scans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('website_id')->constrained()->onDelete('cascade');
            $table->string('scan_type')->default('full'); // full, security, performance
            $table->json('scan_results')->nullable();
            $table->string('status')->default('pending'); // pending, running, completed, failed
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->text('error_message')->nullable();
            $table->timestamps();
        });
    }

    private function createScanHistoriesTable(): void
    {
        Schema::create('scan_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('website_id')->constrained()->onDelete('cascade');
            $table->json('scan_data');
            $table->string('scan_type')->default('manual');
            $table->string('status')->default('completed');
            $table->foreignId('scheduled_scan_id')->nullable()->constrained()->onDelete('set null');
            $table->json('security_data')->nullable();
            $table->timestamps();
        });
    }

    private function createScheduledScansTable(): void
    {
        Schema::create('scheduled_scans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('website_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->string('frequency'); // daily, weekly, monthly
            $table->json('scan_config');
            $table->boolean('is_active')->default(true);
            $table->timestamp('last_run')->nullable();
            $table->timestamp('next_run')->nullable();
            $table->string('status')->default('active');
            $table->timestamps();
        });
    }

    private function createWebsiteGroupsTable(): void
    {
        Schema::create('website_groups', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('color')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    private function createWebsiteAnalyticsTable(): void
    {
        Schema::create('website_analytics', function (Blueprint $table) {
            $table->id();
            $table->foreignId('website_id')->constrained()->onDelete('cascade');
            $table->date('date');
            $table->integer('visitors')->default(0);
            $table->integer('page_views')->default(0);
            $table->integer('unique_visitors')->default(0);
            $table->decimal('bounce_rate', 5, 2)->nullable();
            $table->integer('avg_session_duration')->nullable(); // in seconds
            $table->json('top_pages')->nullable();
            $table->json('traffic_sources')->nullable();
            $table->timestamps();
            
            $table->unique(['website_id', 'date']);
        });
    }

    private function createSecurityAuditsTable(): void
    {
        Schema::create('security_audits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('website_id')->constrained()->onDelete('cascade');
            $table->string('audit_type');
            $table->string('severity');
            $table->string('title');
            $table->text('description');
            $table->text('recommendation')->nullable();
            $table->string('affected_file')->nullable();
            $table->integer('line_number')->nullable();
            $table->json('metadata')->nullable();
            $table->string('status')->default('open');
            $table->timestamp('detected_at');
            $table->timestamp('resolved_at')->nullable();
            $table->integer('risk_score')->nullable();
            $table->boolean('exploitable')->default(false);
            $table->json('affected_versions')->nullable();
            
            // Enhanced WPScan integration fields
            $table->string('scan_id')->nullable()->comment('Unique scan session identifier');
            $table->string('vulnerability_id')->nullable()->comment('External vulnerability database ID');
            $table->string('cve_id')->nullable()->comment('CVE identifier');
            $table->string('wpvulndb_id')->nullable()->comment('WPVulnDB identifier');
            $table->string('source', 50)->default('automated')->comment('Source of vulnerability detection');
            $table->timestamp('published_date')->nullable()->comment('Vulnerability publication date');
            $table->string('fixed_in_version')->nullable()->comment('Version where vulnerability is fixed');
            $table->json('references')->nullable()->comment('External references and links');
            $table->decimal('health_score_impact', 5, 2)->nullable()->comment('Impact on health score');
            $table->string('scan_type', 50)->nullable()->comment('Type of scan that detected this');
            $table->integer('scan_duration')->nullable()->comment('Scan duration in seconds');
            $table->boolean('false_positive')->default(false)->comment('Marked as false positive');
            $table->timestamp('verified_at')->nullable()->comment('When vulnerability was manually verified');
            
            $table->timestamps();
        });
    }

    private function createNotificationsTable(): void
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->string('type');
            $table->morphs('notifiable');
            $table->text('data');
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
        });
    }

    private function createDashboardPanelsTable(): void
    {
        Schema::create('dashboard_panels', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('component');
            $table->integer('position')->default(0);
            $table->json('config')->nullable();
            $table->boolean('is_active')->default(true);
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('cascade');
            $table->timestamps();
        });
    }

    private function createPerformanceIndexes(): void
    {
        // Website indexes
        Schema::table('websites', function (Blueprint $table) {
            $table->index(['health_score'], 'websites_health_score_index');
            $table->index(['security_grade'], 'websites_security_grade_index');
            $table->index(['risk_level'], 'websites_risk_level_index');
            $table->index(['last_health_check'], 'websites_last_health_check_index');
            $table->index(['status'], 'websites_status_index');
            $table->index(['platform'], 'websites_platform_index');
            $table->index(['last_scan'], 'websites_last_scan_index');
        });

        // Security audit indexes
        Schema::table('security_audits', function (Blueprint $table) {
            $table->index(['scan_id'], 'security_audits_scan_id_index');
            $table->index(['cve_id'], 'security_audits_cve_id_index');
            $table->index(['source'], 'security_audits_source_index');
            $table->index(['published_date'], 'security_audits_published_date_index');
            $table->index(['false_positive'], 'security_audits_false_positive_index');
            $table->index(['status'], 'security_audits_status_index');
            $table->index(['severity'], 'security_audits_severity_index');
            $table->index(['detected_at'], 'security_audits_detected_at_index');
        });

        // Website plugin indexes
        Schema::table('website_plugin', function (Blueprint $table) {
            $table->index(['version'], 'website_plugin_version_index');
            $table->index(['is_active'], 'website_plugin_is_active_index');
            $table->index(['last_updated'], 'website_plugin_last_updated_index');
        });

        // Scan histories indexes
        Schema::table('scan_histories', function (Blueprint $table) {
            $table->index(['scan_type'], 'scan_histories_scan_type_index');
            $table->index(['status'], 'scan_histories_status_index');
            $table->index(['created_at'], 'scan_histories_created_at_index');
        });

        // Website analytics indexes
        Schema::table('website_analytics', function (Blueprint $table) {
            $table->index(['date'], 'website_analytics_date_index');
            $table->index(['visitors'], 'website_analytics_visitors_index');
        });

        // Scheduled scans indexes
        Schema::table('scheduled_scans', function (Blueprint $table) {
            $table->index(['is_active'], 'scheduled_scans_is_active_index');
            $table->index(['next_run'], 'scheduled_scans_next_run_index');
            $table->index(['frequency'], 'scheduled_scans_frequency_index');
        });
    }

    /**
     * Drop the fresh installation schema
     */
    private function dropFreshSchema(): void
    {
        Schema::dropIfExists('dashboard_panels');
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('security_audits');
        Schema::dropIfExists('website_analytics');
        Schema::dropIfExists('scheduled_scans');
        Schema::dropIfExists('scan_histories');
        Schema::dropIfExists('website_scans');
        Schema::dropIfExists('articles');
        Schema::dropIfExists('templates');
        Schema::dropIfExists('website_plugin');
        Schema::dropIfExists('plugins');
        Schema::dropIfExists('credentials');
        Schema::dropIfExists('websites');
        Schema::dropIfExists('website_groups');
        Schema::dropIfExists('hosting_providers');
        Schema::dropIfExists('clients');
        Schema::dropIfExists('failed_jobs');
        Schema::dropIfExists('job_batches');
        Schema::dropIfExists('jobs');
        Schema::dropIfExists('cache_locks');
        Schema::dropIfExists('cache');
        Schema::dropIfExists('sessions');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('users');
    }
};