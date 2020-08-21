<?php

namespace App\Models;

use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\SoftDeletes;

class MaterialCuracion extends BaseModel{
    
    use SoftDeletes;
    protected $generarID = false;
    protected $guardarIDServidor = false;
    protected $guardarIDUsuario = false;
    protected $table = 'materiales_curacion';  
    protected $fillable = ['insumo_medico_id','cantidad_x_envase','unidad_medida_id'];

    //
}
