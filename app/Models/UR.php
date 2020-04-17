<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class UR extends Model
{
    use SoftDeletes;
    protected $fillable = ['llave','descripcion'];
    protected $table = 'catalogo_ur';
}
