<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AlterTableMovimientosModificacionesAddNivelModificacion extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('movimientos_modificaciones', function (Blueprint $table) {
            $table->integer('nivel_modificacion')->after('estatus')->nullable()->default(1);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('movimientos_modificaciones', function (Blueprint $table) {
            $table->dropColumn('nivel_modificacion');
        });
    }
}
