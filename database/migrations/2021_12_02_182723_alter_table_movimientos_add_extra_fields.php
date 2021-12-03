<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AlterTableMovimientosAddExtraFields extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('movimientos', function (Blueprint $table) {
            $table->bigInteger('tipo_movimiento_id')->unsigned()->nullable()->after('direccion_movimiento');
            $table->string('pedido_folio')->nullable()->after('fecha_movimiento');
            $table->string('referencia_folio')->nullable()->after('total_monto');
            $table->date('referencia_fecha')->nullable()->after('referencia_folio');
            $table->dropColumn('folio');
            $table->dropColumn('consecutivo');
            $table->dropColumn('user_id');
            $table->boolean('cancelado')->nullable()->default(null)->change();

            $table->bigInteger('creado_por_usuario_id')->unsigned()->nullable()->after('motivo_cancelacion');
            $table->bigInteger('modificado_por_usuario_id')->unsigned()->nullable()->after('creado_por_usuario_id');
            $table->bigInteger('concluido_por_usuario_id')->unsigned()->nullable()->after('modificado_por_usuario_id');
            $table->bigInteger('cancelado_por_usuario_id')->unsigned()->nullable()->after('concluido_por_usuario_id');
            $table->bigInteger('eliminado_por_usuario_id')->unsigned()->nullable()->after('cancelado_por_usuario_id');
        });

        Schema::table('movimientos', function (Blueprint $table) {
            $table->string('folio')->nullable()->after('almacen_id');
            $table->integer('consecutivo')->nullable()->after('folio');
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
            $table->string('user_id')->nullable();

            $table->dropColumn('tipo_movimiento_id');
            $table->dropColumn('pedido_folio');
            $table->dropColumn('referencia_folio');
            $table->dropColumn('referencia_fecha');

            $table->dropColumn('creado_por_usuario_id');
            $table->dropColumn('modificado_por_usuario_id');
            $table->dropColumn('concluido_por_usuario_id');
            $table->dropColumn('cancelado_por_usuario_id');
            $table->dropColumn('eliminado_por_usuario_id');
        });
    }
}
