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
        Schema::create('website_groups', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Group name (e.g., "Production Sites", "Client Projects")
            $table->text('description')->nullable(); // Optional description
            $table->string('color', 7)->default('#3B82F6'); // Hex color for visual identification
            $table->string('icon')->nullable(); // Optional icon class/name
            $table->integer('sort_order')->default(0); // For custom ordering
            $table->boolean('is_active')->default(true); // Whether group is active
            $table->timestamps();
            
            // Add indexes
            $table->index(['is_active', 'sort_order']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('website_groups');
    }
};
