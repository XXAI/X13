<?php

namespace App\Models;

use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class AreaServicio extends Model{
    
    use SoftDeletes;
    protected $table = 'catalogo_areas_servicios';  
    protected $fillable = ['descripcion'];
}