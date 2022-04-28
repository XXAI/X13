<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AlterTableStocksAddIndexes extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('stocks', function (Blueprint $table) {
            $table->bigInteger('programa_id')->unsigned()->nullable()->change();

            $table->index('lote');
            $table->index('fecha_caducidad');
            $table->index('no_serie');
            $table->index('modelo');
            $table->index('codigo_barras');

            $table->foreign('unidad_medica_id')->references('id')->on('catalogo_unidades_medicas');
            $table->foreign('almacen_id')->references('id')->on('almacenes');
            $table->foreign('bien_servicio_id')->references('id')->on('bienes_servicios');
            $table->foreign('programa_id')->references('id')->on('programas');
            $table->foreign('marca_id')->references('id')->on('catalogo_marcas');
            $table->foreign('user_id')->references('id')->on('users');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('stocks', function (Blueprint $table) {
            $table->dropIndex(['lote']);
            $table->dropIndex(['fecha_caducidad']);
            $table->dropIndex(['no_serie']);
            $table->dropIndex(['modelo']);
            $table->dropIndex(['codigo_barras']);

            $table->dropForeign(['unidad_medica_id']);
            $table->dropForeign(['almacen_id']);
            $table->dropForeign(['bien_servicio_id']);
            $table->dropForeign(['programa_id']);
            $table->dropForeign(['marca_id']);
            $table->dropForeign(['user_id']);
        });
    }
}
