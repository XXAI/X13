<?php

namespace App\Models;

use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class UnidadMedicaTurno extends Model{
    
    use SoftDeletes;
    protected $table = 'unidad_medica_turnos';
    protected $fillable = ['unidad_medica_id','nombre','descripcion','captura_usuario_id','modifica_usuario_id'];
    
    public function unidadMedica(){
        return $this->belongsTo('App\Models\UnidadMedica','unidad_medica_id');
    }

}
