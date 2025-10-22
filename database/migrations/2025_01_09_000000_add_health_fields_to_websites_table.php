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
        Schema::table('websites', function (Blueprint $table) {
            $table->decimal('health_score', 5, 2)->nullable()->after('last_scan')->comment('Overall health score 0-100');
            $table->string('security_grade', 1)->nullable()->after('health_score')->comment('Security grade A-F');
            $table->string('risk_level', 20)->nullable()->after('security_grade')->comment('Risk level: low, medium, high, critical');
            $table->timestamp('last_health_check')->nullable()->after('risk_level')->comment('Last health score calculation');
            
            // Add indexes for performance on common queries
            $table->index(['health_score'], 'websites_health_score_index');
            $table->index(['security_grade'], 'websites_security_grade_index');
            $table->index(['risk_level'], 'websites_risk_level_index');
            $table->index(['last_health_check'], 'websites_last_health_check_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('websites', function (Blueprint $table) {
            $table->dropIndex('websites_health_score_index');
            $table->dropIndex('websites_security_grade_index');
            $table->dropIndex('websites_risk_level_index');
            $table->dropIndex('websites_last_health_check_index');
            
            $table->dropColumn([
                'health_score',
                'security_grade',
                'risk_level',
                'last_health_check'
            ]);
        });
    }
};