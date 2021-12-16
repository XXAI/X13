<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AlterTableMovimientosPreparandoParaSalidas extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('movimientos', function (Blueprint $table) {
            $table->bigInteger('unidad_medica_movimiento_id')->unsigned()->nullable()->after('proveedor_id');
            $table->renameColumn('pedido_folio','documento_folio')->change();
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
            $table->dropColumn('unidad_medica_movimiento_id');
            $table->renameColumn('documento_folio','pedido_folio')->change();
        });
    }
}
