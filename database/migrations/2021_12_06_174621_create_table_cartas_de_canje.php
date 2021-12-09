<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTableCartasDeCanje extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('cartas_canje', function (Blueprint $table) {
            $table->id();
            $table->bigInteger('movimiento_id')->unsigned()->nullable();
            $table->bigInteger('movimiento_articulo_id')->unsigned()->nullable();
            $table->bigInteger('stock_id')->unsigned();
            $table->bigInteger('bien_servicio_id')->unsigned();
            $table->integer('cantidad');
            $table->string('memo_folio');
            $table->date('memo_fecha');
            $table->integer('vigencia_meses');
            $table->date('vigencia_fecha');
            $table->text('obervaciones')->nullable();
            $table->string('estatus',5)->comments('PEN: Pendiente; EXP: Expirado; CAN: Cancelado; APL: Aplicado');

            $table->bigInteger('creado_por_usuario_id')->unsigned()->nullable();
            $table->bigInteger('cancelado_por_usuario_id')->unsigned()->nullable();
            $table->bigInteger('aplicado_por_usuario_id')->unsigned()->nullable();
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
        Schema::dropIfExists('cartas_canje');
    }
}
