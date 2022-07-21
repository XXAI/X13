<?php

namespace App\Models;

use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Stock extends Model{
    
    use SoftDeletes;
    protected $table = 'stocks';  
    protected $fillable = ['unidad_medica_id','almacen_id','bien_servicio_id','empaque_detalle_id','programa_id','marca_id','modelo','no_serie','lote','fecha_caducidad','codigo_barras','existencia','existencia_piezas','resguardo_piezas','stock_padre_id','user_id'];

    public function stockPadre(){
        return $this->belongsTo('App\Models\Stock','stock_padre_id');
    }

    public function resguardoDetalle(){
        return $this->hasMany('App\Models\StockResguardoDetalle','stock_id');
    }

    public function resguardoDetallesActivos(){
        return $this->hasMany('App\Models\StockResguardoDetalle','stock_id')->where('cantidad_restante','>',0);
    }

    public function marca(){
        return $this->belongsTo('App\Models\Marca','marca_id');
    }

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
        return $this->belongsTo('App\Models\BienServicio','bien_servicio_id');
    }

    public function empaqueDetalle(){
        return $this->belongsTo('App\Models\BienServicioEmpaqueDetalle','empaque_detalle_id');
    }

    public function cartaCanje(){
        return $this->hasOne('App\Models\CartaCanje','stock_id');
    }

    public function usuario(){
        return $this->belongsTo('App\Models\User','user_id');
    }
}
