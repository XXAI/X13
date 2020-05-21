<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTableMovimientos extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('movimientos', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('servidor_id',4);
            $table->bigInteger('incremento');
            $table->string('almacen_id');
            $table->string('direccion_movimiento',5)->comment('ENT: Entrada, SAL: Salida, AJS: Ajuste Mas/Menos');
            $table->string('estatus',5)->comment('BR: Borrador, FI: Finalizado, CN: Cancelado');
            $table->date('fecha_movimiento')->nullable();
            $table->integer('programa_id')->unsigned()->nullable();
            $table->string('folio',150)->nullable();
            $table->string('descripcion')->nullable();
            $table->text('observaciones')->nullable();
            $table->boolean('cancelado')->default(false);
            $table->date('fecha_cancelacion')->nullable();
            $table->string('motivo_cancelacion')->nullable();
            $table->string('user_id');
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('programa_id')->references('id')->on('catalogo_programas');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('movimientos');
    }
}
