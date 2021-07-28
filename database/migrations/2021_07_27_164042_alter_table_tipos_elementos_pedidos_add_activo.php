<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AlterTableTiposElementosPedidosAddActivo extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('tipos_elementos_pedidos', function (Blueprint $table) {
            $table->boolean('activo')->after('filtro_detalles');
            $table->string('llave_tabla_detalles')->nullable()->change();
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
            $table->dropColumn('activo');
            $table->string('llave_tabla_detalles')->change();
        });
    }
}
