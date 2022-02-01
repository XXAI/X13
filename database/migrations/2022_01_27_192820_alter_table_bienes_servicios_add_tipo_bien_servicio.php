<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AlterTableBienesServiciosAddTipoBienServicio extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('bienes_servicios', function (Blueprint $table) {
            $table->bigInteger('tipo_bien_servicio_id')->unsigned()->nullable()->after('familia_id');
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
            $table->dropColumn('tipo_bien_servicio_id');
        });
    }
}
