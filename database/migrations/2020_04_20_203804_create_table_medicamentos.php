<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTableMedicamentos extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('medicamentos', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->bigInteger('insumo_medico_id')->unsigned();
            $table->boolean('es_controlado')->default(false);
            $table->string('concentracion',150)->nullable();
            $table->string('contenido')->nullable();
            $table->decimal('cantidad_x_envase',15,2)->nullable();
            $table->text('indicaciones')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('insumo_medico_id')->references('id')->on('insumos_medicos');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('medicamentos');
    }
}
