<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTableMovimientosArticulos extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('movimientos_articulos', function (Blueprint $table) {
            $table->id();
            $table->bigInteger('movimiento_id')->unsigned();
            $table->bigInteger('stock_id')->unsigned();
            $table->bigInteger('bien_servicio_id')->unsigned();
            $table->string('direccion_movimiento',5)->comment('ENT: Entrada, SAL: Salida, AJS: Ajuste Mas/Menos');
            $table->string('modo_movimiento',5)->comment('NRM: Normal, UNI: Unidosis, MAS: Ajuste Mas, MNS: Ajuste Menos');
            $table->bigInteger('cantidad');
            $table->bigInteger('cantidad_anterior');
            $table->string('user_id');
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
        Schema::dropIfExists('movimientos_articulos');
    }
}
