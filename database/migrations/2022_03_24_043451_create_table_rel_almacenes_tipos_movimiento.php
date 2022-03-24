<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTableRelAlmacenesTiposMovimiento extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('rel_almacenes_tipos_movimiento', function (Blueprint $table) {
            $table->bigInteger('almacen_id')->unsigned();
            $table->bigInteger('tipo_movimiento_id')->unsigned();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('rel_almacenes_tipos_movimiento');
    }
}
