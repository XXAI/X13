<?php

namespace App\Models;

use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PartidaGenerica extends Model{
    
    use SoftDeletes;
    protected $table = 'cog_partidas_genericas';  
    protected $fillable = ['clave','clave_concepto','anio','descripcion'];    

    public function partidasEspecificas(){
        return $this->hasMany('App\Models\PartidaEspecifica','clave_partida_generica');
    }

    public function concepto(){
        return $this->belongsTo('App\Models\Concepto','clave_concepto');
    }
}
