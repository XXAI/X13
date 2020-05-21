<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTableMaterialesCuracion extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('materiales_curacion', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->bigInteger('insumo_medico_id')->unsigned();
            $table->decimal('cantidad_x_envase',15,2)->nullable();
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
        Schema::dropIfExists('materiales_curacion');
    }
}
