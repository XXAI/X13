<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTableUnidadMedicaCatalogoArticulos extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('unidad_medica_catalogo_articulos', function (Blueprint $table) {
            $table->id();
            $table->bigInteger('unidad_medica_id')->unsigned();
            $table->bigInteger('bien_servicio_id')->unsigned();
            $table->integer('cantidad_minima')->nullable();
            $table->integer('cantidad_maxima')->nullable();
            $table->boolean('es_indispensable')->nullable();
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
        Schema::dropIfExists('unidad_medica_catalogo_articulos');
    }
}
