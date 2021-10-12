<?php

namespace App\Models;

use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class CorteReporteAbastoSurtimiento extends Model{
    
    use SoftDeletes;
    protected $table = 'corte_reporte_abasto_surtimiento';  
    protected $fillable = ['config_captura_id','unidad_medica_id','fecha_inicio','fecha_fin','claves_medicamentos_catalogo','claves_medicamentos_existentes','claves_medicamentos_porcentaje','claves_material_curacion_catalogo','claves_material_curacion_existentes','claves_material_curacion_porcentaje','total_claves_catalogo','total_claves_existentes','total_claves_porcentaje','recetas_recibidas','recetas_surtidas','recetas_porcentaje','colectivos_recibidos','colectivos_surtidos','colectivos_porcentaje','caducidad_3_meses_total_claves','caducidad_3_meses_total_piezas','caducidad_4_6_meses_total_claves','caducidad_4_6_meses_total_piezas','usuario_captura_id','validado'];

    public function unidadMedica(){
        return $this->belongsTo('App\Models\UnidadMedica','unidad_medica_id');
    }

    public function usuarioCaptura(){
        return $this->belongsTo('App\Models\Usuario','usuario_captura_id');
    }
}

