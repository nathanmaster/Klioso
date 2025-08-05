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
        Schema::table('scheduled_scans', function (Blueprint $table) {
            $table->string('name')->after('id');
            $table->string('scan_type')->default('full')->after('name');
            $table->string('target')->default('website')->after('scan_type');
            $table->foreignId('website_id')->nullable()->constrained()->onDelete('cascade')->after('target');
            $table->enum('frequency', ['daily', 'weekly', 'monthly'])->default('weekly')->after('website_id');
            $table->time('scheduled_time')->default('02:00')->after('frequency');
            $table->json('scan_config')->nullable()->after('scheduled_time');
            $table->boolean('is_active')->default(true)->after('scan_config');
            $table->timestamp('last_run_at')->nullable()->after('is_active');
            $table->timestamp('next_run_at')->nullable()->after('last_run_at');
            $table->integer('success_count')->default(0)->after('next_run_at');
            $table->integer('failure_count')->default(0)->after('success_count');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('scheduled_scans', function (Blueprint $table) {
            $table->dropForeign(['website_id']);
            $table->dropColumn([
                'name', 'scan_type', 'target', 'website_id', 'frequency', 
                'scheduled_time', 'scan_config', 'is_active', 'last_run_at', 
                'next_run_at', 'success_count', 'failure_count'
            ]);
        });
    }
};
