<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ComisionEmpleado extends Model
{
    use SoftDeletes;
    protected $fillable = ['empleado_id','tipo_comision','recurrente','total_acumulado_meses','clues','cr','comision_detalle_id','estatus'];
    protected $table = 'comision_empleado';

    public function detalle(){
        return $this->hasOne('App\Models\ComisionDetalle','id','comision_detalle_id');
    }

    public function historicoDetalle(){
        return $this->hasMany('App\Models\ComisionDetalle','comision_empleado_id','id');
    }

    public function empleado(){
        return $this->hasOne('App\Models\Empleado','id','empleado_id');
    }

    public function clues(){
        return $this->hasOne('App\Models\Clues', 'clues', "clues");
    }

    public function cr(){
        return $this->hasOne('App\Models\Cr', 'cr', "cr");
    }

    public function sindicato(){
        return $this->belongsto('App\Models\Sindicato');
    }
}
