<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AlterTableConfigCapturaAbastoSurtimientoAddEjercicio extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('config_captura_abasto_surtimiento', function (Blueprint $table) {
            $table->string('ejercicio',4)->after('fecha_fin')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('config_captura_abasto_surtimiento', function (Blueprint $table) {
            $table->dropColumn('ejercicio');
        });
    }
}
