<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AlterTablesAddStockPadreId extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('movimientos_articulos', function (Blueprint $table) {
            $table->bigInteger('stock_padre_id')->after('movimiento_id')->unsigned()->nullable();
            $table->bigInteger('cantidad_anterior')->nullable()->change();
            $table->foreign('stock_padre_id')->references('id')->on('stocks');
        });

        Schema::table('stocks', function (Blueprint $table) {
            $table->bigInteger('stock_padre_id')->after('resguardo_piezas')->unsigned()->nullable();
            $table->foreign('stock_padre_id')->references('id')->on('stocks');
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
            $table->dropForeign(['stock_padre_id']);
            $table->dropColumn('stock_padre_id');
        });

        Schema::table('stocks', function (Blueprint $table) {
            $table->dropForeign(['stock_padre_id']);
            $table->dropColumn('stock_padre_id');
        });
    }
}
