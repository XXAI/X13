<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Codigo extends Model
{
    use SoftDeletes;
    protected $fillable = ['codigo','descripcion','grupo_funcion_id','tabulador_id'];
    protected $table = 'catalogo_codigo';

    public function grupoFuncion(){
        return $this->hasOne('App\Models\GrupoFuncion','id','grupo_funcion_id');
    }
}
