<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AlterTableUnidadMedicaCatalogoArticulosChangeIndispensableField extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('unidad_medica_catalogo_articulos', function (Blueprint $table) {
            $table->renameColumn('es_indispensable','es_normativo');
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
            $table->renameColumn('es_normativo','es_indispensable');
        });
    }
}
