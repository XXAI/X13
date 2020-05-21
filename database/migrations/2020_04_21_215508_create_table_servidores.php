<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTableServidores extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('servidores', function (Blueprint $table) {
            $table->string('id',4)->primary();
            $table->string('nombre',150);
            $table->string('secret_key',32);
            $table->string('clues',45)->nullable();
            $table->boolean('tiene_internet')->default(false);
            $table->string('version',100);
            $table->boolean('principal')->default(false);
            $table->timestamp('ultima_sincronizacion')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('servidores');
    }
}
