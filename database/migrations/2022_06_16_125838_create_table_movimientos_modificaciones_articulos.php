<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTableMovimientosModificacionesArticulos extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('movimientos_modificaciones_articulos', function (Blueprint $table) {
            $table->id();
            $table->bigInteger('modificacion_id')->unsigned();
            $table->string('tipo_modificacion',5)->comments('ADD = Agregar, DEL = eliminar, PUT = Actualizar');
            $table->bigInteger('movimiento_articulo_id')->unsigned()->nullable();
            $table->text('registro_original')->nullable();
            $table->text('registro_modificado')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('modificacion_id')->references('id')->on('movimientos_modificaciones');
            $table->foreign('movimiento_articulo_id','movimiento_articulo_id_foreign')->references('id')->on('movimientos_articulos');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('movimientos_modificaciones_articulos');
    }
}
