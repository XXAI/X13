<?php

namespace App\Models;

use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\SoftDeletes;

class Grupo extends BaseModel{
    
    use SoftDeletes;
    protected $generarID = false;
    protected $guardarIDServidor = false;
    protected $guardarIDUsuario = false;
    protected $table = 'grupos';
    protected $fillable = ['descripcion','clave_tipo_grupo','unidad_medica_principal_id'];

    public function unidadesMedicas(){
        return $this->belongsToMany('App\Models\UnidadMedica','grupos_unidades_medicas','grupo_id','unidad_medica_id');
    }

    public function unidadMedicaPrincipal(){
        return $this->belongsTo('App\Models\UnidadMedica','unidad_medica_principal_id');
    }
}
