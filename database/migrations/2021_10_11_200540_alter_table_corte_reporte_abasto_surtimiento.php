<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AlterTableCorteReporteAbastoSurtimiento extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('corte_reporte_abasto_surtimiento', function (Blueprint $table) {
            $table->bigInteger('config_captura_id')->unsigned()->nullable()->after('id');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('corte_reporte_abasto_surtimiento', function (Blueprint $table) {
            $table->dropColumn('config_captura_id');
        });
    }
}
