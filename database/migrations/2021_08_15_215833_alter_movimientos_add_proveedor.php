<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AlterMovimientosAddProveedor extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('movimientos', function (Blueprint $table) {
            $table->bigInteger('proveedor_id')->after('programa_id')->unsigned()->nullable();
            $table->string('clues')->after('proveedor_id')->nullable();
        });

        Schema::table('movimientos_insumos', function (Blueprint $table) {
            $table->integer('bienes_servicios_id')->after('stock_id')->unsigned()->nullable();
            $table->bigInteger('cantidad_anterior')->after('cantidad')->unsigned()->nullable();
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
            $table->dropColumn('proveedor_id');
            $table->dropColumn('clues');
        });

        Schema::table('movimientos_insumos', function (Blueprint $table) {
            $table->dropColumn('bienes_servicios_id');
            $table->dropColumn('cantidad_anterior');
        });
    }
}
