<?php

namespace App\Models;

use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\SoftDeletes;

class Almacen extends BaseModel{
    
    use SoftDeletes;
    protected $generarID = true;
    protected $guardarIDServidor = true;
    protected $guardarIDUsuario = true;
    protected $keyType = 'string';
    protected $table = 'movimientos';  
    protected $fillable = ['clues','nombre','tipo_almacen_id','externo','unidosis'];
}