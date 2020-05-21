<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AlterTableMedicamentosAddCatalogos extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('medicamentos', function (Blueprint $table) {
            $table->integer('presentacion_id')->unsigned()->nullable()->after('insumo_medico_id');
            $table->integer('forma_farmaceutica_id')->unsigned()->nullable()->after('presentacion_id');
            $table->integer('unidad_medida_id')->unsigned()->nullable()->after('cantidad_x_envase');
            $table->integer('via_administracion_id')->unsigned()->nullable()->after('unidad_medida_id');

            $table->foreign('presentacion_id')->references('id')->on('catalogo_presentaciones');
            $table->foreign('forma_farmaceutica_id')->references('id')->on('catalogo_formas_farmaceuticas');
            $table->foreign('unidad_medida_id')->references('id')->on('catalogo_unidades_medida');
            $table->foreign('via_administracion_id')->references('id')->on('catalogo_vias_administracion');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('medicamentos', function (Blueprint $table) {
            $table->dropForeign(['presentacion_id']);
            $table->dropForeign(['forma_farmaceutica_id']);
            $table->dropForeign(['unidad_medida_id']);
            $table->dropForeign(['via_administracion_id']);

            $table->dropColumn('presentacion_id');
            $table->dropColumn('forma_farmaceutica_id');
            $table->dropColumn('unidad_medida_id');
            $table->dropColumn('via_administracion_id');
        });
    }
}
