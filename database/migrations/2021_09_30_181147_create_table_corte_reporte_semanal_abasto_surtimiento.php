<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTableCorteReporteSemanalAbastoSurtimiento extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('corte_reporte_abasto_surtimiento', function (Blueprint $table) {
            $table->id();
            $table->bigInteger('unidad_medica_id')->unsigned();
            $table->date('fecha_inicio');
            $table->date('fecha_fin');
            
            $table->integer('claves_medicamentos_catalogo');
            $table->integer('claves_medicamentos_existentes');
            $table->decimal('claves_medicamentos_porcentaje',8,2);
            $table->integer('claves_material_curacion_catalogo');
            $table->integer('claves_material_curacion_existentes');
            $table->decimal('claves_material_curacion_porcentaje',8,2);
            $table->integer('total_claves_catalogo');
            $table->integer('total_claves_existentes');
            $table->decimal('total_claves_porcentaje',8,2);

            $table->integer('recetas_recibidas');
            $table->integer('recetas_surtidas');
            $table->decimal('recetas_porcentaje',8,2);

            $table->integer('colectivos_recibidos');
            $table->integer('colectivos_surtidos');
            $table->decimal('colectivos_porcentaje',8,2);

            $table->integer('caducidad_3_meses_total_claves');
            $table->integer('caducidad_3_meses_total_piezas');

            $table->integer('caducidad_4_6_meses_total_claves');
            $table->integer('caducidad_4_6_meses_total_piezas');

            $table->bigInteger('usuario_captura_id')->unsigned();
            $table->boolean('validado')->nullable();
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
        Schema::dropIfExists('corte_reporte_abasto_surtimiento');
    }
}
