<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ComisionDetalle extends Model
{
    use SoftDeletes;
    protected $fillable = ['comision_empleado_id','fecha_inicio','fecha_fin','no_oficio'];
    protected $table = 'comision_detalle';

    public function comision(){
        return $this->hasOne('App\Models\ComisionEmpleado','id','comision_empleado_id');
    }
}
