<?php

namespace App\Models;

use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class CartaCanje extends Model{
    
    use SoftDeletes;
    protected $table = 'cartas_canje';  
    protected $fillable = [
        'movimiento_id','movimiento_articulo_id','stock_id','bien_servicio_id','cantidad','memo_folio','memo_fecha','vigencia_meses','vigencia_fecha','obervaciones','estatus',
        'creado_por_usuario_id','cancelado_por_usuario_id','aplicado_por_usuario_id'
    ];

    public function movimiento(){
        return $this->belongsTo('App\Models\Movimiento','movimiento_id');
    }
    
    public function movimientoArticulo(){
        return $this->belongsTo('App\Models\MovimientoArticulo','movimiento_articulo_id');
    }

    public function stock(){
        return $this->belongsTo('App\Models\Stock','stock_id');
    }

    public function articulo(){
        return $this->belongsTo('App\Models\BienServicio','bien_servicio_id');
    }

    public function creadoPor(){
        return $this->belongsTo('App\Models\Usuario','creado_por_usuario_id');
    }

    public function canceladoPor(){
        return $this->belongsTo('App\Models\Usuario','cancelado_por_usuario_id');
    }

    public function aplicadoPor(){
        return $this->belongsTo('App\Models\Usuario','aplicado_por_usuario_id');
    }
}