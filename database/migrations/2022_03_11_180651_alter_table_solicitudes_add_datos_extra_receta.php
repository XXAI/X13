<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AlterTableSolicitudesAddDatosExtraReceta extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('solicitudes', function (Blueprint $table) {
            $table->bigInteger('turno_id')->unsigned()->nullable()->after('fecha_solicitud');
            $table->bigInteger('persona_id')->unsigned()->nullable()->after('programa_id');
            $table->bigInteger('personal_medico_id')->unsigned()->nullable()->after('persona_id');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('solicitudes', function (Blueprint $table) {
            $table->dropColumn('turno_id');
            $table->dropColumn('persona_id');
            $table->dropColumn('personal_medico_id');
        });
    }
}
