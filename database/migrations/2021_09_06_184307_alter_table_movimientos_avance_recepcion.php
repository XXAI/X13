<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AlterTableMovimientosAvanceRecepcion extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('pedidos_avance_recepcion', function (Blueprint $table) {
            $table->renameColumn('total_insumos_recibidos','total_articulos_recibidos');
            $table->renameColumn('porcentaje_insumos','porcentaje_articulos');
        });

        Schema::table('movimientos', function (Blueprint $table) {
            $table->renameColumn('total_insumos','total_articulos');
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
            $table->renameColumn('total_articulos','total_insumos');
        });

        Schema::table('pedidos_avance_recepcion', function (Blueprint $table) {
            $table->renameColumn('total_articulos_recibidos','total_insumos_recibidos');
            $table->renameColumn('porcentaje_articulos','porcentaje_insumos');
        });
    }
}
