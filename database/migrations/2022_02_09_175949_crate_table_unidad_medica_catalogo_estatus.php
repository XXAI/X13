<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CrateTableUnidadMedicaCatalogoEstatus extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('unidad_medica_catalogo', function (Blueprint $table) {
            $table->id();
            $table->bigInteger('unidad_medica_id')->unsigned();
            $table->bigInteger('tipo_bien_servicio_id')->unsigned();
            $table->integer('total_articulos')->nullable();
            $table->boolean('puede_editar')->nullable();
            $table->bigInteger('ultima_modificacion_por')->unsigned()->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::table('unidad_medica_catalogo_articulos', function (Blueprint $table) {
            $table->bigInteger('unidad_medica_catalogo_id')->unsigned()->nullable()->after('id');
            $table->bigInteger('modificado_por')->unsigned()->nullable()->after('es_indispensable');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('unidad_medica_catalogo_articulos', function (Blueprint $table) {
            $table->dropColumn('unidad_medica_catalogo_id');
            $table->dropColumn('modificado_por');
        });

        Schema::dropIfExists('unidad_medica_catalogo_estatus');
    }
}
