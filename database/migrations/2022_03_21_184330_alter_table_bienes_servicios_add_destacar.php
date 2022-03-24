<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AlterTableBienesServiciosAddDestacar extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('bienes_servicios', function (Blueprint $table) {
            $table->text('destacar')->nullable()->after('especificaciones');
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
            $table->dropColumn('destacar');
        });
    }
}
