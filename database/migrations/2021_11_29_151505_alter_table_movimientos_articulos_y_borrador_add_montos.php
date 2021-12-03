<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AlterTableMovimientosArticulosYBorradorAddMontos extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('movimientos_articulos', function (Blueprint $table) {
            $table->decimal('precio_unitario',14,4)->after('cantidad')->nullable();
            $table->decimal('iva',5,2)->after('precio_unitario')->nullable();
            $table->decimal('total_monto',14,4)->after('iva')->nullable();
        });

        DB::statement("ALTER TABLE movimientos_articulos_borrador CHANGE COLUMN cantidad cantidad BIGINT(20) AFTER codigo_barras");

        Schema::table('movimientos_articulos_borrador', function (Blueprint $table) {
            $table->decimal('precio_unitario',14,4)->after('cantidad')->nullable();
            $table->decimal('iva',5,2)->after('precio_unitario')->nullable();
            $table->decimal('total_monto',14,4)->after('iva')->nullable();
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
            $table->dropColumn('precio_unitario');
            $table->dropColumn('iva');
            $table->dropColumn('total_monto');
        });

        Schema::table('movimientos_articulos_borrador', function (Blueprint $table) {
            $table->dropColumn('precio_unitario');
            $table->dropColumn('iva');
            $table->dropColumn('total_monto');
        });
    }
}
