<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTableSolicitudesArticulos extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('solicitudes_articulos', function (Blueprint $table) {
            $table->id();
            $table->bigInteger('solicitud_id')->unsigned();
            $table->bigInteger('bien_servicio_id')->unsigned();
            $table->integer('cantidad_solicitada');
            $table->integer('cantidad_surtida');
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
        Schema::dropIfExists('solicitudes_articulos');
    }
}
