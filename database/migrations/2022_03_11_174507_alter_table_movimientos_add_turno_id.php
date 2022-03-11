<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AlterTableMovimientosAddTurnoId extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('movimientos', function (Blueprint $table) {
            $table->bigInteger('turno_id')->unsigned()->nullable()->after('fecha_movimiento');
            $table->bigInteger('personal_medico_id')->unsigned()->nullable()->after('persona_id');
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
            $table->dropColumn('turno_id');
            $table->dropColumn('personal_medico_id');
        });
    }
}
