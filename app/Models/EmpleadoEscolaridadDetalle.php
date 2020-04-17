<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class EmpleadoEscolaridadDetalle extends Model
{
    use SoftDeletes;
    protected $fillable = ["empleado_id", "tipo_estudio", "nivel_academico_id", "profesion_id", "titulado", "cedula", "descripcion"];
    protected $table = 'empleado_escolaridad_detalles';

    public function nivelAcademico(){
        return $this->hasOne('App\Models\NivelAcademico','id','nivel_academico_id');
    }

    public function profesion(){
        return $this->hasOne('App\Models\Profesion','id','profesion_id');
    }

    public function empleado(){
        return $this->hasOne('App\Models\Empleado','id','empleado_id');
    }
}
