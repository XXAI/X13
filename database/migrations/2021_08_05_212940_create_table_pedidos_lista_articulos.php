<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTablePedidosListaArticulos extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('pedidos_lista_articulos', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->bigInteger('pedido_id');
            $table->bigInteger('bien_servicio_id');
            $table->integer('cantidad_original')->nullable();
            $table->integer('cantidad');
            $table->decimal('precio_unitario',10,2)->nullable();
            $table->decimal('monto',10,2)->nullable();
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
        Schema::dropIfExists('pedidos_lista_articulos');
    }
}
