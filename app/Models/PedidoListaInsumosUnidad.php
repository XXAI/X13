<?php

namespace App\Models;

use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\SoftDeletes;

class PedidoListaInsumosUnidad extends BaseModel{
    
    use SoftDeletes;
    protected $generarID = false;
    protected $guardarIDServidor = false;
    protected $guardarIDUsuario = false;
    protected $table = 'pedidos_lista_insumos_unidades';  
    protected $fillable = ['pedido_id','pedido_insumo_id','unidad_medica_id','cantidad','precio_unitario','monto'];

    public function unidadMedica(){
        return $this->belongsTo('App\Models\UnidadMedica','unidad_medica_id');
    }
}
