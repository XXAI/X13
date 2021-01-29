<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AlterTableStocks extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('stocks', function (Blueprint $table) {
            $table->bigIncrements('id')->change();
            $table->dropColumn('servidor_id');
            $table->dropColumn('incremento');
            $table->bigInteger('almacen_id')->unsigned()->change();
        });

        Schema::table('movimientos_insumos', function (Blueprint $table) {
            $table->bigInteger('stock_id')->unsigned()->change();
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
            $table->string('id')->change();
            $table->string('servidor_id',4)->after('id');
            $table->bigInteger('incremento')->after('servidor_id');
            $table->string('almacen_id')->change();
        });

        Schema::table('movimientos_insumos', function (Blueprint $table) {
            $table->string('stock_id')->change();
        });
    }
}
