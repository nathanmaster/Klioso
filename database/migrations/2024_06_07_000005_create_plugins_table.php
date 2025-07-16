<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::create('plugins', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->boolean('is_paid')->default(false);
            $table->string('purchase_url')->nullable();
            $table->string('install_source');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('plugins');
    }
};
