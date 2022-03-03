<?php

namespace App\Models;

use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Model;

class MovimientoArticuloBorrador extends Model{
    
    protected $table = 'movimientos_articulos_borrador';  
    protected $fillable = [
        'movimiento_id',
        'bien_servicio_id',
        'stock_id',
        'direccion_movimiento',
        'modo_movimiento',
        'cantidad_solicitado',
        'cantidad',
        'marca_id',
        'no_serie',
        'modelo',
        'lote',
        'fecha_caducidad',
        'codigo_barras',
        'user_id',
        'precio_unitario',
        'iva',
        'total_monto',
        'memo_folio','memo_fecha','vigencia_meses'
    ];

    public function articulo(){
        return $this->belongsTo('App\Models\BienServicio','bien_servicio_id');
    }
    
    public function stock(){
        return $this->belongsTo('App\Models\Stock','stock_id');
    }

    public function marca(){
        return $this->belongsTo('App\Models\Marca','marca_id');
    }
}