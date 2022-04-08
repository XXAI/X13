<?php

namespace App\Models;

use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Empaque extends Model{
    
    use SoftDeletes;
    protected $table = 'catalogo_empaques';  
    protected $fillable = ['descripcion'];    
}
