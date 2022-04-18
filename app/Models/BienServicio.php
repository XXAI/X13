<?php

namespace App\Models;

use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class BienServicio extends Model{
    
    use SoftDeletes;
    protected $table = 'bienes_servicios';  
    protected $fillable = ['clave_partida_especifica','familia_id','tipo_bien_servicio_id','clave_cubs','clave_local','articulo','especificaciones',
                            'destacar','presentacion_id','unidad_medida_id', 'descontinuado','tiene_fecha_caducidad','puede_surtir_unidades'];

    public function scopeDatosDescripcion($query,$unidad_medica_id = null){
        return $query->select('bienes_servicios.*','cog_partidas_especificas.descripcion AS partida_especifica','familias.nombre AS familia','catalogo_unidades_medida.descripcion as unidad_medida',
                                'unidad_medica_catalogo_articulos.es_normativo','unidad_medica_catalogo_articulos.cantidad_minima','unidad_medica_catalogo_articulos.cantidad_maxima',
                                'unidad_medica_catalogo_articulos.id AS en_catalogo_unidad','catalogo_tipos_bien_servicio.descripcion AS tipo_bien_servicio','catalogo_tipos_bien_servicio.clave_form')
                        ->leftjoin('cog_partidas_especificas','cog_partidas_especificas.clave','=','bienes_servicios.clave_partida_especifica')
                        ->leftjoin('familias','familias.id','=','bienes_servicios.familia_id')
                        ->leftjoin('catalogo_tipos_bien_servicio','catalogo_tipos_bien_servicio.id','bienes_servicios.tipo_bien_servicio_id')
                        ->leftjoin('catalogo_unidades_medida','catalogo_unidades_medida.id','=','bienes_servicios.unidad_medida_id')
                        ->leftJoin('unidad_medica_catalogo_articulos',function($join)use($unidad_medica_id){
                            return $join->on('unidad_medica_catalogo_articulos.bien_servicio_id','=','bienes_servicios.id')
                                ->where('unidad_medica_catalogo_articulos.unidad_medica_id',$unidad_medica_id)
                                ->whereNull('unidad_medica_catalogo_articulos.deleted_at');
                        })
                        ->orderBy('bienes_servicios.especificaciones');
    }

    public function empaqueDetalle(){
        return $this->hasMany('App\Models\BienServicioEmpaqueDetalle','bien_servicio_id');
    }

    public function unidadMedida(){
        return $this->belongsTo('App\Models\UnidadMedida','unidad_medida_id');
    }

    public function stocks(){
        return $this->hasMany('App\Models\Stock','bien_servicio_id');
    }

    public function enMovimientoBorrador(){
        return $this->hasMany('App\Models\MovimientoArticuloBorrador','bien_servicio_id');
    }

    public function tipoBienServicio(){
        return $this->belongsTo('App\Models\TipoBienServicio','tipo_bien_servicio_id');
    }

    public function partidaEspecifica(){
        return $this->belongsTo('App\Models\PartidaEspecifica','clave_partida_especifica','clave');
    }

    public function familia(){
        return $this->belongsTo('App\Models\Familia','familia_id');
    }
}
