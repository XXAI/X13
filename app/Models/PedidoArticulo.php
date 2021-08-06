<?php

namespace App\Models;

use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PedidoArticulo extends Model{
    
    use SoftDeletes;
    protected $table = 'pedidos_lista_articulos';  
    protected $fillable = ['pedido_id','bien_servicio_id','cantidad_original','cantidad','precio_unitario','monto'];

    public function articulo(){
        return $this->belongsTo('App\Models\BienServicio','bien_servicio_id');
    }

    public function listaArticulosUnidades(){
        return $this->hasMany('App\Models\PedidoArticuloUnidad','pedido_articulo_id');
    }
}
