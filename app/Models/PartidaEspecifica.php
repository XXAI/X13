<?php

namespace App\Models;

use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PartidaEspecifica extends Model{
    
    use SoftDeletes;
    protected $table = 'cog_partidas_especificas';  
    protected $fillable = ['id','clave','clave_partida_generica','anio','descripcion'];    

    public function bienesServicios(){
        return $this->hasMany('App\Models\BienesServicios','clave_partida_especifica');
    }

    public function partidaGenerica(){
        return $this->belongsTo('App\Models\PartidaGenerica','clave_partida_generica');
    }
}
