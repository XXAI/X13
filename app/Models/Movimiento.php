<?php

namespace App\Models;

use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Movimiento extends Model{
    
    use SoftDeletes;
    protected $table = 'movimientos';  
    protected $fillable = [
        'unidad_medica_id','almacen_id','folio','consecutivo','direccion_movimiento','tipo_movimiento_id','estatus','fecha_movimiento','turno_id','solicitud_tipo_uso_id',
        'documento_folio','programa_id','proveedor_id','descripcion','entrega','recibe','observaciones','unidad_medica_movimiento_id','almacen_movimiento_id','area_servicio_movimiento_id','es_colectivo','paciente_id',
        'personal_medico_id','total_claves','total_articulos','total_monto','referencia_folio','referencia_fecha','cancelado','fecha_cancelacion','motivo_cancelacion','movimiento_padre_id','solicitud_id',
        'creado_por_usuario_id','modificado_por_usuario_id','concluido_por_usuario_id','cancelado_por_usuario_id','eliminado_por_usuario_id'
    ];

    public function modificacionActiva(){
        return $this->hasOne('App\Models\MovimientoModificacion','movimiento_id')->whereIn('estatus',['SOL','MOD']);
    }

    public function modificaciones(){
        return $this->hasMany('App\Models\MovimientoModificacion','movimiento_id');
    }

    public function tipoMovimiento(){
        return $this->belongsTo('App\Models\TipoMovimiento','tipo_movimiento_id');
    }

    public function turno(){
        return $this->belongsTo('App\Models\UnidadMedicaTurno','turno_id');
    }

    public function unidadMedica(){
        return $this->belongsTo('App\Models\UnidadMedica','unidad_medica_id');
    }

    public function unidadMedicaMovimiento(){
        return $this->belongsTo('App\Models\UnidadMedica','unidad_medica_movimiento_id');
    }
    
    public function almacen(){
        return $this->belongsTo('App\Models\Almacen','almacen_id');
    }

    public function almacenMovimiento(){
        return $this->belongsTo('App\Models\Almacen','almacen_movimiento_id');
    }

    public function areaServicioMovimiento(){
        return $this->belongsTo('App\Models\AreaServicio','area_servicio_movimiento_id');
    }

    public function programa(){
        return $this->belongsTo('App\Models\Programa','programa_id');
    }

    public function proveedor(){
        return $this->belongsTo('App\Models\Proveedor','proveedor_id');
    }

    public function paciente(){
        return $this->belongsTo('App\Models\Paciente','paciente_id');
    }

    public function personalMedico(){
        return $this->belongsTo('App\Models\PersonalMedico','personal_medico_id');
    }

    public function movimientoHijo(){
        return $this->hasOne('App\Models\Movimiento','movimiento_padre_id');
    }

    public function movimientoPadre(){
        return $this->belongsTo('App\Models\Movimiento','movimiento_padre_id');
    }

    public function solicitud(){
        return $this->belongsTo('App\Models\Solicitud','solicitud_id');
    }

    public function solicitudTipoUso(){
        return $this->belongsTo('App\Models\SolicitudTipoUso','solicitud_tipo_uso_id');
    }

    public function listaArticulos(){
        return $this->hasMany('App\Models\MovimientoArticulo','movimiento_id');
    }

    public function creadoPor(){
        return $this->belongsTo('App\Models\User','creado_por_usuario_id');
    }

    public function modificadoPor(){
        return $this->belongsTo('App\Models\User','modificado_por_usuario_id');
    }

    public function concluidoPor(){
        return $this->belongsTo('App\Models\User','concluido_por_usuario_id');
    }

    public function canceladoPor(){
        return $this->belongsTo('App\Models\User','cancelado_por_usuario_id');
    }

    public function eliminadoPor(){
        return $this->belongsTo('App\Models\User','eliminado_por_usuario_id');
    }


    public function listaArticulosBorrador(){
        return $this->hasMany('App\Models\MovimientoArticuloBorrador','movimiento_id');
    }

    public function pedido(){
        return $this->belongsToMany('App\Models\Pedido', 'rel_movimientos_pedidos', 'movimiento_id', 'pedido_id');
    }
}