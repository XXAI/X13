<?php

namespace App\Models;

use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\SoftDeletes;

class Medicamento extends BaseModel{
    
    use SoftDeletes;
    protected $generarID = false;
    protected $guardarIDServidor = false;
    protected $guardarIDUsuario = false;
    protected $table = 'medicamentos';  
    protected $fillable = ['insumo_medico_id','presentacion_id','forma_farmaceutica_id','es_controlado','concentracion','contenido','cantidad_x_envase','unidad_medida_id','via_administracion_id','indicaciones'];

    //
}
