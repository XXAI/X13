<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Empleado extends Model
{
    use SoftDeletes;
    protected $fillable = ["codigo_id", "comision_sindical_id", "cr_id","curp", "figf", "fissa", "fuente_id", "horario", "nombre", "sexo", "programa_id", "rama_id", "rfc", "tipo_nomina_id", "validado",'estatus' ,'actividades','observaciones', 'tipo_trabajador_id', 'calle', 'no_exterior', 'no_interior', 'colonia', 'cp', 'nacionalidad', 'estado_nacimiento' ,'escolaridad_id', 'no_cedula', 'telefono_fijo', 'telefono_celular', 'correo_personal'];
    protected $table = 'empleados';

    public function sindicato(){
        return $this->hasOne('App\Models\Sindicato','id','comision_sindical_id');
    }

    public function codigo(){
        return $this->hasOne('App\Models\Codigo','codigo','codigo_id');
    }

    public function clues(){
        return $this->hasOne('App\Models\Clues', 'clues', "clues");
    }
    
    public function cluesAdscripcion(){
        return $this->hasOne('App\Models\Clues', 'clues', "clues_adscripcion");
    }


    public function profesion(){
        return $this->hasOne('App\Models\Profesion','id','profesion_id');
    }

    public function comision(){
        return $this->hasOne('App\Models\ComisionEmpleado','id','ultima_comision_id');
    }

    public function adscripcionActiva(){
        return $this->hasOne('App\Models\CluesEmpleado', 'empleado_id', "id")->whereNull('fecha_fin');
    }

    public function adscripcionHistorial(){
        return $this->hasMany('App\Models\CluesEmpleado', 'empleado_id', "id");
    }

    public function permutaAdscripcionActiva(){
        return $this->hasOne('App\Models\PermutaAdscripcion', 'empleado_id', "id")->where('estatus',1);
    }

    public function permutasAdscripcion(){
        return $this->hasMany('App\Models\PermutaAdscripcion', 'empleado_id', "id");
    }

    public function escolaridad(){
        return $this->hasOne('App\Models\EmpleadoEscolaridad', 'empleado_id', "id");
    }

    public function escolaridadDetalle(){
        return $this->hasMany('App\Models\EmpleadoEscolaridadDetalle', 'empleado_id', "id");
    }

    public function cr(){
        return $this->hasOne('App\Models\Cr','cr','cr_id');
    }

    public function crAdscripcion(){
        return $this->hasOne('App\Models\Cr','cr','cr_adscripcion_id');
    }

    public function ur(){
        return $this->hasOne('App\Models\UR','llave','ur');
    }

    public function baja(){
        return $this->hasMany('App\Models\EmpleadoBaja','empleado_id','id');
    }
    
    public function turno(){
        return $this->hasOne('App\Models\Turno', "id", "turno_id");
    }

    public function empleado_comision(){
        return $this->hasMany('App\Models\ComisionEmpleado')->where("estatus", "=", "A");
    }
}
