<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AlterTableMovimientosArticulosBorradorAddCantidadSolicitado extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('movimientos_articulos_borrador', function (Blueprint $table) {
            $table->bigInteger('cantidad_solicitado')->nullable()->after('codigo_barras');
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
            $table->dropColumn('cantidad_solicitado');
        });
    }
}
