<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AlterTableMovimientos extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('movimientos', function (Blueprint $table) {
            $table->bigIncrements('id')->change();
            $table->dropColumn('actor');
            $table->string('entrega')->after('descripcion')->nullable();
            $table->string('recibe')->after('entrega')->nullable();
            $table->dropColumn('servidor_id');
            $table->dropColumn('incremento');
        });

        Schema::table('movimientos_insumos', function (Blueprint $table) {
            $table->bigIncrements('id')->change();
            $table->bigInteger('movimiento_id')->unsigned()->change();
            $table->dropColumn('servidor_id');
            $table->dropColumn('incremento');
        });

        Schema::table('movimientos_insumos_borrador', function (Blueprint $table) {
            $table->bigIncrements('id')->change();
            $table->bigInteger('movimiento_id')->unsigned()->change();
            $table->dropColumn('servidor_id');
            $table->dropColumn('incremento');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('movimientos', function (Blueprint $table) {
            $table->string('id')->primary()->change();
            $table->string('actor')->after('descripcion')->nullable();
            $table->dropColumn('entrega');
            $table->dropColumn('recibe');
            $table->string('servidor_id',4)->after('id');
            $table->bigInteger('incremento')->after('servidor_id');
        });

        Schema::table('movimientos_insumos', function (Blueprint $table) {
            $table->string('id')->primary()->change();
            $table->string('movimiento_id')->change();
            $table->string('servidor_id',4)->after('id');
            $table->bigInteger('incremento')->after('servidor_id');
        });

        Schema::table('movimientos_insumos_borrador', function (Blueprint $table) {
            $table->string('id')->primary()->change();
            $table->string('movimiento_id')->change();
            $table->string('servidor_id',4)->after('id');
            $table->bigInteger('incremento')->after('servidor_id');
        });
    }
}
