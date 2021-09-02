<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTableMovimientosArticulosBorrador extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('movimientos_articulos_borrador', function (Blueprint $table) {
            $table->id();
            $table->bigInteger('movimiento_id')->unsigned();
            $table->bigInteger('bien_servicio_id')->unsigned();
            $table->string('direccion_movimiento',5)->comment('ENT: Entrada, SAL: Salida, AJS: Ajuste Mas/Menos');
            $table->string('modo_movimiento',5)->comment('NRM: Normal, UNI: Unidosis, MAS: Ajuste Mas, MNS: Ajuste Menos');
            $table->bigInteger('cantidad');
            $table->integer('marca_id')->unsigned()->nullable();
            $table->string('lote',200);
            $table->date('fecha_caducidad')->nullable();
            $table->string('codigo_barras',100)->nullable();
            $table->string('user_id');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('movimientos_articulos_borrador');
    }
}
