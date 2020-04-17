<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class TipoTrabajador extends Model
{
    use SoftDeletes;
    protected $fillable = ['descripcion'];
    protected $table = 'catalogo_tipo_trabajador';
}
