<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTableSolicitudes extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('solicitudes', function (Blueprint $table) {
            $table->id();
            $table->string('folio')->nullable();
            $table->integer('consecutivo')->nullable();
            $table->bigInteger('tipo_solicitud_id')->unsigned();
            $table->date('fecha_solicitud');
            $table->integer('mes')->nullable();
            $table->integer('anio')->nullable();
            $table->text('observaciones')->nullable();
            $table->string('estatus',10);
            $table->string('estatus_surtimiendo',10)->nullable();
            $table->bigInteger('unidad_medica_id')->unsigned();
            $table->bigInteger('almacen_id')->unsigned()->nullable();
            $table->bigInteger('area_servicio_id')->unsigned()->nullable();
            $table->bigInteger('programa_id')->unsigned()->nullable();
            $table->integer('total_claves_solicitadas')->nullable();
            $table->integer('total_articulos_solicitados')->nullable();
            $table->integer('total_claves_surtidas')->nullable();
            $table->integer('total_articulos_surtidos')->nullable();
            $table->decimal('porcentaje_claves_surtidas',5,2)->nullable();
            $table->decimal('porcentaje_articulos_surtidos',5,2)->nullable();
            $table->bigInteger('usuario_captura_id')->unsigned()->nullable();
            $table->bigInteger('usuario_finaliza_id')->unsigned()->nullable();
            $table->bigInteger('usuario_cancela_id')->unsigned()->nullable();
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
        Schema::dropIfExists('solicitudes');
    }
}
