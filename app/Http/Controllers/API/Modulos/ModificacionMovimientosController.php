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
        //$movimiento->observaciones = '-D-';
        //$movimiento->save();
        $restar_salidas_otro_lote = 0;
        $actualizar_salidas_otro_lote = false;

        $response_estatus = false;
        $mensaje = '|-- Guardado con Éxito --|';
        $bitacora_modificaciones = [];

        $es_recepcion = false;

        $conteo_claves = 0;
        $conteo_articulos = 0;

        $movimiento->load('tipoMovimiento','listaArticulos.stock');

        $lista_articulos_original = [];
        for($i = 0; $i < count($movimiento->listaArticulos); $i++){
            $item = $movimiento->listaArticulos[$i];
            if(!isset($lista_articulos_original[$item->bien_servicio_id])){
                $lista_articulos_original[$item->bien_servicio_id] = [];
                $conteo_claves++;
            }
            $lista_articulos_original[$item->bien_servicio_id][$item->id.'-'.$item->stock_id] = [
                'id' => $item->id,
                'stock_id' => $item->stock_id,
                'encontrado' => false,
                'item' => $item,
            ];
        }

        for($i = 0; $i < count($lista_articulos); $i++){
            $articulo_id = $lista_articulos[$i]['id'];
            
            for($j = 0; $j < count($lista_articulos[$i]['lotes']); $j++){
                /***  Datos del lote recibido del cliente, lo datos nuevos que reemplazarán lo guardado en la base de datos  ***/
                $lote = $lista_articulos[$i]['lotes'][$j];

                /***  Si existe id, es un lote creado anteriomente, por lo tanto se validará si es necesario modificar  ***/
                if(isset($lote['id']) && $lote['id']){
                    /***  Si se encuentra dentro de los articulos guardados del movimiento, iniciar proceso de validación y modificación(id: movimiento_articulo->id, stock_id: movimiento_articulo->stock_id)  ***/
                    if(isset($lista_articulos_original[$articulo_id][$lote['id'].'-'.$lote['stock_id']])){
                        /***  Se marca el elemento para indicar que si existe en el request, por lo tanto no debe eliminarse, todos los lotes marcados con [encontrado = false], seran eliminados de la base de datos  ***/
                        $lista_articulos_original[$articulo_id][$lote['id'].'-'.$lote['stock_id']]['encontrado'] = true;
                        
                        //para determinar si hubo cambios, y ser deben modificar datos
                        $actualizar_datos = false;

                        //movimiento_articulo.stock
                        $movimiento_articulo_db = $lista_articulos_original[$articulo_id][$lote['id'].'-'.$lote['stock_id']]['item'];
                        /***  Datos originales del stock, para comparativas y calculos de existencias anteriores  ***/
                        $stock_original = [
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
                        foreach ($stock_original as $key => $value) {
                            if(isset($lote[$key]) && $stock_original[$key] != $lote[$key]){
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

                        /***  Si es necesario actualizar los datos, se procedera a validar la modificación  ***/
                        if($actualizar_datos){
                            //Agregar programa id al finalizar la modificacion en el cliente

                            /***  Se checa si ya existe algun otro stock con los datos que se actualizarán, en caso de ser asi se agregarian dicho stock las cantidades del movimiento actual  ***/
                            $otro_lote_guardado = Stock::where('almacen_id',$movimiento_articulo_db->stock->almacen_id)->where('bien_servicio_id',$movimiento_articulo_db->stock->bien_servicio_id)->where('id','!=',$movimiento_articulo_db->stock->id);
                            foreach ($stock_original as $key => $value) {
                                if(isset($lote[$key])){
                                    $otro_lote_guardado = $otro_lote_guardado->where($key,$lote[$key]);
                                }
                            }
                            $otro_lote_guardado = $otro_lote_guardado->first();

                            /******************************************************************************************************************************************************
                             * Inicio: Obtenemos el detalle del empaque, tanto el anterior como el nuevo, en caso de que se haya modificado ese dato                              *
                             *                                                                                                                                                    */
                            $piezas_x_empaque = 1;
                            $nuevo_piezas_x_empaque = 1;

                            $detalle_empaque = BienServicioEmpaqueDetalle::find($stock_original['empaque_detalle_id']);
                            if($detalle_empaque){
                                $piezas_x_empaque = $detalle_empaque->piezas_x_empaque;
                            }

                            if($lote['empaque_detalle_id'] != $stock_original['empaque_detalle_id']){
                                $detalle_empaque = BienServicioEmpaqueDetalle::find($lote['empaque_detalle_id']);
                                if($detalle_empaque){
                                    $nuevo_piezas_x_empaque = $detalle_empaque->piezas_x_empaque;
                                }
                            }else{
                                $nuevo_piezas_x_empaque = $piezas_x_empaque;
                            }
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
                            for($i  = 0; $i < count($suma_movimientos); $i++){
                                $suma = $suma_movimientos[$i];
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
                            /*                                                                                                                                                    *
                             * Fin: Sacamos un resumen de los movimientos de Entrada y Salida, excluyendo el movimiento de Entrada que se esta modificando                        *
                             ******************************************************************************************************************************************************/

                            //Se obtiene el modo de entrada del lote
                            if($lote['entrada_piezas']){
                                $modo_movimiento = 'UNI';
                            }else{
                                $modo_movimiento = 'NRM';
                            }

                            /***  Si no hay otro lote y no hay otras entradas, se puede modificar el lote sin problemas  ***/
                            if(!$otro_lote_guardado && $total_entradas_piezas == 0){
                                //$mensaje .= '|-- Editar Lote: '.$lote['lote'].' --|';
                                $movimiento_articulo_db->stock->update($lote); //Se actualizan datos: Lote, FechaCaducidad, CodigoBarras, Modelo, etc.
                            }else if(!$otro_lote_guardado && $total_entradas_piezas > 0){
                                /***  Si no hay otro lote y hay otras entradas, se creara un nuevo lote(stock) con los datos a modificar  ***/
                                $nuevo_lote = [
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
                                $otro_lote_guardado = Stock::create($nuevo_lote);
                            }

                            //No tiene ningun movimiento extra capturado (Entrada o Salida)
                            if($total_entradas_piezas == 0 && $total_salidas_piezas == 0){
                                if($otro_lote_guardado){ //Si es otro lote y no hay movimientos de entrada o salida, simplemente dejar en 0
                                    $movimiento_articulo_db->stock->update(['existencia'=>0,'existencia_piezas'=>0]); //Se deja en 0, ya que la entrada no era para este lote
                                }else if($lote['cantidad'] != $stock_original['cantidad'] || $lote['empaque_detalle_id'] != $stock_original['empaque_detalle_id']){ 
                                    //Actualizamos las existencias en caso de que se haya editado la cantidad de entrada o el detalle del empaque
                                    if($modo_movimiento == 'UNI'){
                                        $movimiento_articulo_db->stock->existencia = floor($lote['cantidad'] / $nuevo_piezas_x_empaque);
                                        $movimiento_articulo_db->stock->existencia_piezas = $lote['cantidad'];
                                    }else{
                                        $movimiento_articulo_db->stock->existencia = $lote['cantidad'];
                                        $movimiento_articulo_db->stock->existencia_piezas = ($lote['cantidad'] * $nuevo_piezas_x_empaque);
                                    }
                                    $movimiento_articulo_db->stock->save();
                                    
                                    $mensaje .= '|-- Editar Existencias Lote: '.$lote['lote'].' --|';

                                    $movimiento_articulo_db->stock->load(['resguardoDetalle'=>function($resguardoDetalle){
                                        $resguardoDetalle->where('son_piezas','!=',1)->where('cantidad_restante','>',0);
                                    }]);
                                    $cantidades_restantes = $movimiento_articulo_db->stock->existencia_piezas;
                                    foreach ($movimiento_articulo_db->stock->resguardoDetalle as $resguardo){
                                        $resguardo->cantidad_restante = $resguardo->cantidad_resguardada * $nuevo_piezas_x_empaque;
                                        $cantidades_restantes -= $resguardo->cantidad_restante;
                                        if($cantidades_restantes < 0){
                                            $resguardo->cantidad_restante += $cantidades_restantes;
                                            $cantidades_restantes = 0;
                                        }
                                        $resguardo->save();
                                    }
                                }
                            }else if($total_entradas_piezas == 0 && $total_salidas_piezas > 0){
                                //Solo Tiene salidas
                                if($otro_lote_guardado){ //Si es otro lote y no hay otros movimientos de entrada, simplemente dejar en 0 y sumar a la existencia del otro lote
                                    $movimiento_articulo_db->stock->update(['existencia'=>0,'existencia_piezas'=>0]); //Se deja en 0, ya que la entrada no era para este lote
                                    $restar_salidas_otro_lote = $total_salidas_piezas;
                                    $actualizar_salidas_otro_lote = true; //Mover las salidas capturadas de este stock al otro
                                }else if($lote['cantidad'] != $stock_original['cantidad'] || $lote['empaque_detalle_id'] != $stock_original['empaque_detalle_id']){
                                    //Actualizamos las existencias en caso de que se haya editado la cantidad de entrada o el detalle del empaque

                                    if($modo_movimiento == 'UNI'){
                                        $total_entradas_piezas += $lote['cantidad'];
                                    }else{
                                        $total_entradas_piezas += ($lote['cantidad'] * $nuevo_piezas_x_empaque);
                                    }

                                    $existencias_piezas = $total_entradas_piezas - $total_salidas_piezas;
                                    $existencias = floor($existencias_piezas / $nuevo_piezas_x_empaque);

                                    if($existencias_piezas < 0){ //Checar si las exitencias son negativas
                                        $response_estatus = false;
                                        $mensaje = 'La existencias del Lote: '.$lote['lote'].' alcanzan valores negativos.';
                                        break 2;
                                    }

                                    $movimiento_articulo_db->stock->existencia = $existencias;
                                    $movimiento_articulo_db->stock->existencia_piezas = $existencias_piezas;
                                    $movimiento_articulo_db->stock->save();
                                    
                                    $mensaje .= '|-- Editar Existencias Lote(Solo Salidas): '.$lote['lote'].' --|';

                                    $movimiento_articulo_db->stock->load(['resguardoDetalle'=>function($resguardoDetalle){
                                        $resguardoDetalle->where('son_piezas','!=',1)->where('cantidad_restante','>',0);
                                    }]);
                                    $cantidades_restantes = $movimiento_articulo_db->stock->existencia_piezas;
                                    foreach ($movimiento_articulo_db->stock->resguardoDetalle as $resguardo){
                                        $resguardo->cantidad_restante = $resguardo->cantidad_resguardada * $nuevo_piezas_x_empaque;
                                        $cantidades_restantes -= $resguardo->cantidad_restante;
                                        if($cantidades_restantes < 0){
                                            $resguardo->cantidad_restante += $cantidades_restantes;
                                            $cantidades_restantes = 0;
                                        }
                                        $resguardo->save();
                                    }
                                }
                            }else if($total_entradas_piezas > 0){ //&& $total_salidas_piezas >/== 0
                                //Solo Tiene Otras Entradas
                                if($modo_movimiento == 'UNI'){ //Recalcular la entrada con datos de cantidades anteriores
                                    $existencias = floor($stock_original['cantidad'] / $piezas_x_empaque);
                                    $existencias_piezas = $stock_original['cantidad'];
                                }else{
                                    $existencias = $stock_original['cantidad'];
                                    $existencias_piezas = ($stock_original['cantidad'] * $piezas_x_empaque);
                                }

                                $diferencia_movimientos = $total_entradas_piezas - $total_salidas_piezas;
                                if($diferencia_movimientos < 0){
                                    //Hay mas salidas que entradas, quiere decir que algunas salidas de este movimiento pertenecen al lote a modificar
                                    $response_estatus = false;
                                    $mensaje = 'La existencias del Lote: '.$lote['lote'].' alcanzan valores negativos.';
                                    break 2;
                                }

                                if($otro_lote_guardado){ //Si es otro lote y no hay movimientos de salida, simplemente restar la entrada de las existencias y sumar a la existencia del otro lote
                                    //Se restan la entrada, con las cantidades anteriores
                                    $movimiento_articulo_db->stock->existencia -= $existencias;
                                    $movimiento_articulo_db->stock->existencia_piezas -= $existencias_piezas;
                                    $movimiento_articulo_db->stock->save();
                                }else if($lote['cantidad'] != $stock_original['cantidad'] || $lote['empaque_detalle_id'] != $stock_original['empaque_detalle_id']){
                                    //Si se cambio cantidad o detalle del empaque, se debe recalcular para modificar las existencias, junto a las otras entradas
                                    if($modo_movimiento == 'UNI'){ //Recalcular existencias con datos de empaque cantidades nuevos/actuales
                                        $nuevas_existencias = floor($lote['cantidad'] / $nuevo_piezas_x_empaque);
                                        $nuevas_existencias_piezas = $lote['cantidad'];
                                    }else{
                                        $nuevas_existencias = $lote['cantidad'];
                                        $nuevas_existencias_piezas = ($lote['cantidad'] * $nuevo_piezas_x_empaque);
                                    }
                                    //Se quitan existencias anteriores y se sumas las nuevas
                                    $movimiento_articulo_db->stock->existencia -= $existencias;
                                    $movimiento_articulo_db->stock->existencia_piezas -= $existencias_piezas;
                                    $movimiento_articulo_db->stock->existencia += $nuevas_existencias;
                                    $movimiento_articulo_db->stock->existencia_piezas += $nuevas_existencias_piezas;
                                    $movimiento_articulo_db->stock->save();
                                }
                            }

                            if($otro_lote_guardado){ //Si es otro lote
                                //Agregamos nueva existencias
                                if($modo_movimiento == 'UNI'){
                                    $existencias = floor($lote['cantidad'] / $nuevo_piezas_x_empaque);
                                    $existencias_piezas = $lote['cantidad'];
                                }else{
                                    $existencias = $lote['cantidad'];
                                    $existencias_piezas = ($lote['cantidad'] * $nuevo_piezas_x_empaque);
                                }

                                if($actualizar_salidas_otro_lote && $restar_salidas_otro_lote > 0){ //Si hay, se restan las salidas capturadas del lote
                                    $existencias_piezas -= $restar_salidas_otro_lote;
                                    $existencias = floor($existencias_piezas / $nuevo_piezas_x_empaque);
                                    $restar_salidas_otro_lote = 0;
                                }

                                if($existencias_piezas < 0){ //Checar si las exitencias son negativas
                                    $response_estatus = false;
                                    $mensaje = 'La existencias del Lote: '.$lote['lote'].' alcanzan valores negativos.';
                                    break 2;
                                }

                                $otro_lote_guardado->existencia += $existencias;
                                $otro_lote_guardado->existencia_piezas += $existencias_piezas;
                                $otro_lote_guardado->save();

                                //Si el lote anterior tenia salidas capturadas, agregar estas salidas al otro lote
                                if($actualizar_salidas_otro_lote){
                                    MovimientoArticulo::where('direccion_movimiento','SAL')->where('bien_servicio_id',$articulo_id)->where('stock_id',$movimiento_articulo_db->stock_id)->update(['stock_id'=>$otro_lote_guardado->id]);
                                    $actualizar_salidas_otro_lote = false;
                                }

                                //Modificamos la referencia al stock
                                $movimiento_articulo_db->stock_id = $otro_lote_guardado->id;

                                $mensaje .= '|-- Lote Editado OTRO: '.$otro_lote_guardado->lote.' --|';
                            }

                            //Actualizamos los datos en el articulo del movimiento
                            $movimiento_articulo_db->cantidad = $lote['cantidad'];
                            $movimiento_articulo_db->modo_movimiento = $modo_movimiento;
                            $movimiento_articulo_db->precio_unitario = $lote['precio_unitario'];
                            $movimiento_articulo_db->iva = $lote['iva'];
                            $movimiento_articulo_db->save();
                        }
                    }else{
                        //No se encontro, debería estar
                        $response_estatus = false;
                        $mensaje .= '|-- No se encontró: '.$lote['lote'].' --|';
                        break 2;
                    }
                }else{
                    //Es nuevo, hay que crear
                    $mensaje .= '|-- Nuevo Lote --|';
                }
            }
        }

        return ['estatus'=>$response_estatus, 'mensaje'=>$mensaje, 'data'=>$lista_articulos_original];
    }
}