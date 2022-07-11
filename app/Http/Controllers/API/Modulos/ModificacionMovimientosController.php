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
use App\Models\BienServicioEmpaqueDetalle;
use App\Models\UnidadMedicaTurno;
use App\Models\PersonalMedico;
use App\Models\Paciente;
use App\Models\TipoSolicitud;
use App\Models\SolicitudTipoUso;
use App\Models\Solicitud;
use App\Models\MovimientoModificacion;
use App\Models\Movimiento;
use App\Models\MovimientoArticulo;
use App\Models\User;

class ModificacionMovimientosController extends Controller{
    public function obtenerHistorialModificaciones(Request $request, $id){
        try{
            $movimiento = Movimiento::find($id);
            if(!$movimiento){
                return response()->json(['error'=>"Movimiento no encontrado"],HttpResponse::HTTP_OK);
            }

            if($movimiento->estatus == 'BOR'){
                return response()->json(['error'=>"El movimiento no tiene el estatus requerido para ejecutar esta acción"],HttpResponse::HTTP_OK);
            }

            $modificaciones = MovimientoModificacion::conDescripciones()->with('modificacionesArticulos')->where('movimiento_id',$id)->orderBy('updated_at','DESC')->get();
            //$modificacion->load('solicitadoUsuario','aprobadoUsuario','canceladoUsuario');
            //TODO::crear ruta en API

            return response()->json(['data'=>$modificaciones],HttpResponse::HTTP_OK);
        }catch(\Exception $e){
            return response()->json(['error'=>['message'=>$e->getMessage(),'line'=>$e->getLine()]], HttpResponse::HTTP_CONFLICT);
        }
    }

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
                'programa_id',
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

