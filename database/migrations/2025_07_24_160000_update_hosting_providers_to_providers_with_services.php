<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::table('hosting_providers', function (Blueprint $table) {
            // Add service type boolean fields - check if they exist first
            if (!Schema::hasColumn('hosting_providers', 'provides_hosting')) {
                $table->boolean('provides_hosting')->default(false)->after('notes');
            }
            if (!Schema::hasColumn('hosting_providers', 'provides_dns')) {
                $table->boolean('provides_dns')->default(false)->after('provides_hosting');
            }
            if (!Schema::hasColumn('hosting_providers', 'provides_email')) {
                $table->boolean('provides_email')->default(false)->after('provides_dns');
            }
            if (!Schema::hasColumn('hosting_providers', 'provides_domain_registration')) {
                $table->boolean('provides_domain_registration')->default(false)->after('provides_email');
            }
            
            // Only add login_url if it doesn't exist
            if (!Schema::hasColumn('hosting_providers', 'login_url')) {
                $table->string('login_url')->nullable()->after('provides_domain_registration');
            }
        });
    }

    public function down()
    {
        Schema::table('hosting_providers', function (Blueprint $table) {
            $table->dropColumn([
                'provides_hosting',
                'provides_dns', 
                'provides_email',
                'provides_domain_registration'
            ]);
            
            // Only drop login_url if we added it (check if it exists and our other columns don't)
            // This is a bit complex to check reliably, so we'll leave login_url alone in rollback
        });
    }
};
