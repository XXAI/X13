<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AlterTableMovimientosAddSolicitudId extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('movimientos', function (Blueprint $table) {
            $table->bigInteger('solicitud_id')->unsigend()->nullable()->after('movimiento_padre_id');
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
            $table->dropColumn('solicitud_id');
        });
    }
}
