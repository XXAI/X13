<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTableCatalogoSolicitudesTiposUso extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('catalogo_solicitudes_tipos_uso', function (Blueprint $table) {
            $table->id();
            $table->string('clave',10);
            $table->string('descripcion');
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::table('solicitudes', function (Blueprint $table) {
            $table->bigInteger('tipo_uso_id')->unsigned()->nullable()->after('tipo_solicitud_id');
        });

        Schema::table('movimientos', function (Blueprint $table) {
            $table->bigInteger('solicitud_tipo_uso_id')->unsigned()->nullable()->after('solicitud_id');
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
            $table->dropColumn('tipo_uso_id');
        });

        Schema::table('movimientos', function (Blueprint $table) {
            $table->dropColumn('tipo_uso_id');
        });

        Schema::dropIfExists('catalogo_solicitudes_tipos_uso');
    }
}
