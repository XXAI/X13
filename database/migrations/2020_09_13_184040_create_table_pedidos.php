<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTablePedidos extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('pedidos', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('folio')->nullable();
            $table->string('descripcion');
            $table->smallInteger('mes');
            $table->smallInteger('anio');
            $table->text('observaciones')->nullable();
            $table->integer('total_claves')->nullable();
            $table->integer('total_insumos')->nullable();
            $table->decimal('total_monto',10,2)->nullable();
            $table->string('tipo_pedido',3)->comment('ORD = Ordinarios; EXT = Extraordinarios');
            $table->string('estatus',3)->comment('BOR = Borrador; CON = Concluido, VAL = Validado, PUB = Publicado, CAN = Cancelado, EXP = Expirado');
            $table->bigInteger('unidad_medica_id');
            $table->date('fecha_concluido')->nullable();
            $table->date('fecha_validado')->nullable();
            $table->date('fecha_publicado')->nullable();
            $table->date('fecha_cancelado')->nullable();
            $table->string('generado_por')->nullable();
            $table->string('concluido_por')->nullable();
            $table->string('validado_por')->nullable();
            $table->string('publicado_por')->nullable();
            $table->string('cancelado_por')->nullable();
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
        Schema::dropIfExists('pedidos');
    }
}
