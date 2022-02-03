<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AlterTableMovimientosAddTipoMovimentoExtraFields extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('movimientos', function (Blueprint $table) {
            $table->dropColumn('clues');
            $table->bigInteger('almacen_movimiento_id')->unsigned()->nullable()->after('unidad_medica_movimiento_id');
            $table->bigInteger('area_servicio_movimiento_id')->unsigned()->nullable()->after('almacen_movimiento_id');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('movimientos', function (Blueprint $table) {
            $table->string('clues',10)->nullable();
            $table->dropColumn('almacen_movimiento_id');
            $table->dropColumn('area_servicio_movimiento_id');
        });
    }
}
