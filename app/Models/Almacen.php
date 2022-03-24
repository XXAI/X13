<?php

namespace App\Models;

use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Almacen extends Model{
    use SoftDeletes;
    protected $table = 'almacenes';  
    protected $fillable = ['unidad_medica_id','nombre','tipo_almacen_id','externo','direccion','puede_surtir_unidades','responsable','user_id'];

    public function unidad_medica(){   
        return $this->belongsTo('App\Models\UnidadMedica','unidad_medica_id','id');
    }

    public function tipoAlmacen(){   
        return $this->belongsTo('App\Models\TipoAlmacen','tipo_almacen_id','id');
    }

    public function tiposMovimiento(){
        return $this->belongsToMany('App\Models\TipoMovimiento','rel_almacenes_tipos_movimiento','almacen_id','tipo_movimiento_id');
    }

}