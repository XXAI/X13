<?php

namespace App\Models;

use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Model;

class MovimientoInsumoBorrador extends Model{
    
    protected $table = 'movimientos_insumos_borrador';  
    protected $fillable = ['movimiento_id','insumo_medico_id','direccion_movimiento','modo_movimiento','cantidad','marca_id','lote','fecha_caducidad','codigo_barras','user_id'];

    public function insumoMedico(){
        return $this->belongsTo('App\Models\InsumoMedico','insumo_medico_id');
    }
}