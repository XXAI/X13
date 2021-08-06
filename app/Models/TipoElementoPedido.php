<?php

namespace App\Models;

use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class TipoElementoPedido extends Model{
    
    use SoftDeletes;
    protected $table = 'tipos_elementos_pedidos';
    protected $fillable = ['clave','descripcion','icon_image','origen_articulo','filtro_detalles','activo'];
}
