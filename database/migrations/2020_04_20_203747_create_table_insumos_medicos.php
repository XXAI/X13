<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTableInsumosMedicos extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('insumos_medicos', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('clave',25);
            $table->string('tipo_insumo',3)->comment('MED = Medicamento; MTC = Material de Curación');
            $table->string('nombre_generico')->nullable();
            $table->text('descripcion');
            $table->boolean('es_unidosis')->default(false);
            $table->boolean('tiene_fecha_caducidad')->default(false);
            $table->date('fecha_descontinuado')->nullable();
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
        Schema::dropIfExists('insumos_medicos');
    }
}
