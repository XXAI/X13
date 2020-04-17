<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class EmpleadoBaja extends Model
{
    use SoftDeletes;
    protected $fillable = ['empleado_id','baja_id','fecha_baja','observaciones'];
    protected $table = 'empleado_baja';

    public function tipoBaja(){
        return $this->hasOne('App\Models\TipoBaja','id','baja_id');
    }
    public function empleado(){
        return $this->hasOne('App\Models\Empleado','id','empleado_id');
    }
}
