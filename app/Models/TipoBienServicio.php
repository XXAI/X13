<?php

namespace App\Models;

use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class TipoBienServicio extends Model{
    
    use SoftDeletes;
    protected $table = 'catalogo_tipos_bien_servicio';
    protected $fillable = ['id','descripcion','clave_form'];
}
