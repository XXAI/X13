<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class GrupoFuncion extends Model
{
    use SoftDeletes;
    protected $fillable = ['id','grupo','descripcion_funcion'];
    protected $table = 'catalogo_grupo_funcion';
}
