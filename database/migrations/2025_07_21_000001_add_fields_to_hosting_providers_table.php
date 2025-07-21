<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::table('hosting_providers', function (Blueprint $table) {
            $table->text('description')->nullable()->after('name');
            $table->string('website')->nullable()->after('description');
            $table->text('contact_info')->nullable()->after('website');
            $table->text('notes')->nullable()->after('contact_info');
        });
    }

    public function down()
    {
        Schema::table('hosting_providers', function (Blueprint $table) {
            $table->dropColumn(['description', 'website', 'contact_info', 'notes']);
        });
    }
};
