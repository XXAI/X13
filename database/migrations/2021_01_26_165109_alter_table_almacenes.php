<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AlterTableAlmacenes extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('almacenes', function (Blueprint $table) {
            $table->dropForeign(['servidor_id']);

            $table->bigIncrements('id')->change();
            $table->dropColumn('servidor_id');
            $table->dropColumn('incremento');
            $table->dropColumn('clues');
            $table->bigInteger('unidad_medica_id')->unsigned()->after('id');
            $table->string('responsable')->after('unidosis')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('almacenes', function (Blueprint $table) {
            $table->string('id')->change();
            $table->string('servidor_id',4)->after('id');
            $table->bigInteger('incremento')->after('servidor_id');
            $table->string('clues',45)->nullable()->after('incremento');
            $table->dropColumn('unidad_medica_id');
            $table->dropColumn('responsable');

            $table->foreign('servidor_id')->references('id')->on('servidores');
        });
    }
}
