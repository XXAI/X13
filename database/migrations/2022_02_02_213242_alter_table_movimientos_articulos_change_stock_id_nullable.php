<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AlterTableMovimientosArticulosChangeStockIdNullable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('movimientos_articulos', function (Blueprint $table) {
            $table->bigInteger('stock_id')->unsigned()->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('movimientos_articulos', function (Blueprint $table) {
            $table->bigInteger('stock_id')->unsigned()->change();
        });
    }
}
