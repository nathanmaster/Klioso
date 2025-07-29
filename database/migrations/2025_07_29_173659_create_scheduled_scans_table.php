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
        Schema::create('scheduled_scans', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // User-friendly name for the schedule
            $table->enum('scan_type', ['url', 'website']); // Type of scan
            $table->string('target'); // URL or website identifier
            $table->foreignId('website_id')->nullable()->constrained()->onDelete('cascade');
            $table->enum('frequency', ['daily', 'weekly', 'monthly']); // Scan frequency
            $table->time('scheduled_time')->default('02:00:00'); // Time to run scan
            $table->json('scan_config'); // Scan configuration (scan_type, auto_sync, etc.)
            $table->boolean('is_active')->default(true); // Whether schedule is active
            $table->timestamp('last_run_at')->nullable(); // Last execution time
            $table->timestamp('next_run_at')->nullable(); // Next scheduled execution
            $table->integer('total_runs')->default(0); // Total number of executions
            $table->integer('successful_runs')->default(0); // Number of successful runs
            $table->integer('failed_runs')->default(0); // Number of failed runs
            $table->text('last_error')->nullable(); // Last error message
            $table->timestamps();
            
            // Add indexes for performance
            $table->index(['is_active', 'next_run_at']);
            $table->index(['scan_type', 'is_active']);
            $table->index(['website_id', 'is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('scheduled_scans');
    }
};
