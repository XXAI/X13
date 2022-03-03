<?php

namespace App\Models;

use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class TipoSolicitud extends Model{
    
    use SoftDeletes;
    protected $table = 'catalogo_tipos_solicitud';
    protected $fillable = ['clave','descripcion'];
}
