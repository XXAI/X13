<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AlterTableMedicamentosMaterialesRemoveFields extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('medicamentos', function (Blueprint $table) {
            $table->dropForeign(['unidad_medida_id']);
            
            $table->dropColumn('es_controlado');
            $table->dropColumn('cantidad_x_envase');
            $table->dropColumn('unidad_medida_id');
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
            $table->boolean('es_controlado')->default(false)->after('forma_farmaceutica_id');
            $table->decimal('cantidad_x_envase',15,2)->nullable()->after('contenido');
            $table->integer('unidad_medida_id')->unsigned()->nullable()->after('cantidad_x_envase');

            $table->foreign('unidad_medida_id')->references('id')->on('catalogo_unidades_medida');
        });
    }
}
