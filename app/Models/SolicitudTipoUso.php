<?php

namespace App\Models;

use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class SolicitudTipoUso extends Model{
    
    use SoftDeletes;
    protected $table = 'catalogo_solicitudes_tipos_uso';
    protected $fillable = ['clave','descripcion'];
}
