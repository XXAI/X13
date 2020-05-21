<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTableStocks extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('stocks', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('servidor_id',4);
            $table->bigInteger('incremento');
            $table->string('almacen_id');
            $table->bigInteger('insumo_medico_id')->unsigned();
            $table->integer('programa_id')->unsigned()->nullable();
            $table->integer('marca_id')->unsigned()->nullable();
            $table->string('lote',200);
            $table->date('fecha_caducidad')->nullable();
            $table->string('codigo_barras',100)->nullable();
            $table->bigInteger('existencia');
            $table->bigInteger('existencia_unidosis')->nullable();
            $table->string('user_id');
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
        Schema::dropIfExists('stocks');
    }
}
