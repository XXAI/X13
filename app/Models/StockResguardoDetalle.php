<?php

namespace App\Models;

use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class StockResguardoDetalle extends Model{
    
    use SoftDeletes;
    protected $table = 'stocks_resguardo_detalles';  
    protected $fillable = ['stock_id','descripcion','son_piezas','cantidad_resguardada','cantidad_restante','condiciones_salida','usuario_resguarda_id'];

    public function stock(){
        return $this->belongsTo('App\Models\Stock','stock_id');
    }

    public function usuario(){
        return $this->belongsTo('App\Models\User','usuario_resguarda_id');
    }
}
