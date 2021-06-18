<?php

namespace App\Models;

use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class InsumoMedico extends Model{
    
    use SoftDeletes;
    protected $table = 'insumos_medicos';  
    protected $fillable = ['bienes_servicios_id','tipo_insumo','es_unidosis','cantidad_x_envase','unidad_medida_id','tiene_fecha_caducidad','es_controlado'];

    public function medicamento(){
        return $this->hasOne('App\Models\Medicamento','insumo_medico_id');
    }
}
