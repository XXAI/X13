<?php

namespace App\Models;

use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Almacen extends Model{
    
    use SoftDeletes;
    protected $table = 'almacenes';  
    protected $fillable = ['unidad_medica_id','nombre','tipo_almacen_id','externo','unidosis','responsable','user_id'];
}