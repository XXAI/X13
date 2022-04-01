<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTableMovimientosModificaciones extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up(){
        Schema::create('movimientos_modificaciones', function (Blueprint $table) {
            $table->id();
            $table->bigInteger('movimiento_id')->unsigned();
            $table->string('estatus',10);
            $table->string('motivo_modificacion');
            $table->string('motivo_cancelado')->nullable();
            $table->string('motivo_revertido')->nullable();
            $table->date('solicitado_fecha');
            $table->date('aprobado_fecha')->nullable();
            $table->date('cancelado_fecha')->nullable();
            $table->date('revertido_fecha')->nullable();
            $table->bigInteger('solicitado_usuario_id');
            $table->bigInteger('aprobado_usuario_id')->nullable();
            $table->bigInteger('cancelado_usuario_id')->nullable();
            $table->bigInteger('revertido_usuario_id')->nullable();
            $table->text('estado_original')->nullable();
            $table->text('estado_modificado')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down(){
        Schema::dropIfExists('movimientos_modificaciones');
    }
}
