<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::create('credentials', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('credentiable_id');
            $table->string('credentiable_type');
            $table->string('type');
            $table->string('username');
            $table->text('password'); // Should be encrypted in the model
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['credentiable_id', 'credentiable_type']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('credentials');
    }
};
