<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AlterTableMovimientosAgregarTotales extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('movimientos', function (Blueprint $table) {
            $table->integer('total_claves')->nullable()->after('observaciones');
            $table->integer('total_insumos')->nullable()->after('total_claves');
            $table->decimal('total_monto',10,2)->default('0')->after('total_insumos');
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
            $table->dropColumn('total_claves');
            $table->dropColumn('total_insumos');
            $table->dropColumn('total_monto',10,2);
        });
    }
}
