<?php

namespace App\Models;

use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Model;

class MovimientoModificacion extends Model{
    
    protected $table = 'movimientos_modificaciones';  
    protected $fillable = ['movimiento_id','estatus','nivel_modificacion','motivo_modificacion','motivo_cancelado','motivo_revertido','solicitado_fecha','aprobado_fecha','modificado_fecha','cancelado_fecha','revertido_fecha',
                            'solicitado_usuario_id','aprobado_usuario_id','modificado_usuario_id','cancelado_usuario_id','revertido_usuario_id','registro_original','registro_modificado'];

    public function scopeConDescripciones(){
        return $this->select('movimientos_modificaciones.*','solicitado_usuario.name as solicitado_usuario','aprobado_usuario.name as aprobado_usuario','modificado_usuario.name as modificado_usuario',
                            'cancelado_usuario.name as cancelado_usuario','revertido_usuario.name as revertido_usuario')
                    ->leftJoin('users as solicitado_usuario','solicitado_usuario.id','=','movimientos_modificaciones.solicitado_usuario_id')
                    ->leftJoin('users as aprobado_usuario','aprobado_usuario.id','=','movimientos_modificaciones.aprobado_usuario_id')
                    ->leftJoin('users as modificado_usuario','modificado_usuario.id','=','movimientos_modificaciones.modificado_usuario_id')
                    ->leftJoin('users as cancelado_usuario','cancelado_usuario.id','=','movimientos_modificaciones.cancelado_usuario_id')
                    ->leftJoin('users as revertido_usuario','revertido_usuario.id','=','movimientos_modificaciones.revertido_usuario_id');
    }

    public function modificacionesArticulos(){
        return $this->hasMany('App\Models\MovimientoModificacionArticulo','modificacion_id');
    }

    public function movimiento(){
        return $this->belongsTo('App\Models\Movimiento','movimiento_id');
    }

    public function solicitadoUsuario(){
        return $this->belongsTo('App\Models\User','solicitado_usuario_id');
    }

    public function aprobadoUsuario(){
        return $this->belongsTo('App\Models\User','aprobado_usuario_id');
    }

    public function modificadoUsuario(){
        return $this->belongsTo('App\Models\User','modificado_usuario_id');
    }

    public function canceladoUsuario(){
        return $this->belongsTo('App\Models\User','cancelado_usuario_id');
    }

    public function revertidoUsuario(){
        return $this->belongsTo('App\Models\User','revertido_usuario_id');
    }

}