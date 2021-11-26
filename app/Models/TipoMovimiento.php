<?php

namespace App\Models;

use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class TipoMovimiento extends Model{
    
    use SoftDeletes;
    protected $table = 'catalogo_tipos_movimiento';
    protected $fillable = ['clave','descripcion','movimiento','captura_independiente'];
}
