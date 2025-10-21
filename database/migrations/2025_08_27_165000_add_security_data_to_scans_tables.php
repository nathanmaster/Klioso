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
        Schema::table('website_scans', function (Blueprint $table) {
            $table->json('security_data')->nullable()->after('raw_output');
            $table->string('type')->default('standard')->after('status'); // standard, security_scan, bulk_security_scan
        });
        
        // Also add to scan_history table if it exists
        if (Schema::hasTable('scan_history')) {
            Schema::table('scan_history', function (Blueprint $table) {
                $table->json('security_data')->nullable()->after('scan_data');
                $table->string('type')->default('standard')->after('status');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('website_scans', function (Blueprint $table) {
            $table->dropColumn(['security_data', 'type']);
        });
        
        if (Schema::hasTable('scan_history')) {
            Schema::table('scan_history', function (Blueprint $table) {
                $table->dropColumn(['security_data', 'type']);
            });
        }
    }
};
