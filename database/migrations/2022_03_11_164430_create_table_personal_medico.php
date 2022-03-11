<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTablePersonalMedico extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('personal_medico', function (Blueprint $table) {
            $table->id();
            $table->bigInteger('unidad_medica_id')->unsigned();
            $table->string('nombre_completo');
            $table->string('curp',18)->nullable();
            $table->string('rfc',15)->nullable();
            $table->string('especialidad')->nullable();
            $table->bigInteger('sirh_id')->unsined()->nullable();
            $table->timestamp('actualizado_sirh')->nullable();
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
        Schema::dropIfExists('personal_medico');
    }
}
