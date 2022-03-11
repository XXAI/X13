<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTableUnidadMedicaTurnos extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('unidad_medica_turnos', function (Blueprint $table) {
            $table->id();
            $table->bigInteger('unidad_medica_id')->unsigned();
            $table->string('nombre');
            $table->text('descripcion')->nullable();
            $table->bigInteger('captura_usuario_id')->unsigned()->nulable();
            $table->bigInteger('modifica_usuario_id')->unsigned()->nulable();
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
        Schema::dropIfExists('unidad_medica_turnos');
    }
}
