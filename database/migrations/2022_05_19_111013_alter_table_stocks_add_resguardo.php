<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AlterTableStocksAddResguardo extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('stocks', function (Blueprint $table) {
            $table->bigInteger('resguardo_piezas')->default(0)->after('existencia_unidades');
            $table->renameColumn('existencia_unidades','existencia_piezas');
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
            $table->renameColumn('existencia_piezas','existencia_unidades');
            $table->dropColumn('resguardo_piezas');
        });
    }
}
