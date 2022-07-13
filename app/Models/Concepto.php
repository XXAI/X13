<?php

namespace App\Models;

use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Concepto extends Model{
    
    use SoftDeletes;
    protected $table = 'cog_conceptos';  
    protected $fillable = ['clave','clave_capitulo','anio','descripcion'];    

    public function partidasGenericas(){
        return $this->hasMany('App\Models\PartidaGenerica','clave_concepto');
    }

    public function capitulo(){
        return $this->belongsTo('App\Models\Capitulo','clave_capitulo');
    }
}
