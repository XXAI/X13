<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AlterPedidosAvanceRecepcion extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('pedidos_avance_recepcion', function (Blueprint $table) {
            $table->decimal('porcentaje_claves',5,2)->default('0')->change();
            $table->decimal('porcentaje_insumos',5,2)->default('0')->change();
            $table->decimal('porcentaje_total',5,2)->default('0')->change();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('pedidos_avance_recepcion', function (Blueprint $table) {
            $table->decimal('porcentaje_claves',3,2)->default('0')->change();
            $table->decimal('porcentaje_insumos',3,2)->default('0')->change();
            $table->decimal('porcentaje_total',3,2)->default('0')->change();
        });
    }
}
