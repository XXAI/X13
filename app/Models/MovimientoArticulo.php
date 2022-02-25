<?php

namespace App\Models;

use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class MovimientoArticulo extends Model{
    
    use SoftDeletes;
    protected $table = 'movimientos_articulos';  
    protected $fillable = ['movimiento_id','stock_id','bien_servicio_id','direccion_movimiento','modo_movimiento','cantidad','cantidad_anterior','user_id','precio_unitario','iva','total_monto'];

    public function articulo(){
        return $this->belongsTo('App\Models\BienServicio','bien_servicio_id');
    }

    public function stock(){
        return $this->belongsTo('App\Models\Stock','stock_id');
    }

    public function cartaCanje(){
        return $this->hasOne('App\Models\CartaCanje','movimiento_articulo_id');
    }
}