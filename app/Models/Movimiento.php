<?php

namespace App\Models;

use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Movimiento extends Model{
    
    use SoftDeletes;
    protected $table = 'movimientos';  
    protected $fillable = ['almacen_id','direccion_movimiento','estatus','fecha_movimiento','programa_id','folio','descripcion','entrega','recibe','observaciones','cancelado','fecha_cancelacion','motivo_cancelacion','user_id'];

    public function listaInsumosMedicos(){
        return $this->hasMany('App\Models\MovimientoInsumo','movimiento_id');
    }

    public function listaInsumosBorrador(){
        return $this->hasMany('App\Models\MovimientoInsumoBorrador','movimiento_id');
    }
}