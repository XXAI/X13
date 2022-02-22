<?php

namespace App\Models;

use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class UnidadMedicaCatalogoArticulo extends Model{
    
    use SoftDeletes;
    protected $table = 'unidad_medica_catalogo_articulos';
    protected $fillable = ['unidad_medica_catalogo_id','unidad_medica_id','bien_servicio_id','cantidad_minima','cantidad_maxima','es_normativo','modificado_por'];

    public function unidadMedica(){
        return $this->belongsTo('App\Models\BienServicio','unidad_medica_id');
    }
    
    public function articulo(){
        return $this->belongsTo('App\Models\BienServicio','bien_servicio_id');
    }
}