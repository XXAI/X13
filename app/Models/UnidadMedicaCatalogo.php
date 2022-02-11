<?php

namespace App\Models;

use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class UnidadMedicaCatalogo extends Model{
    
    use SoftDeletes;
    protected $table = 'unidad_medica_catalogo';
    protected $fillable = ['unidad_medica_id','tipo_bien_servicio_id','total_articulos','puede_editar','ultima_modificacion_por'];

    public function unidadMedica(){
        return $this->belongsTo('App\Models\UnidadMedica','unidad_medica_id');
    }
    
    public function tipoBienServicio(){
        return $this->belongsTo('App\Models\TipoBienServicio','tipo_bien_servicio_id');
    }

    public function ultimaModificacionPor(){
        return $this->belongsTo('App\Models\Usuario','ultima_modificacion_por');
    }
}
