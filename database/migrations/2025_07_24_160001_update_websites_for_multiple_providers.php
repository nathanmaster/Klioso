<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::table('websites', function (Blueprint $table) {
            // Add separate provider fields
            $table->unsignedBigInteger('dns_provider_id')->nullable()->after('hosting_provider_id');
            $table->unsignedBigInteger('email_provider_id')->nullable()->after('dns_provider_id');
            $table->unsignedBigInteger('domain_registrar_id')->nullable()->after('email_provider_id');
            
            // Remove the old dns_provider string field
            $table->dropColumn('dns_provider');
            
            // Add foreign key constraints
            $table->foreign('dns_provider_id')->references('id')->on('hosting_providers')->onDelete('set null');
            $table->foreign('email_provider_id')->references('id')->on('hosting_providers')->onDelete('set null');
            $table->foreign('domain_registrar_id')->references('id')->on('hosting_providers')->onDelete('set null');
        });
    }

    public function down()
    {
        Schema::table('websites', function (Blueprint $table) {
            $table->dropForeign(['dns_provider_id']);
            $table->dropForeign(['email_provider_id']);
            $table->dropForeign(['domain_registrar_id']);
            
            $table->dropColumn(['dns_provider_id', 'email_provider_id', 'domain_registrar_id']);
            $table->string('dns_provider')->nullable();
        });
    }
};
