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
        Schema::create('scan_history', function (Blueprint $table) {
            $table->id();
            $table->string('scan_type'); // 'url' or 'website'
            $table->string('target'); // URL or website name
            $table->foreignId('website_id')->nullable()->constrained()->onDelete('cascade');
            $table->json('scan_results'); // Store the complete scan results
            $table->json('scan_summary'); // Store summary data (counts, etc.)
            $table->integer('plugins_found')->default(0);
            $table->integer('themes_found')->default(0);
            $table->integer('vulnerabilities_found')->default(0);
            $table->boolean('auto_sync_enabled')->default(false);
            $table->integer('plugins_added_to_db')->default(0);
            $table->enum('status', ['completed', 'failed', 'partial'])->default('completed');
            $table->text('error_message')->nullable();
            $table->integer('scan_duration_ms')->nullable(); // Scan duration in milliseconds
            $table->timestamps();
            
            // Add indexes for better query performance
            $table->index(['scan_type', 'created_at']);
            $table->index(['website_id', 'created_at']);
            $table->index(['status', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('scan_history');
    }
};
