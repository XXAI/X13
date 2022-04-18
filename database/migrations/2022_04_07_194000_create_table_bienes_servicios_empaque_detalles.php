<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTableBienesServiciosEmpaqueDetalles extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('bienes_servicios_empaque_detalles', function (Blueprint $table) {
            $table->id();
            $table->bigInteger('bien_servicio_id')->unsigned();
            $table->string('descripcion');
            $table->bigInteger('empaque_id')->unsigned()->nullable();
            $table->bigInteger('unidad_medida_id')->unsigned()->nullable();
            $table->integer('piezas_x_empaque')->nullable();
            $table->boolean('en_especificaciones')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('bien_servicio_id')->references('id')->on('bienes_servicios');
            $table->foreign('empaque_id')->references('id')->on('catalogo_empaques');
            $table->foreign('unidad_medida_id')->references('id')->on('catalogo_unidades_medida');
        });

        Schema::table('stocks', function (Blueprint $table) {
            $table->bigInteger('empaque_detalle_id')->unsigned()->after('bien_servicio_id')->nullable();

            $table->foreign('empaque_detalle_id')->references('id')->on('bienes_servicios_empaque_detalles');
        });

        Schema::table('movimientos_articulos_borrador', function (Blueprint $table) {
            $table->bigInteger('empaque_detalle_id')->unsigned()->after('bien_servicio_id')->nullable();

            $table->foreign('empaque_detalle_id')->references('id')->on('bienes_servicios_empaque_detalles');
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
            $table->dropForeign(['empaque_detalle_id']);
            $table->dropColumn('empaque_detalle_id');
        });

        Schema::table('movimientos_articulos_borrador', function (Blueprint $table) {
            $table->dropForeign(['empaque_detalle_id']);
            $table->dropColumn('empaque_detalle_id');
        });

        Schema::dropIfExists('bienes_servicios_empaque_detalles');
    }
}
