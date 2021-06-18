<?php

namespace App\Models;

use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Medicamento extends Model{
    
    use SoftDeletes;
    protected $table = 'medicamentos';  
    protected $fillable = ['insumo_medico_id','presentacion_id','forma_farmaceutica_id','concentracion','contenido','via_administracion_id','indicaciones'];
    //
}
