<?php

namespace App\Models;

use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\SoftDeletes;

class PedidoListaInsumos extends BaseModel{
    
    use SoftDeletes;
    protected $generarID = false;
    protected $guardarIDServidor = false;
    protected $guardarIDUsuario = false;
    protected $table = 'pedidos_lista_insumos';  
    protected $fillable = ['pedido_id','insumo_medico_id','tipo_insumo','cantidad','precio_unitario','monto'];
}
