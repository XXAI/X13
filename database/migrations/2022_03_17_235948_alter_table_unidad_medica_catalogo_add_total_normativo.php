<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AlterTableUnidadMedicaCatalogoAddTotalNormativo extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('unidad_medica_catalogo', function (Blueprint $table) {
            $table->integer('total_articulos_normativos')->after('total_articulos')->default(0);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('unidad_medica_catalogo', function (Blueprint $table) {
            $table->dropColumn('total_articulos_normativos');
        });
    }
}
