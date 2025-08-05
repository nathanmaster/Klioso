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
        Schema::create('website_analytics', function (Blueprint $table) {
            $table->id();
            $table->foreignId('website_id')->constrained()->onDelete('cascade');
            
            // Performance Metrics
            $table->decimal('load_time', 8, 3)->nullable(); // Page load time in seconds
            $table->integer('response_code')->nullable(); // HTTP response code
            $table->boolean('is_online')->default(true); // Website status
            $table->decimal('uptime_percentage', 5, 2)->nullable(); // Uptime percentage
            
            // Security Metrics
            $table->integer('security_score')->nullable(); // Security score 0-100
            $table->json('vulnerabilities')->nullable(); // Array of found vulnerabilities
            $table->boolean('ssl_valid')->nullable(); // SSL certificate status
            $table->datetime('ssl_expiry')->nullable(); // SSL expiration date
            
            // SEO & Compliance
            $table->integer('seo_score')->nullable(); // SEO score 0-100
            $table->boolean('gdpr_compliant')->nullable(); // GDPR compliance
            $table->boolean('accessibility_compliant')->nullable(); // Accessibility compliance
            
            // WordPress Specific
            $table->string('wp_version')->nullable(); // WordPress version
            $table->boolean('wp_updates_available')->default(false); // Updates available
            $table->integer('plugin_count')->nullable(); // Number of plugins
            $table->integer('outdated_plugins')->nullable(); // Number of outdated plugins
            
            // Health Score
            $table->integer('health_score')->nullable(); // Overall health score 0-100
            $table->json('health_issues')->nullable(); // Array of health issues
            
            // Metadata
            $table->datetime('scanned_at'); // When the scan was performed
            $table->string('scan_type')->default('full'); // Type of scan (full, quick, security)
            $table->text('notes')->nullable(); // Additional notes
            
            $table->timestamps();
            
            // Indexes for performance
            $table->index(['website_id', 'scanned_at']);
            $table->index(['health_score', 'scanned_at']);
            $table->index(['security_score', 'scanned_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('website_analytics');
    }
};
