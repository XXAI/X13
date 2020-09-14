<?php

namespace App\Models;

use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\SoftDeletes;

class Pedido extends BaseModel{
    
    use SoftDeletes;
    protected $generarID = false;
    protected $guardarIDServidor = false;
    protected $guardarIDUsuario = false;
    protected $table = 'pedidos';  
    protected $fillable = ['folio','descripcion','mes','anio','observaciones','total_claves','total_insumos','total_monto','tipo_pedido','estatus','unidad_medica_id','fecha_concluido','fecha_validado','fecha_publicado','fecha_cancelado','generado_por','concluido_por','validado_por','publicado_por','cancelado_por'];

    public function listaInsumosMedicos(){
        return $this->hasMany('App\Models\PedidoListaInsumos','pedido_id');
    }
}
