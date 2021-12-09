<?php

namespace App\Models;

use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Stock extends Model{
    
    use SoftDeletes;
    protected $table = 'stocks';  
    protected $fillable = ['id','unidad_medica_id','almacen_id','bienes_servicios_id','programa_id','marca_id','lote','fecha_caducidad','codigo_barras','existencia','existencia_unidosis','user_id'];

    public function unidadMedica(){
        return $this->belongsTo('App\Models\UnidadMedica','unidad_medica_id');
    }

    public function almacen(){
        return $this->belongsTo('App\Models\Almacen','almacen_id');
    }

    public function programa(){
        return $this->belongsTo('App\Models\Programa','programa_id');
    }

    public function articulo(){
        return $this->belongsTo('App\Models\BienServicio','bienes_servicios_id');
    }

    public function cartaCanje(){
        return $this->hasOne('App\Models\CartaCanje','stock_id');
    }
}
