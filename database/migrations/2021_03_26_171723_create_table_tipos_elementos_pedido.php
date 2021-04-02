<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTableTiposElementosPedido extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('tipos_elementos_pedidos', function (Blueprint $table) {
            $table->id();
            $table->string('clave',4);
            $table->string('descripcion');
            $table->string('llave_tabla_detalles')->comments('Llave para el tipo de pedido: medicamentos, material_curacion.');
            $table->string('filtro_detalles')->comments('Filtro a aplicar en la table: por ejemplo solo medicamentos controlados.(agregar en un json)');
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
        Schema::dropIfExists('tipos_elementos_pedidos');
    }
}
