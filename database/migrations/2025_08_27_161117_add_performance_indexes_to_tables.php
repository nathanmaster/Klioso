<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Add indexes to scheduled_scans table for better performance
        Schema::table('scheduled_scans', function (Blueprint $table) {
            $table->index(['is_active', 'next_run_at'], 'idx_scheduled_scans_active_next_run');
            $table->index(['website_id', 'is_active'], 'idx_scheduled_scans_website_active');
            $table->index(['frequency', 'is_active'], 'idx_scheduled_scans_frequency_active');
            $table->index(['last_run_at'], 'idx_scheduled_scans_last_run');
        });

        // Add indexes to websites table for better search performance
        Schema::table('websites', function (Blueprint $table) {
            $table->index(['domain_name'], 'idx_websites_domain_name');
            $table->index(['created_at'], 'idx_websites_created_at');
            $table->index(['group_id'], 'idx_websites_group_id');
        });

        // Add indexes to website_groups table
        Schema::table('website_groups', function (Blueprint $table) {
            $table->index(['name'], 'idx_website_groups_name');
            $table->index(['created_at'], 'idx_website_groups_created_at');
        });

        // Add indexes to users table for authentication performance
        Schema::table('users', function (Blueprint $table) {
            $table->index(['email'], 'idx_users_email');
            $table->index(['created_at'], 'idx_users_created_at');
        });

        // Add composite indexes for common query patterns
        Schema::table('scan_history', function (Blueprint $table) {
            $table->index(['website_id', 'status', 'created_at'], 'idx_scan_history_composite');
            $table->index(['scan_type', 'status'], 'idx_scan_history_type_status');
        });

        // Add indexes to website_analytics for dashboard queries
        Schema::table('website_analytics', function (Blueprint $table) {
            $table->index(['is_online', 'scanned_at'], 'idx_website_analytics_online_scanned');
            $table->index(['wp_updates_available', 'scanned_at'], 'idx_website_analytics_updates_scanned');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('scheduled_scans', function (Blueprint $table) {
            $table->dropIndex('idx_scheduled_scans_active_next_run');
            $table->dropIndex('idx_scheduled_scans_website_active');
            $table->dropIndex('idx_scheduled_scans_frequency_active');
            $table->dropIndex('idx_scheduled_scans_last_run');
        });

        Schema::table('websites', function (Blueprint $table) {
            $table->dropIndex('idx_websites_domain_name');
            $table->dropIndex('idx_websites_created_at');
            $table->dropIndex('idx_websites_group_id');
        });

        Schema::table('website_groups', function (Blueprint $table) {
            $table->dropIndex('idx_website_groups_name');
            $table->dropIndex('idx_website_groups_created_at');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex('idx_users_email');
            $table->dropIndex('idx_users_created_at');
        });

        Schema::table('scan_history', function (Blueprint $table) {
            $table->dropIndex('idx_scan_history_composite');
            $table->dropIndex('idx_scan_history_type_status');
        });

        Schema::table('website_analytics', function (Blueprint $table) {
            $table->dropIndex('idx_website_analytics_online_scanned');
            $table->dropIndex('idx_website_analytics_updates_scanned');
        });
    }
};
