<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTableBienesServicios extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('bienes_servicios', function (Blueprint $table) {
            $table->id();
            $table->integer('clave_partida_especifica')->unsigned()->nullable();
            $table->bigInteger('familia_id')->unsigned()->nullable();
            $table->string('clave_cubs',18)->nullable();
            $table->string('articulo',255);
            $table->string('especificaciones',1000);

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
        Schema::dropIfExists('bienes_servicios');
    }
}
