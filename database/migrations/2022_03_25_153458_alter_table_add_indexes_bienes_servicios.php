<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AlterTableAddIndexesBienesServicios extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('medicamentos', function (Blueprint $table) {
            $table->dropForeign(['insumo_medico_id']);
            $table->dropForeign(['presentacion_id']);
            $table->dropForeign(['forma_farmaceutica_id']);
            $table->dropForeign(['via_administracion_id']);
        });

        Schema::table('materiales_curacion', function (Blueprint $table) {
            $table->dropForeign(['insumo_medico_id']);
            $table->dropForeign(['unidad_medida_id']);
        });

        Schema::table('catalogo_presentaciones', function (Blueprint $table) {
            $table->bigIncrements('id')->unsigned()->change();
        });

        Schema::table('catalogo_unidades_medida', function (Blueprint $table) {
            $table->bigIncrements('id')->unsigned()->change();
        });
        
        Schema::table('bienes_servicios', function (Blueprint $table) {
            $table->index('clave_cubs');
            $table->index('clave_local');
            $table->index('articulo');
            $table->index('especificaciones');

            $table->foreign('familia_id')->references('id')->on('familias');
            $table->foreign('tipo_bien_servicio_id')->references('id')->on('catalogo_tipos_bien_servicio');
            $table->foreign('presentacion_id')->references('id')->on('catalogo_presentaciones');
            $table->foreign('empaque_id')->references('id')->on('catalogo_empaques');
            $table->foreign('unidad_medida_id')->references('id')->on('catalogo_unidades_medida');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('bienes_servicios', function (Blueprint $table) {
            $table->dropIndex(['clave_cubs']);
            $table->dropIndex(['clave_local']);
            $table->dropIndex(['articulo']);
            $table->dropIndex(['especificaciones']);

            $table->dropForeign(['familia_id']);
            $table->dropForeign(['tipo_bien_servicio_id']);
            $table->dropForeign(['presentacion_id']);
            $table->dropForeign(['empaque_id']);
            $table->dropForeign(['unidad_medida_id']);
        });
    }
}