            if(isset($parametros['programa_id']) && $datos_originales['programa_id'] != $datos_modificados['programa_id']){
                $datos_modificados['programa'] = $parametros['programa'];
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
                $response = [ 'estatus'=> false ];
                if($movimiento->direccion_movimiento == 'ENT'){
                    //Movimiento de entrada
                    $movimiento->programa_id = $datos_modificados['programa_id'];
                    $response = $this->modificarArticulosEntrada($movimiento,$parametros['articulos_modificados']);
                }
                if(!$response['estatus']){
                    DB::rollback();
                    return response()->json(['error'=>$response['mensaje'],'parametros'=>$response],HttpResponse::HTTP_OK);
                }
                
                if(count($response['lista_modificaciones']) > 0){
                    $datos_originales['total_articulos'] = $movimiento->total_articulos;
                    $datos_originales['total_claves'] = $movimiento->total_claves;
                    $datos_originales['total_monto'] = $movimiento->total_monto;
                    
                    $datos_modificados['total_articulos'] = $response['datos_modificados_movimiento']['total_articulos'];
                    $datos_modificados['total_claves'] = $response['datos_modificados_movimiento']['total_claves'];
                    $datos_modificados['total_monto'] = $response['datos_modificados_movimiento']['total_monto'];

                    $modificacion->modificacionesArticulos()->createMany($response['lista_modificaciones']);
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

    private function modificarArticulosEntrada($movimiento,$lista_articulos){
        $loggedUser = auth()->userOrFail();
        $response_estatus = true;
        $mensaje = '|-- Guardado con Éxito --|';
        $listado_modificaciones = []; //['tipo_modificacion'=>('ADD'|'DEL'|'UPD'), 'movimiento_articulo_id'=>0, 'registro_original'=>json, 'registro_modificado'=>json]
        $bitacora_modificaciones = [];
        $es_recepcion = false;

        $conteo_claves = 0;

        $movimiento->load(['tipoMovimiento','listaArticulos'=>function($listaArticulos){ $listaArticulos->with('stock.usuario','usuario'); }]);

        $movimiento_articulos_bd = []; //=> $lista_articulos_original
        for($i = 0; $i < count($movimiento->listaArticulos); $i++){
            $item = $movimiento->listaArticulos[$i];
            if(!isset($movimiento_articulos_bd[$item->bien_servicio_id])){
                $movimiento_articulos_bd[$item->bien_servicio_id] = [];
                $conteo_claves++;
            }
            $movimiento_articulos_bd[$item->bien_servicio_id][$item->id.'-'.$item->stock_id] = [
                'movimiento_articulo_id' => $item->id, //movimiento_articulo_id
                'stock_id' => $item->stock_id, //stock_id
                'encontrado' => false,
                'item' => $item, //{ movimiento_articulo.stock }
            ];
        }
        $bitacora_modificaciones[] = '+Se inicia recorrido de articulo: ---------------------------------------------- Total Claves: '.$conteo_claves;

        $total_conteo_articulo = count($lista_articulos);
        for($i = 0; $i < $total_conteo_articulo; $i++){
            $articulo_id = $lista_articulos[$i]['id'];
            $articulo_clave = $lista_articulos[$i]['clave'];
            $bitacora_modificaciones[] = '|--+ Trabajando Articulo: '.$articulo_clave.' [Total Lotes: '.count($lista_articulos[$i]['lotes']).' ]';

            $total_conteo_lotes = count($lista_articulos[$i]['lotes']);
            for($j = 0; $j < $total_conteo_lotes; $j++){
                /***  Datos del lote recibido del cliente, lo datos nuevos que reemplazarán lo guardado en la base de datos  ***/
                $lote = $lista_articulos[$i]['lotes'][$j];

                $lote['programa_id'] = $movimiento->programa_id;//Asignamos el id del programa del movimiento de entrada

                //Se obtiene el modo de entrada del lote
                if($lote['entrada_piezas']){
                    $modo_movimiento = 'UNI';
                }else{
                    $modo_movimiento = 'NRM';
                }
                $bitacora_modificaciones[] = '   |--+ Se Obtiene el Lote: '.$lote['lote'].' y su Modo de Entrada: '.$modo_movimiento;

                if($lote['cantidad'] < 0){
                    $response_estatus = false;
                    $mensaje = 'La cantidad asignada al articulo con Clave: '.$articulo_clave.' y Lote: '.$lote['lote'].' es negativa';
                    break 2;
                }

                /***  Si existe id, es un lote creado anteriomente, por lo tanto se validará si es necesario modificar  ***/
                if(isset($lote['id']) && $lote['id']){
                    //$lote[id] == movimiento_articulo_id

                    /***  Si se encuentra dentro de los articulos guardados del movimiento, iniciar proceso de validación y modificación(id: movimiento_articulo->id, stock_id: movimiento_articulo->stock_id)  ***/
                    if(isset($movimiento_articulos_bd[$articulo_id][$lote['id'].'-'.$lote['stock_id']])){
                        $bitacora_modificaciones[] = '      |--+ Revisando Lote: '.$lote['lote'];

                        $actualizar_datos = false; //Para determinar si hubo cambios, y se deben modificar datos
                        $nuevo_stock = null; //Nuevo stock a guardar/crear
                        $salidas_seleccionadas_total = ['normal'=>0,'piezas'=>0];
                        $salidas_seleccionadas_lista = [];

                        /***  Se marca el elemento para indicar que si existe en el request, todos los registros debe encontrarse de lo contrario marcar error  ***/
                        $movimiento_articulos_bd[$articulo_id][$lote['id'].'-'.$lote['stock_id']]['encontrado'] = true;

                        //{ movimiento_articulo.stock }
                        $movimiento_articulo_db = $movimiento_articulos_bd[$articulo_id][$lote['id'].'-'.$lote['stock_id']]['item'];

                        /***  Datos originales del stock, para comparativas y calculos de existencias anteriores  ***/
                        $stock_db = [
                            'empaque_detalle_id'=>$movimiento_articulo_db->stock->empaque_detalle_id,
                            'programa_id'       =>$movimiento_articulo_db->stock->programa_id,
                            'marca_id'          =>$movimiento_articulo_db->stock->marca_id,
                            'modelo'            =>$movimiento_articulo_db->stock->modelo,
                            'no_serie'          =>$movimiento_articulo_db->stock->no_serie,
                            'lote'              =>$movimiento_articulo_db->stock->lote,
                            'fecha_caducidad'   =>$movimiento_articulo_db->stock->fecha_caducidad,
                            'codigo_barras'     =>$movimiento_articulo_db->stock->codigo_barras,
                        ];
                        
                        /***  Se checa si hay algun cambio en los datos del lote, de ser asi se procederá a validar las modificaciones  ***/
                        foreach ($stock_db as $key => $value) {
                            if(isset($lote[$key]) && $stock_db[$key] != $lote[$key]){
                                $actualizar_datos = true;
                                break;
                            }
                        }

                        /***  Si hay datos a modificar en los lotes y el movimieto es de tipo recepción, regresar error, ya que las recepciónes solo deben poder modificar la cantidad recibida  ***/
                        if($movimiento->tipoMovimiento->clave == 'RCPCN' && $actualizar_datos){
                            $response_estatus = false;
                            $mensaje = 'El tipo de movimiento no permite este nivel de modificación.';
                            break 2;
                        }

                        /***  Preparamos los objetos que guardaran los originales y modificados para el historial de modificaciones  ***/
                        $registro_original = [
                            'articulo'=>['id'=>$articulo_id, 'clave'=>$articulo_clave],
                            //'movimiento_articulo' => $movimiento_articulo_db->toArray(),
                            //'stock'=>null,
                            //'nuevo_stock'=>null,
                            //'salidas_seleccionadas'=>null,
                            //'recepcion_transferencias'=>null,
                        ];

                        $registro_modificado = [
                            //'movimiento_articulo'=>null,
                            //'stock'=>null,
                            //'nuevo_stock'=>null,
                            //'salidas_seleccionadas'=>null,
                            //'recepcion_transferencias'=>null, 
                        ];

                        /***  Si el lote esta marcado para ser eliminado  ***/
                        if(isset($lote['marcado_borrar']) && $lote['marcado_borrar']){
                            $registro_original['movimiento_articulo'] = ['id'=>$movimiento_articulo_db->id, 'user_id'=>$movimiento_articulo_db->user_id, 'user'=>$movimiento_articulo_db->usuario->username, 'cantidad'=>$movimiento_articulo_db->cantidad, 'deleted_at'=>$movimiento_articulo_db->deleted_at];
                            
                            //$salidas_seleccionadas = [];
                            //Si existen salidas seleccionadas para eliminar 
                            if(isset($lote['lista_salidas']) && count($lote['lista_salidas']) > 0){
                                $registro_original['salidas_seleccionadas'] = [];
                                $registro_modificado['salidas_seleccionadas'] = [];

                                $salidas_eliminar_stock = MovimientoArticulo::with('movimiento.modificadoPor')->where('bien_servicio_id',$articulo_id)->whereIn('id',$lote['lista_salidas'])->where('stock_id',$lote['stock_id'])->where('direccion_movimiento','SAL')->get();
                                for($k = 0; $k < count($salidas_eliminar_stock); $k++){
                                    $ma_eliminar = $salidas_eliminar_stock[$k];
                                    $registro_original['salidas_seleccionadas'][] = [
                                        'id' => $ma_eliminar->id,
                                        'movimiento_id' => $ma_eliminar->movimiento_id,
                                        'movimiento_folio' => $ma_eliminar->movimiento->folio,
                                        'movimiento_total_articulos' => $ma_eliminar->movimiento->total_articulos,
                                        'movimiento_total_claves' => $ma_eliminar->movimiento->total_claves,
                                        'movimiento_total_monto' => $ma_eliminar->movimiento->total_monto,
                                        'movimiento_modificado_por_usuario_id' => $ma_eliminar->movimiento->modificado_por_usuario_id,
                                        'movimiento_modificado_por_usuario' => $ma_eliminar->movimiento->modificado_por->username,
                                        'cantidad' => $ma_eliminar->cantidad,
                                        'user_id' => $ma_eliminar->user_id,
                                        'deleted_at' => $ma_eliminar->deleted_at,
                                    ];

                                    $conteos_movimiento = MovimientoArticulo::select(DB::raw('SUM(cantidad) as total_articulos'), DB::raw('COUNT(DISTINCT bien_servicio_id) as total_claves'), DB::raw('SUM(total_monto) as total_monto'))
                                                                            ->where('movimiento_id',$ma_eliminar->movimiento_id)->where('id','!=',$ma_eliminar->id)->first();
                                    $ma_eliminar->movimiento->update(['total_articulos'=>$conteos_movimiento->total_articulos, 'total_claves'=>$conteos_movimiento->total_claves, 'total_monto'=>$conteos_movimiento->total_monto,'modificado_por_usuario_id'=>$loggedUser->id]);
                                    $ma_eliminar->update(['user_id' => $loggedUser->id]);
                                    $ma_eliminar->delete();

                                    $registro_modificado['salidas_seleccionadas'][] = [
                                        'id' => $ma_eliminar->id,
                                        'movimiento_id' => $ma_eliminar->movimiento_id,
                                        'movimiento_folio' => $ma_eliminar->movimiento->folio,
                                        'movimiento_total_articulos' => $ma_eliminar->movimiento->total_articulos,
                                        'movimiento_total_claves' => $ma_eliminar->movimiento->total_claves,
                                        'movimiento_total_monto' => $ma_eliminar->movimiento->total_monto,
                                        'movimiento_modificado_por_usuario_id' => $ma_eliminar->movimiento->modificado_por_usuario_id,
                                        'movimiento_modificado_por_usuario' => $loggedUser->username,
                                        'cantidad' => $ma_eliminar->cantidad,
                                        'user_id' => $ma_eliminar->user_id,
                                        'deleted_at' => $ma_eliminar->deleted_at,
                                    ];
                                }
                            }
                            $movimiento_articulo_db->update(['user_id'=>$loggedUser->id]);
                            $movimiento_articulo_db->delete();

                            $registro_modificado['movimiento_articulo'] = ['id'=>$movimiento_articulo_db->id, 'user_id'=>$movimiento_articulo_db->user_id, 'user' => $loggedUser->username, 'cantidad'=>$movimiento_articulo_db->cantidad, 'deleted_at'=>$movimiento_articulo_db->deleted_at];

                            $bitacora_modificaciones[] = '      |--+ Se eliminó el Lote: '.$lote['lote'];

                            $listado_modificaciones[] = ['tipo_modificacion'=>'DEL', 'movimiento_articulo_id'=>$movimiento_articulo_db->id, 'registro_original'=>json_encode($registro_original), 'registro_modificado'=>json_encode($registro_modificado)];
                            continue;
                        }
                        
                        //Obtener las salidas seleccionadas(ids para actualizar), y sumar las cantidad para realizar operaciones de ajustes de existencias
                        if(isset($lote['lista_salidas']) && count($lote['lista_salidas']) > 0){
                            $salidas_seleccionadas_lista = MovimientoArticulo::where('bien_servicio_id',$articulo_id)->whereIn('id',$lote['lista_salidas'])->where('stock_id',$lote['stock_id'])->where('direccion_movimiento','SAL')->get();
                            for($k = 0; $k < count($salidas_seleccionadas_lista); $k++){
                                if($salidas_seleccionadas_lista[$k]->modo_movimiento == 'UNI'){
                                    $salidas_seleccionadas_total['piezas'] += $salidas_seleccionadas_lista[$k]->cantidad;
                                }else{
                                    $salidas_seleccionadas_total['normal'] += $salidas_seleccionadas_lista[$k]->cantidad;
                                }
                            }
                        }

                        /***  Si es necesario actualizar los datos o se modifico la cantidad de entrada, se procedera a validar la modificación  ***/
                        $ajustar_existencias = false;
                        if( $actualizar_datos || $lote['cantidad'] != $movimiento_articulo_db->cantidad ){
                            $bitacora_modificaciones[] = '      |--+ Modificar Datos del Lote: '.$stock_db['lote'];
                            
                            if($actualizar_datos){
                                /***  Se checa si ya existe algun otro stock con los datos que se actualizarán, en caso de ser asi se agregarian a dicho stock las cantidades del movimiento actual  ***/
                                $nuevo_stock = Stock::where('almacen_id',$movimiento_articulo_db->stock->almacen_id)->where('bien_servicio_id',$movimiento_articulo_db->stock->bien_servicio_id)->where('id','!=',$movimiento_articulo_db->stock->id);
                                foreach ($stock_db as $key => $value) {
                                    if(isset($lote[$key])){
                                        $nuevo_stock = $nuevo_stock->where($key,$lote[$key]);
                                    }
                                }
                                $nuevo_stock = $nuevo_stock->first();
                                if($nuevo_stock){
                                    $bitacora_modificaciones[] = '      |--+ Se Encontró Nuevo Stock: '.$lote['lote'];
                                    $registro_original['nuevo_stock'] = $nuevo_stock->toArray();
                                }
                            }

                            //Agregamos cantidad al stock_db, para facilitar comparaciones y calculos
                            $stock_db['cantidad'] = $movimiento_articulo_db->cantidad;

                            /******************************************************************************************************************************************************
                             * Inicio: Obtenemos el detalle del empaque, tanto el anterior como el nuevo, en caso de que se haya modificado ese dato                              *
                             *                                                                                                                                                    */
                            $piezas_x_empaque = 1;
                            $nuevo_piezas_x_empaque = 1;

                            $detalle_empaque = BienServicioEmpaqueDetalle::find($stock_db['empaque_detalle_id']);
                            if($detalle_empaque){
                                $piezas_x_empaque = $detalle_empaque->piezas_x_empaque;
                            }
                            $bitacora_modificaciones[] = '      |--+ Se Obtiene Piezas x Empaque Guardado: '.$piezas_x_empaque;

                            if($lote['empaque_detalle_id'] != $stock_db['empaque_detalle_id']){
                                $detalle_empaque = BienServicioEmpaqueDetalle::find($lote['empaque_detalle_id']);
                                if($detalle_empaque){
                                    $nuevo_piezas_x_empaque = $detalle_empaque->piezas_x_empaque;
                                }
                            }else{
                                $nuevo_piezas_x_empaque = $piezas_x_empaque;
                            }
                            $bitacora_modificaciones[] = '      |--+ Se Obtiene Piezas x Empaque Nuevo: '.$nuevo_piezas_x_empaque;
                            /*                                                                                                                                                    *
                             * Fin: Obtenemos el detalle del empaque, tanto el anterior como el nuevo, en caso de que se haya modificado ese dato                                 *
                             ******************************************************************************************************************************************************/

                             /******************************************************************************************************************************************************
                             * Inicio: Sacamos un resumen de los movimientos de Entrada y Salida, excluyendo el movimiento de Entrada que se esta modificando                     *
                             *                                                                                                                                                    */
                            $suma_movimientos = MovimientoArticulo::select(DB::raw('SUM(movimientos_articulos.cantidad) as cantidad'), 'movimientos_articulos.modo_movimiento', 'movimientos_articulos.direccion_movimiento' )
                                                                ->leftJoin('movimientos','movimientos.id','=','movimientos_articulos.movimiento_id')
                                                                ->where(function($where){
                                                                    $where->where('movimientos.estatus','!=','BOR')->where('movimientos.estatus','!=','CAN');
                                                                })
                                                                ->where('movimientos_articulos.stock_id',$movimiento_articulo_db->stock_id)
                                                                ->where('movimientos_articulos.id','!=',$movimiento_articulo_db->id)
                                                                ->groupBy('movimientos_articulos.stock_id')
                                                                ->groupBy('movimientos_articulos.direccion_movimiento')
                                                                ->groupBy('movimientos_articulos.modo_movimiento')
                                                                ->get();
                            //Se calculan el total de Entradas y Salidas por Pieza (Unidosis)
                            $total_entradas_piezas = 0;
                            $total_salidas_piezas = 0;
                            for($k  = 0; $k < count($suma_movimientos); $k++){
                                $suma = $suma_movimientos[$k];
                                if($suma->direccion_movimiento == 'ENT'){
                                    if($suma->modo_movimiento == 'UNI'){
                                        $total_entradas_piezas += $suma->cantidad;
                                    }else{
                                        $total_entradas_piezas += ($suma->cantidad * $nuevo_piezas_x_empaque);
                                    }
                                }else if($suma->direccion_movimiento == 'SAL'){
                                    if($suma->modo_movimiento == 'UNI'){
                                        $total_salidas_piezas += $suma->cantidad;
                                    }else{
                                        $total_salidas_piezas += ($suma->cantidad * $nuevo_piezas_x_empaque);
                                    }
                                }
                            }
                            $bitacora_modificaciones[] = '      |--+ Se Obtiene La Suma de los Movimientos Relacionados al Lote: '.$lote['lote'].' [Total Entradas: '.$total_entradas_piezas.', Total Salidas: '.$total_salidas_piezas.', Existencias: '.($total_entradas_piezas-$total_salidas_piezas).']';
                            /*                                                                                                                                                    *
                             * Fin: Sacamos un resumen de los movimientos de Entrada y Salida, excluyendo el movimiento de Entrada que se esta modificando                        *
                             ******************************************************************************************************************************************************/

                            $ajustar_existencias = ($lote['cantidad'] != $stock_db['cantidad'] || $piezas_x_empaque != $nuevo_piezas_x_empaque);

                            /************************************************************  Las acciones a realizar seran en base al total de Entradas y Salidas que tenga el stock(lote)  ************************************************************/
                            if(!$nuevo_stock && $total_entradas_piezas == 0){
                                /******************************************************************************************************************************************************
                                 * Inicio: No hay otros movimientos de Entrada                                                                                                        *
                                 *                                                                                                                                                    */
                                
                                /***  Si no hay nuevo stock y no hay otras entradas, se puede modificar el lote sin problemas: accion_lote = edit  ***/
                                if($actualizar_datos){
                                    $movimiento_articulo_db->stock->update($lote);
                                    $bitacora_modificaciones[] = '      |--+ Se Actualizaron los Datos del Stock con Lote: '.$lote['lote'];
                                }

                                /***  Si se modifico la cantidad o el detalle del empaque  ***/
                                if($ajustar_existencias){ 

                                    /***  Se calculan las cantidades a usar como existencias  ***/
                                    if($modo_movimiento == 'UNI'){
                                        $existencias = floor($lote['cantidad'] / $nuevo_piezas_x_empaque);
                                        $existencias_piezas = $lote['cantidad'];
                                    }else{
                                        $existencias = $lote['cantidad'];
                                        $existencias_piezas = ($lote['cantidad'] * $nuevo_piezas_x_empaque);
                                    }

                                    if($total_salidas_piezas > 0){
                                        /***  Se recalculan las existencias, en base a las salidas  ***/
                                        $existencias_piezas -= $total_salidas_piezas;
                                        $existencias = floor($existencias_piezas / $nuevo_piezas_x_empaque);

                                        //Si las exitencias son negativas, regresar error
                                        if($existencias_piezas < 0){
                                            $response_estatus = false;
                                            $mensaje = 'Las existencias del articulo con Clave: '.$articulo_clave.' y Lote: '.$lote['lote'].', alcanzan valores negativos';
                                            break 2;
                                        }

                                        $movimiento_articulo_db->stock->existencia = $existencias;
                                        $movimiento_articulo_db->stock->existencia_piezas = $existencias_piezas;
                                        $movimiento_articulo_db->stock->save();
                                    }

                                    $bitacora_modificaciones[] = '      |--+ Se Actualizaron Existencias del Stock con Lote: '.$stock_db['lote'].' [ Existencia Piezas: '.$movimiento_articulo_db->stock->existencia_piezas.' ]';
                                }

                                if($actualizar_datos && $total_salidas_piezas > 0){
                                    //Checar si salidas son transferencias
                                    $lista_movimiento_id_salidas = MovimientoArticulo::select('movimiento_id')->where('direccion_movimiento','SAL')->where('bien_servicio_id',$articulo_id)->where('stock_id',$movimiento_articulo_db->stock_id)->groupBy('movimiento_id')->get();
                                    $lista_movimiento_id_salidas = $lista_movimiento_id_salidas->pluck('movimiento_id');

                                    //Obtener la lista de ids de los movimientos de transferencia
                                    $tipo_movimiento = TipoMovimiento::where('clave','LMCN')->where('movimiento','SAL')->first();
                                    $lista_movimientos_transferencias = Movimiento::select('id')->where('tipo_movimiento_id',$tipo_movimiento->id)->where('estatus','FIN')->whereIn('id',$lista_movimiento_id_salidas)->where('direccion_movimiento','SAL')->get();
                                    $lista_movimientos_transferencias = $lista_movimientos_transferencias->pluck('id');

                                    //Estatus de conflicto en las entradas/recepciones de las salidas(transferencias) de este stock
                                    $tipo_movimiento = TipoMovimiento::where('clave','RCPCN')->where('movimiento','ENT')->first();

                                    $movimientos_recepcion = Movimiento::where('tipo_movimiento_id',$tipo_movimiento->id)->where('estatus','FIN')->where('direccion_movimiento','ENT')
                                                                        ->whereIn('movimiento_padre_id',$lista_movimientos_transferencias)->get();
                                    $registro_original['recepcion_transferencias'] = $movimientos_recepcion->toArray();

                                    $movimientos_modificados = Movimiento::where('tipo_movimiento_id',$tipo_movimiento->id)->where('estatus','FIN')->where('direccion_movimiento','ENT')->whereIn('movimiento_padre_id',$lista_movimientos_transferencias)
                                                                        ->update(['estatus'=>'CONF','modificado_por_usuario_id'=>$loggedUser->id]);

                                    $movimientos_recepcion = Movimiento::where('tipo_movimiento_id',$tipo_movimiento->id)->where('estatus','FIN')->where('direccion_movimiento','ENT')
                                                                        ->whereIn('movimiento_padre_id',$lista_movimientos_transferencias)->get();
                                    $registro_modificado['recepcion_transferencias'] = $movimientos_recepcion->toArray();

                                    $bitacora_modificaciones[] = '      |--+ Se Marcan las entradas que sean recepciones de transferencias, del Stock modificado con Lote: '.$stock_db['lote'];
                                    $bitacora_modificaciones[] = '      |--+ Se Marcaron las entradas por traspaso del stock editado: '.json_encode($movimientos_modificados);
                                }
                                /*                                                                                                                                                    *
                                 * Fin: No hay otros movimientos de Entrada                                                                                                           *
                                 ******************************************************************************************************************************************************/
                                
                            }else if($total_entradas_piezas > 0){
                                /******************************************************************************************************************************************************
                                 * Inicio: Hay otros movimientos de Entrada                                                                                                           *
                                 *                                                                                                                                                    */
                                
                                 /***  Si no hay nuevo stock y hay otras entradas, se creara un nuevo stock con los datos recibidos en el request: accion_lote = create  ***/
                                if(!$nuevo_stock && $actualizar_datos){
                                    $datos_nuevo_stock = [
                                        'unidad_medica_id'  =>$movimiento_articulo_db->stock->unidad_medica_id,
                                        'almacen_id'        =>$movimiento_articulo_db->stock->almacen_id,
                                        'bien_servicio_id'  =>$movimiento_articulo_db->stock->bien_servicio_id,
                                        'empaque_detalle_id'=>(isset($lote['empaque_detalle_id']))?$lote['empaque_detalle_id']:null,
                                        'programa_id'       =>(isset($lote['programa_id']))?$lote['programa_id']:null,
                                        'marca_id'          =>(isset($lote['marca_id']))?$lote['marca_id']:null,
                                        'modelo'            =>(isset($lote['modelo']))?$lote['modelo']:null,
                                        'no_serie'          =>(isset($lote['no_serie']))?$lote['no_serie']:null,
                                        'lote'              =>(isset($lote['lote']))?$lote['lote']:null,
                                        'fecha_caducidad'   =>(isset($lote['fecha_caducidad']))?$lote['fecha_caducidad']:null,
                                        'codigo_barras'     =>(isset($lote['codigo_barras']))?$lote['codigo_barras']:null,
                                        'existencia'        =>0,
                                        'existencia_piezas' =>0,
                                        'user_id'           =>$loggedUser->id,
                                    ];
                                    $nuevo_stock = Stock::create($datos_nuevo_stock);
                                    $bitacora_modificaciones[] = '      |--+ Se Crea un Nuevo Stock con Lote: '.$lote['lote'];
                                }

                                if($nuevo_stock){
                                    /***  Si se va a guardar en otro lote, se restan las existencias originales del lote actual, ya que estas se moveran  ***/
                                    /***  Calcular las existencias con las cantidades originales  ***/
                                    if($modo_movimiento == 'UNI'){
                                        $cantidad = floor($stock_db['cantidad'] / $piezas_x_empaque);
                                        $cantidad_piezas = $stock_db['cantidad'];
                                    }else{
                                        $cantidad = $stock_db['cantidad'];
                                        $cantidad_piezas = ($stock_db['cantidad'] * $piezas_x_empaque);
                                    }

                                    $existencias_piezas = $movimiento_articulo_db->stock->existencia_piezas - $cantidad_piezas;
                                    
                                    //Si hay salidas seleccionadas, estas se moveran al nuevo stock, asi que se sumaran a las existencias del stock anterior
                                    if(count($salidas_seleccionadas_lista) > 0){
                                        $salidas_cantidad_piezas = $salidas_seleccionadas_total['piezas'];
                                        $salidas_cantidad_piezas += ($salidas_seleccionadas_total['normal'] * $piezas_x_empaque);
                                        $existencias_piezas += $salidas_cantidad_piezas;
                                    }

                                    if($existencias_piezas < 0){
                                        $response_estatus = false;
                                        $mensaje = 'Las existencias del articulo con Clave: '.$articulo_clave.' y Lote: '.$lote['lote'].', alcanzan valores negativos';
                                        break 2;
                                    }

                                    $existencias = floor($existencias_piezas / $nuevo_piezas_x_empaque);

                                    $movimiento_articulo_db->stock->existencia = $existencias;
                                    $movimiento_articulo_db->stock->existencia_piezas = $existencias_piezas;
                                    $movimiento_articulo_db->stock->save();
                                }else if($ajustar_existencias){
                                    /***  Recalcular las exitencias en base a las nuevas cantidades ***/
                                    if($modo_movimiento == 'UNI'){ //Recalcular existencias con datos de empaque cantidades nuevos/actuales
                                        $nuevas_existencias = floor($lote['cantidad'] / $nuevo_piezas_x_empaque);
                                        $nuevas_existencias_piezas = $lote['cantidad'];
                                    }else{
                                        $nuevas_existencias = $lote['cantidad'];
                                        $nuevas_existencias_piezas = ($lote['cantidad'] * $nuevo_piezas_x_empaque);
                                    }

                                    //Se recalculan las existencias en base a las cantidades modificadas
                                    $existencias_piezas = ($total_entradas_piezas + $nuevas_existencias_piezas) - $total_salidas_piezas;
                                    $existencias = floor($existencias_piezas / $nuevo_piezas_x_empaque);

                                    if($existencias_piezas < 0){
                                        $response_estatus = false;
                                        $mensaje = 'Las existencias del articulo con Clave: '.$articulo_clave.' y Lote: '.$lote['lote'].', alcanzan valores negativos';
                                        break 2;
                                    }

                                    $movimiento_articulo_db->stock->existencia = $existencias;
                                    $movimiento_articulo_db->stock->existencia_piezas = $existencias_piezas;
                                    $movimiento_articulo_db->stock->save();
                                }
                                $bitacora_modificaciones[] = '      |--+ Se Actualizaron Existencias del Lote: '.$stock_db['lote'].' [ Existencia Piezas: '.$movimiento_articulo_db->stock->existencia_piezas.' ]';

                                /*                                                                                                                                                    *
                                 * Fin: Hay otros movimientos de Entrada                                                                                                              *
                                 ******************************************************************************************************************************************************/
                            }

                            /******************************************************************************************************************************************************
                             * Inicio: Si el stock(lote) tiene resguardo, hay que recalcular para que el resguardo no sobrepase las existencias                                   *
                             *                                                                                                                                                    */
                            if(intval($movimiento_articulo_db->stock->resguardo_piezas) > 0 && intval($movimiento_articulo_db->stock->resguardo_piezas) > $movimiento_articulo_db->stock->existencia_piezas){
                                $movimiento_articulo_db->stock->resguardo_piezas = $movimiento_articulo_db->stock->existencia_piezas;

                                $movimiento_articulo_db->stock->load(['resguardoDetalle'=>function($resguardoDetalle){
                                    $resguardoDetalle->where('cantidad_restante','>',0);
                                }]);

                                $registro_original['movimiento_articulo'] = $movimiento_articulo_db->toArray(); //Se agrega de nuevo ahora con los detalles del resguardo

                                $cantidades_restantes = $movimiento_articulo_db->stock->existencia_piezas;
                                foreach ($movimiento_articulo_db->stock->resguardoDetalle as $resguardo){
                                    $cantidad_resguardo = $resguardo->cantidad_resguardada;
                                    $cantidad_resguardo_piezas = $resguardo->cantidad_resguardada;
                                    if($resguardo->son_piezas != 1){
                                        $cantidad_resguardo_piezas = $resguardo->cantidad_resguardada * $nuevo_piezas_x_empaque;
                                    }

                                    if($cantidades_restantes > $cantidad_resguardo_piezas){
                                        $cantidades_restantes -= $cantidad_resguardo_piezas;
                                    }else{
                                        if($cantidades_restantes > 0){
                                            $resguardo->cantidad_resguardada = ($resguardo->son_piezas == 1)?$cantidades_restantes:ceil($cantidades_restantes/$nuevo_piezas_x_empaque);
                                            $cantidades_restantes = 0;
                                        }else{
                                            $resguardo->cantidad_resguardada = 0;
                                        }

                                        $cantidad_resguardo_piezas =  ($resguardo->son_piezas == 1)?$resguardo->cantidad_resguardada:($resguardo->cantidad_resguardada * $nuevo_piezas_x_empaque);
                                        
                                        if($resguardo->cantidad_restante > $cantidad_resguardo_piezas){
                                            $resguardo->cantidad_restante = $cantidad_resguardo_piezas;
                                            
                                        }
                                    }

                                    $resguardo->save();
                                }
                                
                                $bitacora_modificaciones[] = '      |--+ Se Actualizaron los Resguardos del Lote: '.$stock_original['lote'].' [ Existencia Piezas: '.$movimiento_articulo_db->stock->resguardo_piezas.' ]';
                            }
                            /*                                                                                                                                                    *
                             * Fin: Si el stock(lote) tiene resguardo, hay que recalcular para que el resguardo no sobrepase las existencias                                      *
                             ******************************************************************************************************************************************************/

                            /******************************************************************************************************************************************************
                             * Inicio: Si se guardan los datos en otro stock, diferente al actual                                                                                 *
                             *                                                                                                                                                    */
                            if($nuevo_stock){
                                 /***  Calcular la cantidad a agregar a existencias del nuevo stock ***/
                                 if($modo_movimiento == 'UNI'){
                                    $cantidad = floor($lote['cantidad'] / $nuevo_piezas_x_empaque);
                                    $cantidad_piezas = $lote['cantidad'];
                                }else{
                                    $cantidad = $lote['cantidad'];
                                    $cantidad_piezas = ($lote['cantidad'] * $nuevo_piezas_x_empaque);
                                }

                                //Si hay salidas seleccionadas, aplicar las salidas a las existencias del nuevo stock
                                $existencias_piezas = $nuevo_stock->existencia_piezas + $cantidad_piezas;
                                if(count($salidas_seleccionadas_lista) > 0){
                                    $salidas_cantidad_piezas = $salidas_seleccionadas_total['piezas'];
                                    $salidas_cantidad_piezas += ($salidas_seleccionadas_total['normal'] * $nuevo_piezas_x_empaque);
                                    $existencias_piezas -= $salidas_cantidad_piezas;
                                }

                                if($existencias_piezas < 0){ 
                                    $response_estatus = false;
                                    $mensaje = 'Las existencias del articulo con Clave: '.$articulo_clave.' y Lote: '.$lote['lote'].', alcanzan valores negativos';
                                    break 2;
                                }

                                $nuevo_stock->existencia = floor($existencias_piezas / $nuevo_piezas_x_empaque);
                                $nuevo_stock->existencia_piezas = $existencias_piezas;
                                $nuevo_stock->save();
                                $bitacora_modificaciones[] = '      |--+ Se Actualizaron las Existencias del Otro Stock con Lote: '.$lote['lote'].' [ Existencia Piezas: '.$nuevo_stock->existencia_piezas.' ]';

                                /***  Si el lote anterior tenia salidas capturadas, mover estas salidas a el otro lote ***/
                                if(count($salidas_seleccionadas_lista) > 0){
                                    $registro_original['salidas_seleccionadas'] = MovimientoArticulo::select('id','movimiento_id','direccion_movimiento','bien_servicio_id','stock_id')->where('bien_servicio_id',$articulo_id)->whereIn('id',$lote['lista_salidas'])->where('direccion_movimiento','SAL')->get()->toArray();
                                    MovimientoArticulo::where('bien_servicio_id',$articulo_id)->whereIn('id',$lote['lista_salidas'])->where('direccion_movimiento','SAL')->where('stock_id',$movimiento_articulo_db->stock_id)->update(['stock_id'=>$nuevo_stock->id]);
                                    $registro_modificado['salidas_seleccionadas'] = MovimientoArticulo::select('id','movimiento_id','direccion_movimiento','bien_servicio_id','stock_id')->where('bien_servicio_id',$articulo_id)->whereIn('id',$lote['lista_salidas'])->where('direccion_movimiento','SAL')->get()->toArray();
                                    $bitacora_modificaciones[] = '      |--+ Se Modificaron las Salidas del Lote: '.$lote['lote'];

                                    if($actualizar_datos){
                                        //Checar si salidas son transferencias
                                        $lista_movimiento_id_salidas = MovimientoArticulo::select('movimiento_id')->where('direccion_movimiento','SAL')->where('stock_id',$nuevo_stock->id)->groupBy('movimiento_id')->whereIn('id',$lote['lista_salidas'])->get();
                                        $lista_movimiento_id_salidas = $lista_movimiento_id_salidas->pluck('movimiento_id');
    
                                        //Obtener la lista de ids de los movimientos de transferencia
                                        $tipo_movimiento = TipoMovimiento::where('clave','LMCN')->where('movimiento','SAL')->first();
                                        $lista_movimientos_transferencias = Movimiento::select('id')->where('tipo_movimiento_id',$tipo_movimiento->id)->where('estatus','FIN')->whereIn('id',$lista_movimiento_id_salidas)->where('direccion_movimiento','SAL')->get();
                                        $lista_movimientos_transferencias = $lista_movimientos_transferencias->pluck('id');
    
                                        //Estatus de conflicto en las entradas/recepciones de las salidas(transferencias) de este stock
                                        $tipo_movimiento = TipoMovimiento::where('clave','RCPCN')->where('movimiento','ENT')->first();
    
                                        $movimientos_recepcion = Movimiento::where('tipo_movimiento_id',$tipo_movimiento->id)->where('estatus','FIN')->where('direccion_movimiento','ENT')
                                                                            ->whereIn('movimiento_padre_id',$lista_movimientos_transferencias)->get();
                                        $registro_original['recepcion_transferencias'] = $movimientos_recepcion->toArray();
    
                                        $movimientos_modificados = Movimiento::where('tipo_movimiento_id',$tipo_movimiento->id)->where('estatus','FIN')->where('direccion_movimiento','ENT')->whereIn('movimiento_padre_id',$lista_movimientos_transferencias)
                                                                            ->update(['estatus'=>'CONF','modificado_por_usuario_id'=>$loggedUser->id]);
    
                                        $movimientos_recepcion = Movimiento::where('tipo_movimiento_id',$tipo_movimiento->id)->where('estatus','FIN')->where('direccion_movimiento','ENT')
                                                                            ->whereIn('movimiento_padre_id',$lista_movimientos_transferencias)->get();
                                        $registro_modificado['recepcion_transferencias'] = $movimientos_recepcion->toArray();
    
                                        $bitacora_modificaciones[] = '      |--+ Se Marcan las entradas que sean recepciones de transferencias, del Stock modificado con Lote: '.$stock_db['lote'];
                                        $bitacora_modificaciones[] = '      |--+ Se Marcaron las entradas por traspaso del stock editado: '.json_encode($movimientos_modificados);
                                    }
                                }

                                //

                                //Agregar registro nuevo stock
                                $registro_modificado['nuevo_stock'] = $nuevo_stock->toArray();
                                
                                //Modificamos la referencia al stock
                                $movimiento_articulo_db->stock_id = $nuevo_stock->id;
                            }
                            /*                                                                                                                                                    *
                             * Fin: Si se guardan los datos en otro stock, diferente al actual                                                                                    *
                             ******************************************************************************************************************************************************/
                        }

                        $diferencias_precios = ($lote['precio_unitario'] != $movimiento_articulo_db->precio_unitario || $lote['iva'] != $movimiento_articulo_db->iva);
                        if($actualizar_datos || $ajustar_existencias || $diferencias_precios){
                            /***  Actualizamos los datos en el registro correspondiente al stock(lote) del movimiento (tabla movimientos_articulos) ***/
                            $movimiento_articulo_db->cantidad = $lote['cantidad'];
                            $movimiento_articulo_db->modo_movimiento = $modo_movimiento;
                            $movimiento_articulo_db->precio_unitario = $lote['precio_unitario'];
                            $movimiento_articulo_db->iva = $lote['iva'];
                            $movimiento_articulo_db->total_monto = $lote['total_monto'];
                            $movimiento_articulo_db->save();
                            $bitacora_modificaciones[] = '      |--+ Se Actualizaron datos del Articulo: '.$articulo_clave.' - Lote: '.$lote['lote'];

                            $registro_modificado['movimiento_articulo'] = $movimiento_articulo_db->toArray();

                            $listado_modificaciones[] = ['tipo_modificacion'=>'UPD', 'movimiento_articulo_id'=>$movimiento_articulo_db->id, 'registro_original'=>json_encode($registro_original), 'registro_modificado'=>json_encode($registro_modificado)];
                        }
                    }else{
                        /***  Si no se encuentra dentro de los articulos guardados del movimiento, regresar error  ***/
                        $bitacora_modificaciones[] = '   |--+ No se encontró Lote: '.$lote['lote'] . ' -- Error';
                        $response_estatus = false;
                        break 2;
                    }

                }else{ //-> if(isset($lote['id']) && $lote['id'])
                    $nuevo_piezas_x_empaque = 1;
                    $detalle_empaque = BienServicioEmpaqueDetalle::find($lote['empaque_detalle_id']);
                    if($detalle_empaque){
                        $nuevo_piezas_x_empaque = $detalle_empaque->piezas_x_empaque;
                    }
                    if($modo_movimiento == 'UNI'){
                        $existencias = floor($lote['cantidad'] / $nuevo_piezas_x_empaque);
                        $existencias_piezas = $lote['cantidad'];
                    }else{
                        $existencias = $lote['cantidad'];
                        $existencias_piezas = ($lote['cantidad'] * $nuevo_piezas_x_empaque);
                    }

                    if($existencias_piezas < 0){ 
                        $response_estatus = false;
                        $mensaje = 'Las existencias del articulo con Clave: '.$articulo_clave.' y Lote: '.$lote['lote'].', alcanzan valores negativos';
                        break 2;
                    }

                    $nuevo_lote = [
                        'unidad_medica_id'  =>$movimiento->unidad_medica_id,
                        'almacen_id'        =>$movimiento->almacen_id,
                        'bien_servicio_id'  =>$articulo_id,
                        'empaque_detalle_id'=>(isset($lote['empaque_detalle_id']))?$lote['empaque_detalle_id']:null,
                        'programa_id'       =>(isset($lote['programa_id']))?$lote['programa_id']:null,
                        'marca_id'          =>(isset($lote['marca_id']))?$lote['marca_id']:null,
                        'modelo'            =>(isset($lote['modelo']))?$lote['modelo']:null,
                        'no_serie'          =>(isset($lote['no_serie']))?$lote['no_serie']:null,
                        'lote'              =>(isset($lote['lote']))?$lote['lote']:null,
                        'fecha_caducidad'   =>(isset($lote['fecha_caducidad']))?$lote['fecha_caducidad']:null,
                        'codigo_barras'     =>(isset($lote['codigo_barras']))?$lote['codigo_barras']:null,
                    ];

                    /***  Se checa si ya existe algun otro stock con los datos que se agregarán  ***/
                    $nuevo_stock = Stock::getModel();
                    foreach ($nuevo_lote as $key => $value) {
                        if($value){
                            $nuevo_stock = $nuevo_stock->where($key,$value);
                        }
                    }
                    $nuevo_stock = $nuevo_stock->first();
                    
                    $nuevo_lote['existencia'] = $existencias;
                    $nuevo_lote['existencia_piezas'] = $existencias_piezas;
                    $nuevo_lote['user_id'] = $loggedUser->id;

                    if($nuevo_stock){
                        $existencia_anterior = ($modo_movimiento == 'UNI')?$nuevo_stock->existencia_piezas:$nuevo_stock->existencia;
                        $nuevo_lote['existencia'] += $nuevo_stock->existencia;
                        $nuevo_lote['existencia_piezas'] += $nuevo_stock->existencia_piezas;
                        $nuevo_stock->update($nuevo_lote);
                    }else{
                        $existencia_anterior = 0;
                        $nuevo_stock = Stock::create($nuevo_lote);
                    }

                    $nuevo_movimiento_articulo = [
                        'movimiento_id'=> $movimiento->id,
                        'stock_id'=> $nuevo_stock->id,
                        'bien_servicio_id'=> $articulo_id,
                        'direccion_movimiento'=> 'ENT',
                        'modo_movimiento'=> $modo_movimiento,
                        'cantidad'=> $lote['cantidad'],
                        'precio_unitario'=> $lote['precio_unitario'],
                        'iva'=> $lote['iva'],
                        'total_monto'=> $lote['total_monto'],
                        'cantidad_anterior'=> $existencia_anterior,
                        'user_id'=> $loggedUser->id,
                    ];
                    $nuevo_articulo = MovimientoArticulo::create($nuevo_movimiento_articulo);

                    $registro_modificado = ['movimiento_articulo'=>$nuevo_articulo->toArray(), 'nuevo_stock'=>$nuevo_stock->toArray()];
                    $listado_modificaciones[] = ['tipo_modificacion'=>'ADD', 'movimiento_articulo_id'=>$nuevo_articulo->id, 'registro_original'=>null, 'registro_modificado'=>json_encode($registro_modificado)];

                    $bitacora_modificaciones[] = '   |--+ Creando Lote: '.$lote['lote'];
                }
            }
        }

        $conteos_movimiento = MovimientoArticulo::select(DB::raw('SUM(cantidad) as total_articulos'), DB::raw('COUNT(DISTINCT bien_servicio_id) as total_claves'), DB::raw('SUM(total_monto) as total_monto'))->where('movimiento_id',$movimiento->id)->first();
        
        $datos_movimiento = [
            'total_articulos' => $conteos_movimiento->total_articulos, 
            'total_claves' => $conteos_movimiento->total_claves, 
            'total_monto' => $conteos_movimiento->total_monto,
        ];

        $bitacora_modificaciones[] = '|--+ Actualizando Movmiento: '.$movimiento->folio;

        return ['estatus'=>$response_estatus, 'mensaje'=>$mensaje, 'data'=>$bitacora_modificaciones, 'lista_modificaciones'=>$listado_modificaciones, 'datos_modificados_movimiento'=>$datos_movimiento];
    }
}