<?php

namespace App\Models;

use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Capitulo extends Model{
    
    use SoftDeletes;
    protected $table = 'cog_capitulos';  
    protected $fillable = ['id','clave','anio','descripcion'];    

    public function conceptos(){
        return $this->hasMany('App\Models\Concepto','clave_capitulo');
    }
}