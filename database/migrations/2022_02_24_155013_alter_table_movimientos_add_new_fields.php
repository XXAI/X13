<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AlterTableMovimientosAddNewFields extends Migration{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up(){
        Schema::table('movimientos', function (Blueprint $table) {
            $table->boolean('es_colectivo')->after('area_servicio_movimiento_id')->nullable();
            $table->bigInteger('persona_id')->unsigned()->after('es_colectivo')->nullable();
            $table->bigInteger('movimiento_padre_id')->unsigned()->after('motivo_cancelacion')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down(){
        Schema::table('movimientos', function (Blueprint $table) {
            $table->dropColumn('es_colectivo');
            $table->dropColumn('persona_id');
            $table->dropColumn('movimiento_padre_id');
        });
    }
}
