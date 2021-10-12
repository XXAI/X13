<?php

namespace App\Models;

use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ControlSubidaArchivos extends Model{
    
    use SoftDeletes;
    protected $table = 'control_subida_archivos';  
    protected $fillable = ['usuario_id','clave_solicitud','nombre_archivo','extension','ruta','conteo','observaciones'];
}