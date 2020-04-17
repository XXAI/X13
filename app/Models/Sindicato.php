<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Sindicato extends Model
{
    use SoftDeletes;
    protected $fillable = ['descripcion'];
    protected $table = 'catalogo_sindicato';
}
