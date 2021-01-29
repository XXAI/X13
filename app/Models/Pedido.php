<?php

namespace App\Models;

use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Pedido extends Model{
    
    use SoftDeletes;
    protected $table = 'pedidos';  
    protected $fillable = ['folio','descripcion','mes','anio','observaciones','total_claves','total_insumos','total_monto','tipo_pedido','estatus','unidad_medica_id','programa_id','fecha_concluido','fecha_validado','fecha_publicado','fecha_cancelado','generado_por','concluido_por','validado_por','publicado_por','cancelado_por'];

    public function unidadMedica(){
        return $this->belongsTo('App\Models\UnidadMedica','unidad_medica_id');
    }

    public function programa(){
        return $this->belongsTo('App\Models\Programa','programa_id');
    }

    public function listaInsumosMedicos(){
        return $this->hasMany('App\Models\PedidoListaInsumos','pedido_id');
    }

    public function listaInsumosMedicosUnidades(){
        return $this->hasMany('App\Models\PedidoListaInsumosUnidad','pedido_id');
    }

    public function listaUnidadesMedicas(){
        return $this->hasMany('App\Models\PedidoListaUnidades','pedido_id');
    }

    public function avanceRecepcion(){
        return $this->hasOne('App\Models\PedidoAvanceRecepcion','pedido_id');
    }

    public function recepcionesAnteriores(){
        return $this->belongsToMany('App\Models\Movimiento', 'rel_movimientos_pedidos', 'pedido_id', 'movimiento_id')->where('estatus','RP-FI')->orderBy('fecha_movimiento','DESC');
    }

    public function recepcionActual(){
        return $this->belongsToMany('App\Models\Movimiento', 'rel_movimientos_pedidos', 'pedido_id', 'movimiento_id')->where('estatus','RP-BR');
    }
}
