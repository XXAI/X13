<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AlterStockAddBienesServiciosId extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('stocks', function (Blueprint $table) {
            $table->dropColumn(['insumo_medico_id']);
            $table->bigInteger('bienes_servicios_id')->unsigned()->nullable()->after('almacen_id');
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
            $table->dropColumn(['bienes_servicios_id']);
            $table->bigInteger('insumo_medico_id')->unsigned()->nullable()->after('almacen_id');
        });
    }
}
