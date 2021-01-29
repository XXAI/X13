<?php

namespace App\Models;

use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class MovimientoInsumo extends Model{
    
    use SoftDeletes;
    protected $table = 'movimientos_insumos';  
    protected $fillable = ['id','movimiento_id','stock_id','insumo_medico_id','direccion_movimiento','modo_movimiento','cantidad','user_id'];

    public function insumoMedico(){
        return $this->belongsTo('App\Models\InsumoMedico','insumo_medico_id');
    }
}