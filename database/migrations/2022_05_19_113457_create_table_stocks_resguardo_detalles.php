<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTableStocksResguardoDetalles extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('stocks_resguardo_detalles', function (Blueprint $table) {
            $table->id();
            $table->bigInteger('stock_id')->unsigned();
            $table->string('descripcion');
            $table->boolean('son_piezas')->nullable();
            $table->bigInteger('cantidad_resguardada');
            $table->bigInteger('cantidad_restante');
            $table->text('condiciones_salida')->nullable();
            $table->bigInteger('usuario_resguarda_id')->unsigned();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('stock_id')->references('id')->on('stocks');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('stocks_resguardo_detalles');
    }
}
