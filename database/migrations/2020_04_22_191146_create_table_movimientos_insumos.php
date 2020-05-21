<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTableMovimientosInsumos extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('movimientos_insumos', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('servidor_id',4);
            $table->bigInteger('incremento');
            $table->string('movimiento_id');
            $table->string('stock_id');
            $table->bigInteger('insumo_medico_id')->unsigned();
            $table->string('direccion_movimiento',5)->comment('ENT: Entrada, SAL: Salida, AJS: Ajuste Mas/Menos');
            $table->string('modo_movimiento',5)->comment('NRM: Normal, UNI: Unidosis, MAS: Ajuste Mas, MNS: Ajuste Menos');
            $table->bigInteger('cantidad');
            $table->string('user_id');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('movimientos_insumos');
    }
}
