<?php

namespace App\Models;

use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class UnidadMedica extends Model{
    
    use SoftDeletes;
    protected $table = 'catalogo_unidades_medicas';
    protected $fillable = ['clues','distrito_id','nombre','nombre_corto'];

    public function almacenes(){
        return $this->hasMany('App\Models\Almacen','unidad_medica_id');
    }

    public function catalogos(){
        return $this->hasMany('App\Models\UnidadMedicaCatalogo','unidad_medica_id');
    }

    public function usuarios(){
        return $this->hasMany('App\Models\User','unidad_medica_asignada_id');
    }

    public function distrito(){
        return $this->belongsTo('App\Models\Distrito','distrito_id');
    }
}
