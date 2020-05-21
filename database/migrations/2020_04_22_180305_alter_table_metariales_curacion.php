<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AlterTableMetarialesCuracion extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('materiales_curacion', function (Blueprint $table) {
            $table->integer('unidad_medida_id')->unsigned()->nullable()->after('cantidad_x_envase');
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
        Schema::table('materiales_curacion', function (Blueprint $table) {
            $table->dropForeign(['unidad_medida_id']);
            $table->dropColumn('unidad_medida_id');
        });
    }
}
