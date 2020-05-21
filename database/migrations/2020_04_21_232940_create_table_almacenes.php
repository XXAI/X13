<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTableAlmacenes extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('almacenes', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('servidor_id',4);
            $table->bigInteger('incremento');
            $table->string('clues',45)->nullable();
            $table->string('nombre');
            $table->integer('tipo_almacen_id')->unsigned();
            $table->boolean('externo')->default(false);
            $table->boolean('unidosis')->default(false);
            $table->string('user_id');
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('tipo_almacen_id')->references('id')->on('catalogo_tipos_almacen');
            $table->foreign('servidor_id')->references('id')->on('servidores');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('almacenes');
    }
}
