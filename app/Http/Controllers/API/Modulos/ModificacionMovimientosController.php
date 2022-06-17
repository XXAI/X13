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
                    'nivel_modificacion' => $parametros['nivel_modificacion'],
                    'motivo_modificacion' => $parametros['motivo_modificacion'],
                    'solicitado_fecha' => $parametros['solicitado_fecha'],
                    'solicitado_usuario_id' => $loggedUser->id,
                ]);
            }else if($modificacion->solicitado_usuario_id == $loggedUser->id){
                $modificacion->nivel_modificacion = $parametros['nivel_modificacion'];
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

            if($modificacion->nivel_modificacion == 2){
                $response = $this->modificarArticulos($movimiento,$parametros['articulos_modificados']);
                if(!$response['estatus']){
                    DB::rollback();
                    return response()->json(['error'=>$response['mensaje'],'parametros'=>$response],HttpResponse::HTTP_OK);
                }
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

    private function modificarArticulos($movimiento,$lista_articulos){
        $movimiento->observaciones = '-D-';
        $movimiento->save();
        $response_estatus = false;
        $mensaje = 'Guardado con éxito';
        $conteo_claves = 0;
        $conteo_articulos = 0;

        $movimiento->load('listaArticulos.stock');

        $lista_raw = $movimiento->listaArticulos;
        $lista_articulos_original = [];
        for($i = 0; $i < count($lista_raw); $i++){
            $item = $lista_raw[$i];
            if(!isset($lista_articulos_original[$item->bien_servicio_id])){
                $lista_articulos_original[$item->bien_servicio_id] = [];
                $conteo_claves++;
            }
            $lista_articulos_original[$item->bien_servicio_id][$item->id.'-'.$item->stock_id] = [
                'id' => $item->id,
                'stock_id' => $item->stock_id,
                'item' => $item,
            ];
        }

        for($i = 0; $i < count($lista_articulos); $i++){
            $articulo_id = $lista_articulos[$i]['id'];
            
            for($j = 0; $j < count($lista_articulos[$i]['lotes']); $j++){
                $lote = $lista_articulos[$i]['lotes'][$j];

                if(isset($lote['id']) && $lote['id']){
                    if(isset($lista_articulos_original[$articulo_id][$lote['id'].'-'.$lote['stock_id']])){
                        //Se encontro, hay que modificar
                        $actualizar_datos = false;

                        $item_base = $lista_articulos_original[$articulo_id][$lote['id'].'-'.$lote['stock_id']]['item'];
                        $stock_original = [
                            'empaque_detalle_id'=>$item_base->stock->empaque_detalle_id,
                            //'programa_id'       =>$item_base->stock->programa_id,
                            'marca_id'          =>$item_base->stock->marca_id,
                            'modelo'            =>$item_base->stock->modelo,
                            'no_serie'          =>$item_base->stock->no_serie,
                            'lote'              =>$item_base->stock->lote,
                            'fecha_caducidad'   =>$item_base->stock->fecha_caducidad,
                            'codigo_barras'     =>$item_base->stock->codigo_barras,
                        ];
                        
                        foreach ($stock_original as $key => $value) {
                            if(isset($lote[$key]) && $stock_original[$key] != $lote[$key]){
                                $actualizar_datos = true;
                                $conteo_articulos++;
                                break;
                            }
                        }

                        if($actualizar_datos){
                            //Agregar programa id al finalizar la modificacion en el cliente
                            //Si se actualizan datos checar si ya existe el lote con datos actualizados para agregarlo ahi, y dejar el lote anterior en 0s
                            $lote_guardado = Stock::where('almacen_id',$item_base->stock->almacen_id)->where('bien_servicio_id',$item_base->stock->bien_servicio_id);
                            foreach ($stock_original as $key => $value) {
                                if(isset($lote[$key])){
                                    $lote_guardado = $lote_guardado->where($key,$lote[$key]);
                                }
                            }
                            $lote_guardado = $lote_guardado->first();
                            //Si no existe actualizar el lote actual)
                            //Checar existencias contra la cantidad de entrada en el lote actual para validar que el lote solo tenga una entrada o si se necesita dividir en dos lotes (sumar todas las salidas y entradas a la existencia actual para la validación)
                            $item_base->stock->update($lote);
                        }
                        
                        //Checar cantidad de entrada
                        $articulo_movimiento_original = [
                            'modo_movimiento'   => $item_base->modo_movimiento,
                            'cantidad'          => $item_base->cantidad,
                            'precio_unitario'   => $item_base->precio_unitario,
                            'iva'               => $item_base->iva,
                        ];
                        
                        $mensaje = 'Cambio datos';
                    }else{
                        //No se encontro, debería estar
                        $response_estatus = false;
                        $mensaje = 'No se encontró';
                        break 2;
                    }
                }else{
                    //Es nuevo, hay que crear
                }
            }
        }

        return ['estatus'=>$response_estatus, 'mensaje'=>$mensaje.'='.$conteo_articulos, 'data'=>$lista_articulos_original];
    }
}