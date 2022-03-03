<?php

namespace App\Models;

use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class SolicitudArticulo extends Model{
    
    use SoftDeletes;
    protected $table = 'solicitudes_articulos';  
    protected $fillable = ['solicitud_id','bien_servicio_id','cantidad_solicitada','cantidad_surtida'];

    public function articulo(){
        return $this->belongsTo('App\Models\BienServicio','bien_servicio_id');
    }
}