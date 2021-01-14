<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AlterTablePedidosListaInsumos extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('pedidos_lista_insumos', function (Blueprint $table) {
            $table->integer('cantidad_original')->nullable()->after('tipo_insumo');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('pedidos_lista_insumos', function (Blueprint $table) {
            $table->dropColumn('cantidad_original');
        });
    }
}
