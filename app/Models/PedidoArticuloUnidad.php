<?php

namespace App\Models;

use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PedidoArticuloUnidad extends Model{
    
    use SoftDeletes;
    protected $table = 'pedidos_lista_articulos_unidades';  
    protected $fillable = ['pedido_id','pedido_articulo_id','unidad_medica_id','cantidad_original','cantidad','precio_unitario','monto'];

    public function unidadMedica(){
        return $this->belongsTo('App\Models\UnidadMedica','unidad_medica_id');
    }
}
