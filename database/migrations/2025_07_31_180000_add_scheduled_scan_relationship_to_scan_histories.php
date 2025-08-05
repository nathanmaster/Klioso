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
        Schema::table('scan_histories', function (Blueprint $table) {
            // Add scheduled scan relationship
            $table->foreignId('scheduled_scan_id')->nullable()->after('website_id')->constrained()->onDelete('set null');
            
            // Add scan execution metadata for better tracking
            $table->string('scan_trigger')->default('manual')->after('scan_type'); // 'manual', 'scheduled', 'api'
            $table->timestamp('scan_started_at')->nullable()->after('scan_duration_ms');
            $table->timestamp('scan_completed_at')->nullable()->after('scan_started_at');
            
            // Add index for better performance
            $table->index(['scheduled_scan_id', 'created_at']);
            $table->index(['scan_trigger', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('scan_histories', function (Blueprint $table) {
            $table->dropForeign(['scheduled_scan_id']);
            $table->dropIndex(['scheduled_scan_id', 'created_at']);
            $table->dropIndex(['scan_trigger', 'created_at']);
            $table->dropColumn(['scheduled_scan_id', 'scan_trigger', 'scan_started_at', 'scan_completed_at']);
        });
    }
};
