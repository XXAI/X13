<?php

namespace App\Models;

use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Distrito extends Model{
    
    use SoftDeletes;
    protected $table = 'catalogo_distritos';  
    protected $fillable = ['clave','descripcion'];    

    public function unidadesMedicas(){
        return $this->hasMany('App\Models\UnidadMedica','distrito_id');
    }
}
