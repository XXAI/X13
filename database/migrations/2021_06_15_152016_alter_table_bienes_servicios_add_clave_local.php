<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AlterTableBienesServiciosAddClaveLocal extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('bienes_servicios', function (Blueprint $table) {
            $table->string('clave_local')->after('clave_cubs')->nullable();
            $table->boolean('descontinuado')->after('especificaciones')->nullable();
            $table->text('especificaciones')->change();
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
            $table->dropColumn('clave_local');
            $table->dropColumn('descontinuado');
            $table->string('especificaciones',1000)->change();
        });
    }
}
