<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AlterTablePersonasRenameToPacientes extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('personas', function (Blueprint $table) {
            $table->string('expediente_clinico',100)->nullable()->after('curp');
            $table->dropColumn('rfc');
        });
        Schema::table('movimientos', function (Blueprint $table) {
            $table->renameColumn('persona_id','paciente_id')->change();
        });
        Schema::table('solicitudes', function (Blueprint $table) {
            $table->renameColumn('persona_id','paciente_id')->change();
        });
        Schema::rename('personas', 'pacientes');
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('movimientos', function (Blueprint $table) {
            $table->renameColumn('paciente_id','persona_id')->change();
        });
        Schema::table('solicitudes', function (Blueprint $table) {
            $table->renameColumn('paciente_id','persona_id')->change();
        });
        Schema::table('pacientes', function (Blueprint $table) {
            $table->dropColumn('expediente_clinico');
            $table->string('rfc',13)->nullable()->after('curp');
        });
        Schema::rename('pacientes', 'personas');
    }
}
