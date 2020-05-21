<?php

namespace App\Models;

use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\SoftDeletes;

class Movimiento extends BaseModel{
    
    use SoftDeletes;
    protected $generarID = true;
    protected $guardarIDServidor = true;
    protected $guardarIDUsuario = true;
    protected $keyType = 'string';
    protected $table = 'movimientos';  
    protected $fillable = ['almacen_id','direccion_movimiento','estatus','fecha_movimiento','programa_id','folio','descripcion','actor','observaciones','cancelado','fecha_cancelacion','motivo_cancelacion'];
}