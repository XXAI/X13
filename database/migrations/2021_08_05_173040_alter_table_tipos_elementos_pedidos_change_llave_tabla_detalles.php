<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AlterTableTiposElementosPedidosChangeLlaveTablaDetalles extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('tipos_elementos_pedidos', function (Blueprint $table) {
            $table->renameColumn('llave_tabla_detalles','origen_articulo')->change();
        });
        Schema::table('tipos_elementos_pedidos', function (Blueprint $table) {
            $table->integer('origen_articulo')->change();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('tipos_elementos_pedidos', function (Blueprint $table) {
            $table->string('llave_tabla_detalles')->change();
        });

        Schema::table('tipos_elementos_pedidos', function (Blueprint $table) {
            $table->renameColumn('origen_articulo','llave_tabla_detalles')->change();
        });
    }
}
