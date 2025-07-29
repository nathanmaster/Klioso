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
        Schema::create('security_audits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('website_id')->constrained()->onDelete('cascade');
            
            // Audit Information
            $table->string('audit_type'); // 'vulnerability', 'malware', 'config', 'ssl'
            $table->enum('severity', ['low', 'medium', 'high', 'critical']);
            $table->string('title'); // Issue title
            $table->text('description'); // Detailed description
            $table->text('recommendation')->nullable(); // How to fix
            
            // Technical Details
            $table->string('affected_file')->nullable(); // File path if applicable
            $table->integer('line_number')->nullable(); // Line number if applicable
            $table->json('metadata')->nullable(); // Additional data
            
            // Status
            $table->enum('status', ['open', 'fixed', 'ignored', 'false_positive'])->default('open');
            $table->datetime('detected_at'); // When issue was found
            $table->datetime('resolved_at')->nullable(); // When issue was resolved
            
            // Risk Assessment
            $table->integer('risk_score')->nullable(); // 1-10 risk score
            $table->boolean('exploitable')->default(false); // Can be exploited
            $table->json('affected_versions')->nullable(); // Affected software versions
            
            $table->timestamps();
            
            // Indexes
            $table->index(['website_id', 'status', 'severity']);
            $table->index(['audit_type', 'detected_at']);
            $table->index(['severity', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('security_audits');
    }
};
