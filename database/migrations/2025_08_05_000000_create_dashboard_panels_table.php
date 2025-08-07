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
        Schema::create('dashboard_panels', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->string('type'); // panel type identifier
            $table->string('component'); // React component name
            $table->json('position'); // {x: 0, y: 0} grid position
            $table->json('size'); // {w: 4, h: 2} grid size
            $table->json('config')->nullable(); // panel-specific configuration
            $table->boolean('is_visible')->default(true);
            $table->boolean('is_default')->default(false);
            $table->string('dashboard_layout')->default('main'); // main, security, performance, etc.
            $table->integer('order')->default(0); // display order
            $table->timestamps();

            $table->index(['user_id', 'dashboard_layout']);
            $table->index(['user_id', 'is_visible']);
            $table->index(['dashboard_layout', 'order']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('dashboard_panels');
    }
};
