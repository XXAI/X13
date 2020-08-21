<?php

namespace App\Models;

use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\SoftDeletes;

class InsumoMedico extends BaseModel{
    
    use SoftDeletes;
    protected $generarID = false;
    protected $guardarIDServidor = false;
    protected $guardarIDUsuario = false;
    protected $table = 'insumos_medicos';  
    protected $fillable = ['clave','tipo_insumo','nombre_generico','descripcion','es_unidosis','tiene_fecha_caducidad','fecha_descontinuado'];

    public function medicamento(){
        return $this->hasOne('App\Models\Medicamento','insumo_medico_id');
    }

    public function materialCuracion(){
        return $this->hasOne('App\Models\MaterialCuracion','insumo_medico_id');
    }
}
