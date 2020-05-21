<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTableInsumosMedicos extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('insumos_medicos', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('clave',25);
            $table->string('tipo_insumo',3);
            $table->string('descripcion');
            $table->bigInteger('nombre_generico_id')->unsigned()->nullable();
            $table->boolean('es_unidosis')->default(false);
            $table->boolean('tiene_fecha_caducidad')->default(false);
            $table->boolean('descontinuado')->default(false);
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('nombre_generico_id')->references('id')->on('nombres_genericos');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('insumos_medicos');
    }
}
