<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AlterTablesChangeLoteNullable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('movimientos_articulos_borrador', function (Blueprint $table) {
            $table->string('lote',200)->nullable()->change();
        });

        Schema::table('stocks', function (Blueprint $table) {
            $table->string('lote',200)->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('movimientos_articulos_borrador', function (Blueprint $table) {
            $table->string('lote',200)->change();
        });

        Schema::table('stocks', function (Blueprint $table) {
            $table->string('lote',200)->change();
        });
    }
}
