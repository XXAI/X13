<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AlterTableMovimientosInsumosBorrador extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('movimientos_insumos_borrador', function (Blueprint $table) {
            $table->dropColumn('stock_id');
            $table->integer('marca_id')->unsigned()->nullable()->after('cantidad');
            $table->string('lote',200)->after('marca_id');
            $table->date('fecha_caducidad')->nullable()->after('lote');
            $table->string('codigo_barras',100)->nullable()->after('fecha_caducidad');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('movimientos_insumos_borrador', function (Blueprint $table) {
            $table->string('stock_id')->after('movimiento_id');
            $table->dropColumn('marca_id');
            $table->dropColumn('lote');
            $table->dropColumn('fecha_caducidad');
            $table->dropColumn('codigo_barras');
        });
    }
}
