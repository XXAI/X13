<?php

namespace App\Models;

use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ConfigUnidadMedicaAbasto extends Model{
    
    use SoftDeletes;
    protected $table = 'config_unidad_medica_abasto_surtimiento';  
    protected $fillable = ['unidad_medica_id','total_claves_medicamentos_catalogo','total_claves_material_curacion_catalogo'];
}
