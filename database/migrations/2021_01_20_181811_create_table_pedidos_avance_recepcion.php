<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTablePedidosAvanceRecepcion extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('pedidos_avance_recepcion', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->bigInteger('pedido_id');
            $table->integer('total_claves_recibidas');
            $table->integer('total_insumos_recibidos');
            $table->decimal('total_monto_recibido',10,2)->nullable();
            $table->decimal('porcentaje_claves',3,2)->nullable();
            $table->decimal('porcentaje_insumos',3,2)->nullable();
            $table->decimal('porcentaje_total',3,2)->nullable();
            $table->date('fecha_primer_entrega')->nullable();
            $table->date('fecha_ultima_entrega')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('pedidos_avance_recepcion');
    }
}
