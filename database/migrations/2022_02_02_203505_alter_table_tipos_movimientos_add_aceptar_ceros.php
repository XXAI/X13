<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AlterTableTiposMovimientosAddAceptarCeros extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('catalogo_tipos_movimiento', function (Blueprint $table) {
            $table->boolean('acepta_ceros')->default(false)->after('captura_independiente');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('catalogo_tipos_movimiento', function (Blueprint $table) {
            $table->dropColumn('acepta_ceros');
        });
    }
}
