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
        Schema::table('security_audits', function (Blueprint $table) {
            $table->string('scan_id')->nullable()->after('risk_score')->comment('Unique scan session identifier');
            $table->string('vulnerability_id')->nullable()->after('scan_id')->comment('External vulnerability database ID');
            $table->string('cve_id')->nullable()->after('vulnerability_id')->comment('CVE identifier');
            $table->string('wpvulndb_id')->nullable()->after('cve_id')->comment('WPVulnDB identifier');
            $table->string('source', 50)->default('automated')->after('wpvulndb_id')->comment('Source of vulnerability detection');
            $table->timestamp('published_date')->nullable()->after('source')->comment('Vulnerability publication date');
            $table->string('fixed_in_version')->nullable()->after('published_date')->comment('Version where vulnerability is fixed');
            $table->json('references')->nullable()->after('fixed_in_version')->comment('External references and links');
            $table->decimal('health_score_impact', 5, 2)->nullable()->after('references')->comment('Impact on health score');
            $table->string('scan_type', 50)->nullable()->after('health_score_impact')->comment('Type of scan that detected this');
            $table->integer('scan_duration')->nullable()->after('scan_type')->comment('Scan duration in seconds');
            $table->boolean('false_positive')->default(false)->after('scan_duration')->comment('Marked as false positive');
            $table->timestamp('verified_at')->nullable()->after('false_positive')->comment('When vulnerability was manually verified');
            
            // Add indexes for better query performance
            $table->index(['scan_id'], 'security_audits_scan_id_index');
            $table->index(['cve_id'], 'security_audits_cve_id_index');
            $table->index(['source'], 'security_audits_source_index');
            $table->index(['published_date'], 'security_audits_published_date_index');
            $table->index(['false_positive'], 'security_audits_false_positive_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('security_audits', function (Blueprint $table) {
            $table->dropIndex('security_audits_scan_id_index');
            $table->dropIndex('security_audits_cve_id_index');
            $table->dropIndex('security_audits_source_index');
            $table->dropIndex('security_audits_published_date_index');
            $table->dropIndex('security_audits_false_positive_index');
            
            $table->dropColumn([
                'scan_id',
                'vulnerability_id',
                'cve_id',
                'wpvulndb_id',
                'source',
                'published_date',
                'fixed_in_version',
                'references',
                'health_score_impact',
                'scan_type',
                'scan_duration',
                'false_positive',
                'verified_at'
            ]);
        });
    }
};