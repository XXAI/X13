<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AlterTablePedidosListaInsumosUnidades extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('pedidos_lista_insumos_unidades', function (Blueprint $table) {
            $table->integer('cantidad_original')->nullable()->after('unidad_medica_id');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('pedidos_lista_insumos_unidades', function (Blueprint $table) {
            $table->dropColumn('cantidad_original');
        });
    }
}
