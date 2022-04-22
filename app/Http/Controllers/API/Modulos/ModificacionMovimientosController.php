<?php
namespace App\Http\Controllers\API\Modulos;

use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;

use App\Http\Controllers\Controller;

use App\Http\Requests;

use DB;
use Hash;

use App\Models\Almacen;
use App\Models\Programa;
use App\Models\Proveedor;
use App\Models\TipoMovimiento;
use App\Models\UnidadMedica;
use App\Models\Stock;
use App\Models\Marca;
use App\Models\AreaServicio;
use App\Models\BienServicio;
use App\Models\UnidadMedicaTurno;
use App\Models\PersonalMedico;
use App\Models\Paciente;
use App\Models\TipoSolicitud;
use App\Models\SolicitudTipoUso;
use App\Models\Solicitud;
use App\Models\MovimientoModificacion;
use App\Models\Movimiento;
use App\Models\User;

class ModificacionMovimientosController extends Controller{
    public function administrarModificacion(Request $request, $id){
        try{
            DB::beginTransaction();

            $movimiento = Movimiento::find($id);
            if(!$movimiento){
                return response()->json(['error'=>"Movimiento no encontrado"],HttpResponse::HTTP_OK);
            }

            if($movimiento->estatus != 'FIN' && $movimiento->estatus != 'PERE'){
                return response()->json(['error'=>"El movimiento no tiene el estatus requerido para ejecutar esta acción"],HttpResponse::HTTP_OK);
            }

            $fecha_hoy = date("Y-m-d");
            $loggedUser = auth()->userOrFail();
            $parametros = $request->all();
            $adminUsuario = null;
            $aprobarModificacion = false;
            $cancelarModificacion = false;

            if(isset($parametros['aprobar']) && $parametros['aprobar']){
                $aprobarModificacion = true;
            }

            if(isset($parametros['cancelar']) && $parametros['cancelar']){
                $cancelarModificacion = true;
            }

            if(isset($parametros['usuario']) && $parametros['usuario']){
                $adminUsuario = User::where('username',$parametros['usuario'])->first();
                if(!$adminUsuario){
                    return response()->json(['error'=>"Usuario: ".$parametros['usuario'].", no encontrado"],HttpResponse::HTTP_OK);
                }
                if(!Hash::check($parametros['contrasena'], $adminUsuario->password)){
                    return response()->json(['error'=>"La contraseña del usuario: ".$parametros['usuario']." es incorrecta"],HttpResponse::HTTP_OK);
                }
                if(!$adminUsuario->hasPermission('zSERUIFH40to0ATuFyWeA7KJ86xoZMGW')){
                    $accion = ($aprobarModificacion)?'aprobar':'cancelar';
                    return response()->json(['error'=>"El usuario ".$parametros['usuario']." no tiene el permiso para ".$accion." esta petición"],HttpResponse::HTTP_OK);
                }
            }

            $modificacion = MovimientoModificacion::where('movimiento_id',$id)->whereIn('estatus',['SOL','MOD'])->first();

            if(!$modificacion){
                $modificacion = MovimientoModificacion::create([
                    'movimiento_id' => $id,
                    'estatus' => 'SOL',
                    'motivo_modificacion' => $parametros['motivo_modificacion'],
                    'solicitado_fecha' => $parametros['solicitado_fecha'],
                    'solicitado_usuario_id' => $loggedUser->id,
                ]);
            }else if($modificacion->solicitado_usuario_id == $loggedUser->id){
                $modificacion->motivo_modificacion = $parametros['motivo_modificacion'];
                $modificacion->save();
            }else if(!$aprobarModificacion && !$cancelarModificacion){
                $modificacion->load('solicitadoUsuario','aprobadoUsuario','canceladoUsuario');
                return response()->json(['error'=>"Otro usuario ha solicitado la modificacion de este movimiento",'data'=>$modificacion],HttpResponse::HTTP_OK);
            }

            if($cancelarModificacion && ($adminUsuario || $modificacion->solicitado_usuario_id == $loggedUser->id)){
                $modificacion->cancelado_fecha = $fecha_hoy;
                $modificacion->cancelado_usuario_id = ($adminUsuario)?$adminUsuario->id:$loggedUser->id;
                $modificacion->estatus = 'CAN';
                $modificacion->save();
            }else if($cancelarModificacion){
                DB::rollback();
                return response()->json(['error'=>"No se puede cancelar esta petición, solo puede ser cancelada por el usuario que la creo o un usuario con los permisos correspondientes"],HttpResponse::HTTP_OK);
            }

            if($aprobarModificacion && $adminUsuario){
                $modificacion->aprobado_fecha = $fecha_hoy;
                $modificacion->aprobado_usuario_id = $adminUsuario->id;
                $modificacion->estatus = 'MOD';
                $modificacion->save();
            }else if($aprobarModificacion){
                DB::rollback();
                return response()->json(['error'=>"No se puede aprobar esta petición, solo puede ser aprobada por un usuario con los permisos correspondientes"],HttpResponse::HTTP_OK);
            }

            DB::commit();

            $modificacion->load('solicitadoUsuario','aprobadoUsuario','canceladoUsuario');
            return response()->json(['data'=>$modificacion],HttpResponse::HTTP_OK);
        }catch(\Exception $e){
            DB::rollback();
            return response()->json(['error'=>['message'=>$e->getMessage(),'line'=>$e->getLine()]], HttpResponse::HTTP_CONFLICT);
        }
    }

