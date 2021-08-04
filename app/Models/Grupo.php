<?php

namespace App\Models;

use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Grupo extends Model{
    
    use SoftDeletes;
    protected $table = 'grupos';
    protected $fillable = ['descripcion','clave_tipo_grupo','unidad_medica_principal_id','total_unidades'];

    public function unidadesMedicas(){
        return $this->belongsToMany('App\Models\UnidadMedica','grupos_unidades_medicas','grupo_id','unidad_medica_id');
    }

    public function usuarios(){
        return $this->belongsToMany('App\Models\User','grupos_usuarios','grupo_id','usuario_id');
    }

    public function unidadMedicaPrincipal(){
        return $this->belongsTo('App\Models\UnidadMedica','unidad_medica_principal_id');
    }
}
