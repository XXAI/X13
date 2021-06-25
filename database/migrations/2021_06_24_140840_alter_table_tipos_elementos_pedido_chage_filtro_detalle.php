<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AlterTableTiposElementosPedidoChageFiltroDetalle extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('tipos_elementos_pedidos', function (Blueprint $table) {
            $table->text('filtro_detalles')->change();
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
            $table->string('filtro_detalles')->comments('Filtro a aplicar en la table: por ejemplo solo medicamentos controlados.(agregar en un json)')->change();
        });
    }
}
