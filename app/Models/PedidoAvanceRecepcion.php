<?php

namespace App\Models;

use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PedidoAvanceRecepcion extends Model{
    
    use SoftDeletes;
    protected $table = 'pedidos_avance_recepcion';  
    protected $fillable = ['pedido_id','total_claves_recibidas','total_insumos_recibidos','total_monto_recibido','porcentaje_claves','porcentaje_insumos','porcentaje_total','fecha_primer_entrega','fecha_ultima_entrega'];
}
