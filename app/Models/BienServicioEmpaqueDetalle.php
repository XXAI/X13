<?php

namespace App\Models;

use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class BienServicioEmpaqueDetalle extends Model{
    
    use SoftDeletes;
    protected $table = 'bienes_servicios_empaque_detalles';  
    protected $fillable = ['bien_servicio_id','descripcion','empaque_id','unidad_medida_id','piezas_x_empaque','en_especificaciones'];

    public function scopeDatosDescripcion($query,$unidad_medica_id = null){
        return $query->select('bienes_servicios_empaque_detalles.*','catalogo_empaques.descripcion AS empaque','catalogo_unidades_medida.descripcion as unidad_medida')
                        ->leftjoin('catalogo_empaques','catalogo_empaques.id','bienes_servicios_empaque_detalles.empaque_id')
                        ->leftjoin('catalogo_unidades_medida','catalogo_unidades_medida.id','bienes_servicios_empaque_detalles.unidad_medida_id');
    }

    
    public function empaque(){
        return $this->belongsTo('App\Models\Empaque','empaque_id');
    }

    public function unidadMedida(){
        return $this->belongsTo('App\Models\UnidadMedida','unidad_medida_id');
    }

    public function stocks(){
        return $this->hasMany('App\Models\Stock','empaque_detalle_id');
    }
}
