<?php

namespace App\Models;

use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class BienServicio extends Model{
    
    use SoftDeletes;
    protected $table = 'bienes_servicios';  
    protected $fillable = ['clave_partida_especifica','familia_id','clave_cubs','clave_local','articulo','especificaciones','descontinuado'];

    public function partidaEspecifica(){
        return $this->belongsTo('App\Models\PartidaEspecifica','clave_partida_especifica','clave');
    }

    public function familia(){
        return $this->belongsTo('App\Models\Familia','familia_id');
    }
}
