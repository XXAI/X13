<?php

namespace App\Models;

use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Solicitud extends Model{
    
    use SoftDeletes;
    protected $table = 'solicitudes';
    protected $fillable = [
        'folio','consecutivo','tipo_solicitud_id','fecha_solicitud','mes','anio', 'observaciones', 'estatus','unidad_medica_id','almacen_id','area_servicio_id','programa_id','turno_id','paciente_id','personal_medico_id',
        'total_claves_solicitadas','total_articulos_solicitados','total_claves_surtidas','total_articulos_surtidos','porcentaje_claves_surtidas','porcentaje_articulos_surtidos','tipo_uso_id',
        'usuario_captura_id','usuario_finaliza_id','usuario_cancela_id'
    ];

    public function paciente(){
        return $this->belongsTo('App\Models\Paciente','paciente_id');
    }

    public function personalMedico(){
        return $this->belongsTo('App\Models\PersonalMedico','personal_medico_id');
    }

    public function tipoSolicitud(){
        return $this->belongsTo('App\Models\TipoSolicitud','tipo_solicitud_id');
    }

    public function tipoUso(){
        return $this->belongsTo('App\Models\SolicitudTipoUso','tipo_uso_id');
    }

    public function unidadMedica(){
        return $this->belongsTo('App\Models\UnidadMedica','unidad_medica_id');
    }
    
    public function almacen(){
        return $this->belongsTo('App\Models\Almacen','almacen_id');
    }

    public function areaServicio(){
        return $this->belongsTo('App\Models\AreaServicio','area_servicio_id');
    }

    public function programa(){
        return $this->belongsTo('App\Models\Programa','programa_id');
    }

    public function movimientos(){
        return $this->hasMany('App\Models\Movimiento','solicitud_id');
    }

    public function listaArticulos(){
        return $this->hasMany('App\Models\SolicitudArticulo','solicitud_id');
    }

    /*public function listaArticulosBorrador(){
        return $this->hasMany('App\Models\MovimientoArticuloBorrador','movimiento_id');
    }*/

    public function usuarioCaptura(){
        return $this->belongsTo('App\Models\User','usuario_captura_id');
    }

    public function usuarioFinaliza(){
        return $this->belongsTo('App\Models\User','usuario_finaliza_id');
    }

    public function usuarioCancela(){
        return $this->belongsTo('App\Models\User','usuario_cancela_id');
    }
}