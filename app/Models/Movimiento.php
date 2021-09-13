<?php

namespace App\Models;

use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Movimiento extends Model{
    
    use SoftDeletes;
    protected $table = 'movimientos';  
    protected $fillable = ['almacen_id','direccion_movimiento','estatus','fecha_movimiento','programa_id','folio','descripcion','entrega','recibe','observaciones','cancelado','fecha_cancelacion','motivo_cancelacion','user_id','proveedor_id','clues'];

    public function almacen(){
        return $this->belongsTo('App\Models\Almacen','almacen_id');
    }

    public function programa(){
        return $this->belongsTo('App\Models\Programa','programa_id');
    }

    public function proveedor(){
        return $this->belongsTo('App\Models\Proveedor','proveedor_id');
    }

    public function listaArticulos(){
        return $this->hasMany('App\Models\MovimientoArticulo','movimiento_id');
    }

    public function listaArticulosBorrador(){
        return $this->hasMany('App\Models\MovimientoArticuloBorrador','movimiento_id');
    }

    public function pedido(){
        return $this->belongsToMany('App\Models\Pedido', 'rel_movimientos_pedidos', 'movimiento_id', 'pedido_id');
    }
}