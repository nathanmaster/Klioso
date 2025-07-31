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
            $table->enum('status', ['idle', 'queued', 'running', 'completed', 'failed'])->default('idle')->after('is_active');
            $table->timestamp('started_at')->nullable()->after('status');
            $table->text('current_stage')->nullable()->after('started_at');
            $table->integer('progress_percent')->default(0)->after('current_stage');
            $table->text('last_error')->nullable()->after('failure_count');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('scheduled_scans', function (Blueprint $table) {
            $table->dropColumn(['status', 'started_at', 'current_stage', 'progress_percent', 'last_error']);
        });
    }
};
