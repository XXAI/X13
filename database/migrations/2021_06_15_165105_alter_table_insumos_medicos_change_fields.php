<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AlterTableInsumosMedicosChangeFields extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('insumos_medicos', function (Blueprint $table) {
            $table->dropColumn('clave');
            $table->dropColumn('nombre_generico');
            $table->dropColumn('descripcion');
            $table->dropColumn('fecha_descontinuado');
            $table->bigInteger('bienes_servicios_id')->unsigned()->nullable()->after('id');
            $table->decimal('cantidad_x_envase',15,2)->nullable()->after('es_unidosis');
            $table->integer('unidad_medida_id')->unsigned()->nullable()->after('cantidad_x_envase');
            $table->boolean('es_controlado')->after('tiene_fecha_caducidad')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('insumos_medicos', function (Blueprint $table) {
            $table->string('clave',25)->nullable()->after('id');
            $table->string('nombre_generico')->nullable()->after('clave');
            $table->text('descripcion')->nullable()->after('nombre_generico');
            $table->date('fecha_descontinuado')->nullable()->after('tiene_fecha_caducidad');
            $table->dropColumn('cantidad_x_envase');
            $table->dropColumn('unidad_medida_id');
            $table->dropColumn('es_controlado');
        });
    }
}
