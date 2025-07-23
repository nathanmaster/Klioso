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
        Schema::create('website_scans', function (Blueprint $table) {
            $table->id();
            $table->string('url');
            $table->string('status')->default('pending'); // pending, completed, failed
            $table->json('plugins')->nullable(); // Store detected plugins as JSON
            $table->json('themes')->nullable(); // Store detected themes as JSON
            $table->string('wordpress_version')->nullable();
            $table->text('raw_output')->nullable(); // Store raw scan output
            $table->text('error_message')->nullable();
            $table->timestamp('scanned_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('website_scans');
    }
};
