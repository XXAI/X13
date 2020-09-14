<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTablePedidosListaInsumos extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('pedidos_lista_insumos', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->bigInteger('pedido_id');
            $table->bigInteger('insumo_medico_id');
            $table->string('tipo_insumo',3)->comment('MED = Medicamento; MTC = Material de Curación');
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
        Schema::dropIfExists('pedidos_lista_insumos');
    }
}