    public function guardarModificacion(Request $request, $id){
        try{
            $campos_editables = [
                'documento_folio',
                'fecha_movimiento',
                'observaciones',
                'paciente_id',
                'personal_medico_id',
                'solicitud_tipo_uso_id',
                'turno_id',
                'almacen_movimiento_id',
                'unidad_medica_movimiento_id',
                'area_servicio_movimiento_id',
                'tipo_movimiento_id',
                'proveedor_id',
                'referencia_folio',
                'referencia_fecha'
            ];

            DB::beginTransaction();

            $fecha_hoy = date("Y-m-d");
            $loggedUser = auth()->userOrFail();
            $parametros = $request->all();

            $movimiento = Movimiento::find($id);
            if(!$movimiento){
                return response()->json(['error'=>"Movimiento no encontrado"],HttpResponse::HTTP_OK);
            }

            $tipo_movimiento = TipoMovimiento::find($movimiento->tipo_movimiento_id);

            if($movimiento->estatus != 'FIN' && $movimiento->estatus != 'PERE'){
                return response()->json(['error'=>"El movimiento no tiene el estatus requerido para ejecutar esta acción"],HttpResponse::HTTP_OK);
            }

            if($movimiento->es_colectivo || $tipo_movimiento->clave == 'RCTA'){
                $buscar_solicitud = Solicitud::where('folio',trim($parametros['documento_folio']))->where('id','!=',$movimiento->solicitud_id)->first();
                if($buscar_solicitud){
                    DB::rollback();
                    $buscar_solicitud->load('listaArticulos.articulo','paciente','personalMedico','tipoSolicitud','usuarioFinaliza');
                    return response()->json(['error'=>'Se econtró una solicitud con el mismo folio','code'=>'solicitud_repetida','data'=>$buscar_solicitud],HttpResponse::HTTP_OK);
                }
            }

            $modificacion = MovimientoModificacion::where('movimiento_id',$id)->where('estatus','MOD')->first();

            if($modificacion->solicitado_usuario_id != $loggedUser->id){
                return response()->json(['error'=>"Solo el usuario que realizó la petición puede editar este movimiento"],HttpResponse::HTTP_OK);
            }

            if(!$modificacion){
                return response()->json(['error'=>"Solicitud de Modificación no encontrada"],HttpResponse::HTTP_OK);
            }

            $movimiento_original = $movimiento->toArray();
            $datos_originales = [];
            $datos_modificados = [];
            foreach ($campos_editables as $key) {
                if(isset($parametros[$key])){
                    $datos_originales[$key] = $movimiento_original[$key];
                    $datos_modificados[$key] = $parametros[$key];
                }
            }

            if(isset($parametros['proveedor_id']) && $datos_originales['proveedor_id'] != $datos_modificados['proveedor_id']){
                $datos_modificados['proveedor'] = $parametros['proveedor'];
            }

            if(isset($parametros['personal_medico']) && $parametros['personal_medico']){
                $personal_medico = $parametros['personal_medico'];
                if(isset($personal_medico['clave']) && $personal_medico['clave'] == 'NEW'){
                    $nuevo_personal= PersonalMedico::create([
                        'unidad_medica_id' => $loggedUser->unidad_medica_asignada_id,
                        'nombre_completo' => $personal_medico['nombre_completo'],
                        'puede_recetar' => ($tipo_movimiento->clave == 'RCTA')?true:false,
                    ]);
                    $datos_modificados['personal_medico_id'] = $nuevo_personal->id;
                    $datos_modificados['personal_medico'] = $nuevo_personal->toArray();
                }else{
                    $datos_modificados['personal_medico_id'] = $personal_medico['id'];
                }
            }

            if($tipo_movimiento->clave == 'RCTA' && isset($parametros['expediente_clinico']) && $parametros['expediente_clinico']){
                $parametros['expediente_clinico']   = trim($parametros['expediente_clinico']);
                $paciente = Paciente::where('expediente_clinico',$parametros['expediente_clinico'])->first();
                
                if(!$paciente){
                    $solicitudes = Solicitud::where('paciente_id',$movimiento->paciente_id)->where('id','!=',$movimiento->solicitud_id)->get();
                    if(count($solicitudes)){
                        $paciente = Paciente::create([
                            'expediente_clinico'=>$parametros['expediente_clinico'],
                            'nombre_completo'=>strtoupper($parametros['paciente']),
                            'curp'=>strtoupper($parametros['curp'])
                        ]);
                    }else{
                        $paciente = Paciente::find($movimiento->paciente_id);
                        $datos_originales['paciente'] = $paciente->toArray();
                        $paciente->update([
                            'expediente_clinico'=>$parametros['expediente_clinico'],
                            'nombre_completo'=>strtoupper($parametros['paciente']),
                            'curp'=>strtoupper($parametros['curp'])
                        ]);
                    }
                }else{
                    $datos_originales['paciente'] = $paciente->toArray();
                    $paciente->update([
                        'nombre_completo'=>strtoupper($parametros['paciente']),
                        'curp'=>strtoupper($parametros['curp'])
                    ]);
                }

                $datos_modificados['paciente'] = $paciente;
                $datos_modificados['paciente_id'] = $paciente->id;
            }

            if($movimiento->solicitud_id){
                $solicitud = Solicitud::find($movimiento->solicitud_id);
                $datos_originales['solicitud'] = $solicitud->toArray();
                $datos_actualizar = [
                    'folio'=>trim($datos_modificados['documento_folio']),
                    'fecha_solicitud'=>$datos_modificados['fecha_movimiento'],
                    'mes'=>substr($datos_modificados['fecha_movimiento'],5,2),
                    'anio'=>substr($datos_modificados['fecha_movimiento'],0,4),
                    'tipo_uso_id'=>(isset($datos_modificados['solicitud_tipo_uso_id']))?$datos_modificados['solicitud_tipo_uso_id']:null,
                    'turno_id'=>$datos_modificados['turno_id'],
                    'area_servicio_id'=>(isset($datos_modificados['area_servicio_movimiento_id']))?$datos_modificados['area_servicio_movimiento_id']:null,
                    'paciente_id'=>(isset($datos_modificados['paciente_id']))?$datos_modificados['paciente_id']:null,
                    'personal_medico_id'=>(isset($datos_modificados['personal_medico_id']))?$datos_modificados['personal_medico_id']:null,
                    'observaciones'=>'Elemento generado de forma automatica por el modulo de salidas',
                    'usuario_finaliza_id'=>$loggedUser->id
                ];
                $solicitud->update($datos_actualizar);
                $datos_modificados['solicitud'] = $solicitud->toArray();
            }

            if($movimiento->movimientoHijo && isset($datos_modificados['almacen_movimiento_id'])){
                $datos_movimiento_entrada = [
                    'almacen_id' => $datos_modificados['almacen_movimiento_id'],
                    'fecha_movimiento' => $datos_modificados['fecha_movimiento'],
                    'turno_id' => $datos_modificados['turno_id'],
                    'documento_folio' => ($movimiento->es_colectivo)?$datos_modificados['documento_folio']:$movimiento->folio,
                    'modificado_por_usuario_id' => $loggedUser->id,
                ];
                $movimiento->movimientoHijo()->update($datos_movimiento_entrada);
            }

            $modificacion->registro_original = json_encode($datos_originales);
            $modificacion->registro_modificado = json_encode($datos_modificados);
            $modificacion->modificado_usuario_id = $loggedUser->id;
            $modificacion->modificado_fecha = $fecha_hoy;
            $modificacion->estatus = 'FIN';
            $modificacion->save();
            
            $datos_modificados['modificado_por_usuario_id'] = $loggedUser->id;
            $movimiento->update($datos_modificados);

            DB::commit();

            $movimiento = Movimiento::with(['unidadMedica','unidadMedicaMovimiento','almacenMovimiento','areaServicioMovimiento','programa','turno','paciente','personalMedico',
                                            'tipoMovimiento','almacen','proveedor',
                                            'movimientoHijo' => function($movimientoHijo){
                                                return $movimientoHijo->with('almacen','tipoMovimiento','concluidoPor','modificadoPor');
                                            },'solicitud'=> function($solicitud){
                                                return $solicitud->with('tipoSolicitud','tipoUso');
                                            },'modificacionActiva'=>function($modificacionActiva){
                                                $modificacionActiva->with('solicitadoUsuario','aprobadoUsuario');
                                            }])->find($id);

            return response()->json(['data'=>['movimiento'=>$movimiento,'modificacion'=>$modificacion]],HttpResponse::HTTP_OK);
        }catch(\Exception $e){
            DB::rollback();
            return response()->json(['error'=>['message'=>$e->getMessage(),'line'=>$e->getLine()]], HttpResponse::HTTP_CONFLICT);
        }
    }
}