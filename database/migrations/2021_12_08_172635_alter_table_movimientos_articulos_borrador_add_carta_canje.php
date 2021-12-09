<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AlterTableMovimientosArticulosBorradorAddCartaCanje extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('movimientos_articulos_borrador', function (Blueprint $table) {
            $table->string('memo_folio')->nullable()->after('total_monto');
            $table->date('memo_fecha')->nullable()->after('memo_folio');
            $table->integer('vigencia_meses')->nullable()->after('memo_fecha');
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
            $table->dropColumn('memo_folio');
            $table->dropColumn('memo_fecha');
            $table->dropColumn('vigencia_meses');
        });
    }
}
