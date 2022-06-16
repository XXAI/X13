<?php

namespace App\Models;

use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Model;

class MovimientoModificacionArticulo extends Model{
    
    protected $table = 'movimientos_modificaciones_articulos';  
    protected $fillable = ['modificacion_id','tipo_modificacion','movimiento_articulo_id','registro_original','registro_modificado'];
    
    public function movimientoArticulo(){
        return $this->belongsTo('App\Models\MovimientoArticulo','movimiento_articulo_id');
    }

}