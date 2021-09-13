<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AlterTableBienesServiciosAddTieneFecha extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('bienes_servicios', function (Blueprint $table) {
            $table->boolean('tiene_fecha_caducidad')->after('descontinuado')->nullable();
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
            $table->dropColumn('tiene_fecha_caducidad');
        });
    }
}
