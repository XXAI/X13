<?php

namespace App\Models;

use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class BienServicio extends Model{
    
    use SoftDeletes;
    protected $table = 'bienes_servicios';  
    protected $fillable = ['clave_partida_especifica','familia_id','clave_cubs','clave_local','articulo','especificaciones','descontinuado'];

    public function insumoMedico(){
        return $this->hasOne('App\Models\InsumoMedico','bienes_servicios_id');
    }
}
