<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AlterTableBienesServiciosAddFieldsUnidosis extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('bienes_servicios', function (Blueprint $table) {
            $table->bigInteger('presentacion_id')->unsigned()->nullable()->after('especificaciones');
            $table->bigInteger('empaque_id')->unsigned()->nullable()->after('presentacion_id');
            $table->bigInteger('unidad_medida_id')->unsigned()->nullable()->after('empaque_id');
            $table->boolean('puede_surtir_unidades')->nullable()->after('tiene_fecha_caducidad');
            $table->integer('unidades_x_empaque')->nullable()->after('puede_surtir_unidades');
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
            $table->dropColumn('presentacion_id');
            $table->dropColumn('empaque_id');
            $table->dropColumn('puede_surtir_unidades');
            $table->dropColumn('unidades_x_empaque');
            $table->dropColumn('unidad_medida_id');
        });
    }
}
