<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AlterTableMovimientosArticulosBorradorAddStockId extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('movimientos_articulos_borrador', function (Blueprint $table) {
            $table->bigInteger('stock_id')->unsigned()->nullable()->after('bien_servicio_id');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('movimientos_articulos_borrador', function (Blueprint $table) {
            $table->dropColumn('stock_id');
        });
    }
}
