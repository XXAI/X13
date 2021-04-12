<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateCogCapitulo extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('cog_capitulos', function (Blueprint $table) {
            $table->id();
            $table->integer('clave')->unsigned()->nullable();
            $table->integer('anio')->unsigned()->nullable();
            $table->string('descripcion',255);
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
        Schema::dropIfExists('cog_capitulos');
    }
}
