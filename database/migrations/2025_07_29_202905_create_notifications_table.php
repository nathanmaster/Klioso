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
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('website_id')->nullable()->constrained()->onDelete('cascade');
            
            // Notification Details
            $table->string('type'); // 'security', 'performance', 'update', 'ssl', 'downtime'
            $table->enum('priority', ['low', 'medium', 'high', 'urgent']);
            $table->string('title');
            $table->text('message');
            $table->json('data')->nullable(); // Additional notification data
            
            // Status
            $table->boolean('read')->default(false);
            $table->datetime('read_at')->nullable();
            $table->boolean('dismissed')->default(false);
            $table->datetime('dismissed_at')->nullable();
            
            // Delivery
            $table->boolean('email_sent')->default(false);
            $table->datetime('email_sent_at')->nullable();
            $table->boolean('push_sent')->default(false);
            $table->datetime('push_sent_at')->nullable();
            
            $table->timestamps();
            
            // Indexes
            $table->index(['user_id', 'read', 'created_at']);
            $table->index(['type', 'priority', 'created_at']);
            $table->index(['website_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
