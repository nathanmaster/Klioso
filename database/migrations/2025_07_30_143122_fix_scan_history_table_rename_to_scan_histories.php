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
        Schema::rename('scan_history', 'scan_histories');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::rename('scan_histories', 'scan_history');
    }
};
