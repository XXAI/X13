<?php

namespace App\Models;

use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class UnidadMedida extends Model{
    
    use SoftDeletes;
    protected $table = 'catalogo_unidades_medida';  
    protected $fillable = ['pieza','descripcion'];    
}
