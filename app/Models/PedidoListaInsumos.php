<?php

namespace App\Models;

use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PedidoListaInsumos extends Model{
    
    use SoftDeletes;
    protected $table = 'pedidos_lista_insumos';  
    protected $fillable = ['pedido_id','insumo_medico_id','tipo_insumo','cantidad_original','cantidad','precio_unitario','monto'];

    public function insumoMedico(){
        return $this->belongsTo('App\Models\InsumoMedico','insumo_medico_id');
    }

    public function listaInsumosUnidades(){
        return $this->hasMany('App\Models\PedidoListaInsumosUnidad','pedido_insumo_id');
    }
}
