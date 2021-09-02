<?php

namespace App\Models;

use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Model;

class MovmientoArticuloBorrador extends Model{
    
    protected $table = 'movimientos_articulos_borrador';  
    protected $fillable = ['movimiento_id','bien_servicio_id','direccion_movimiento','modo_movimiento','cantidad','marca_id','lote','fecha_caducidad','codigo_barras','user_id'];

    public function articulo(){
        return $this->belongsTo('App\Models\BienServicio','bien_servicio_id');
    }
}