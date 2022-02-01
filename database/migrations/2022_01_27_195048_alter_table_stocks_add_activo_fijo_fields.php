<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AlterTableStocksAddActivoFijoFields extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('stocks', function (Blueprint $table) {
            $table->string('modelo')->nullable()->after('marca_id');
            $table->string('no_serie')->nullable()->after('modelo');
            $table->renameColumn('bienes_servicios_id','bien_servicio_id')->change();
        });

        Schema::table('movimientos_articulos_borrador', function (Blueprint $table) {
            $table->string('modelo')->nullable()->after('marca_id');
            $table->string('no_serie')->nullable()->after('modelo');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('stocks', function (Blueprint $table) {
            $table->dropColumn('modelo');
            $table->dropColumn('no_serie');
            $table->renameColumn('bien_servicio_id','bienes_servicios_id')->change();
        });

        Schema::table('movimientos_articulos_borrador', function (Blueprint $table) {
            $table->dropColumn('modelo');
            $table->dropColumn('no_serie');
        });
    }
}
