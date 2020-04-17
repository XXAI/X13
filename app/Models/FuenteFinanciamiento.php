<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class FuenteFinanciamiento extends Model
{
    use SoftDeletes;
    protected $fillable = ['id','descripcion'];
    protected $table = 'catalogo_fuente_financiamiento';
}
