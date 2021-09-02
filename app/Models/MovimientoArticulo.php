<?php

namespace App\Models;

use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class MovimientoArticulo extends Model{
    
    use SoftDeletes;
    protected $table = 'movimientos_articulos';  
    protected $fillable = ['id','movimiento_id','stock_id','bien_servicio_id','direccion_movimiento','modo_movimiento','cantidad','cantidad_anterior','user_id'];

    public function articulo(){
        return $this->belongsTo('App\Models\BienServicio','bien_servicio_id');
    }

    public function stock(){
        return $this->belongsTo('App\Models\Stock','stock_id');
    }
}