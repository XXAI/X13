<?php

namespace App\Http\Controllers\API\Modulos;

use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use Illuminate\Validation\Rule;

use App\Http\Controllers\Controller;

use App\Http\Requests;

use Carbon\Carbon;
use Validator;
use DB;
use DateTime;

use App\Models\Movimiento;
use App\Models\Stock;
use App\Models\CartaCanje;
use App\Models\BienServicio;
use App\Models\TipoMovimiento;
use App\Models\UnidadMedica;
use App\Models\Paciente;
use App\Models\PersonalMedico;
use App\Models\Solicitud;
use App\Models\TipoSolicitud;
use App\Models\Almacen;

class AlmacenSalidaController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        try{
            $loggedUser = auth()->userOrFail();
            $parametros = $request->all();

            if($loggedUser->is_superuser){
                $almacenes = Almacen::where('unidad_medica_id',$loggedUser->unidad_medica_asignada_id)->get()->pluck('id');
            }else{
                $almacenes = $loggedUser->almacenes()->pluck('almacen_id');
            }

            $salidas = Movimiento::select('movimientos.*','almacenes.nombre as almacen','programas.descripcion as programa','catalogo_unidades_medicas.nombre_corto as unidad_medica_movimiento',
                                        'catalogo_tipos_movimiento.descripcion as tipo_movimiento','almacen_destino.nombre as almacen_destino','unidad_destino.nombre as unidad_destino','unidad_medica_turnos.nombre as turno',
                                        'area_servicio.descripcion as area_servicio_destino','tipo_solicitud.descripcion as tipo_solicitud','solicitudes.porcentaje_articulos_surtidos as porcentaje_surtido',
                                        'eliminado_por.username as eliminado_por',
                                        'cancelado_por.username as cancelado_por',
                                        'concluido_por.username as concluido_por',
                                        'modificado_por.username as modificado_por')
                                    ->leftJoin('unidad_medica_turnos','unidad_medica_turnos.id','=','movimientos.turno_id')
                                    ->leftJoin('almacenes','almacenes.id','=','movimientos.almacen_id')
                                    ->leftJoin('almacenes as almacen_destino','almacen_destino.id','=','movimientos.almacen_movimiento_id')
                                    ->leftJoin('catalogo_unidades_medicas as unidad_destino','unidad_destino.id','=','movimientos.unidad_medica_movimiento_id')
                                    ->leftJoin('catalogo_areas_servicios as area_servicio','area_servicio.id','=','movimientos.area_servicio_movimiento_id')
                                    ->leftJoin('programas','programas.id','=','movimientos.programa_id')
                                    ->leftJoin('catalogo_unidades_medicas','catalogo_unidades_medicas.id','=','movimientos.unidad_medica_movimiento_id')
                                    ->leftJoin('catalogo_tipos_movimiento','catalogo_tipos_movimiento.id','=','movimientos.tipo_movimiento_id')
                                    ->leftJoin('solicitudes','solicitudes.id','=','movimientos.solicitud_id')
                                    ->leftJoin('catalogo_tipos_solicitud as tipo_solicitud','tipo_solicitud.id','=','solicitudes.tipo_solicitud_id')
                                    ->leftJoin('users as eliminado_por','eliminado_por.id','=','movimientos.eliminado_por_usuario_id')
                                    ->leftJoin('users as cancelado_por','cancelado_por.id','=','movimientos.cancelado_por_usuario_id')
                                    ->leftJoin('users as concluido_por','concluido_por.id','=','movimientos.concluido_por_usuario_id')
                                    ->leftJoin('users as modificado_por','modificado_por.id','=','movimientos.modificado_por_usuario_id')
                                    ->where('movimientos.direccion_movimiento','SAL')
                                    ->where('movimientos.unidad_medica_id',$loggedUser->unidad_medica_asignada_id)
                                    ->whereIn('movimientos.almacen_id',$almacenes)
                                    ->orderBy('updated_at','DESC')
                                    ->with(['modificacionActiva'=>function($modificacionActiva){
                                        $modificacionActiva->with('solicitadoUsuario','aprobadoUsuario');
                                    }]);
            
            //Filtros, busquedas, ordenamiento
            if(isset($parametros['query']) && $parametros['query']){
                $salidas = $salidas->where(function($query)use($parametros){
                    return $query->where('movimientos.folio','LIKE','%'.$parametros['query'].'%')
                                ->orWhere('almacenes.nombre','LIKE','%'.$parametros['query'].'%')
                                ->orWhere('programas.descripcion','LIKE','%'.$parametros['query'].'%')
                                ->orWhere('catalogo_unidades_medicas.nombre','LIKE','%'.$parametros['query'].'%')
                                ->orWhere('catalogo_tipos_movimiento.descripcion','LIKE','%'.$parametros['query'].'%')
                                ->orWhere('movimientos.documento_folio','LIKE','%'.$parametros['query'].'%')
                                ;
                });
            }

            if(isset($parametros['almacen_id']) && $parametros['almacen_id']){
                $salidas = $salidas->where('movimientos.almacen_id',$parametros['almacen_id']);
            }

            if(isset($parametros['tipo_movimiento_id']) && $parametros['tipo_movimiento_id']){
                $salidas = $salidas->where('movimientos.tipo_movimiento_id',$parametros['tipo_movimiento_id']);
            }

            if(isset($parametros['estatus']) && $parametros['estatus']){
                if($parametros['estatus'] == 'SOL' || $parametros['estatus'] == 'MOD'){
                    $salidas = $salidas->whereHas('modificacionActiva',function($query)use($parametros){
                        $query->where('estatus',$parametros['estatus']);
                    });
                }else{
                    $salidas = $salidas->where('movimientos.estatus',$parametros['estatus'])->doesntHave('modificacionActiva');
                }
            }

            if(isset($parametros['fecha_inicio']) && $parametros['fecha_inicio']){
                $salidas = $salidas->where('movimientos.fecha_movimiento','>=',$parametros['fecha_inicio'])
                                    ->where('movimientos.fecha_movimiento','<=',$parametros['fecha_fin']);
            }
            
            if(isset($parametros['page'])){
                $resultadosPorPagina = isset($parametros["per_page"])? $parametros["per_page"] : 20;
                $salidas = $salidas->paginate($resultadosPorPagina);

            } else {
                $salidas = $salidas->get();
            }

            return response()->json(['data'=>$salidas],HttpResponse::HTTP_OK);
        }catch(\Exception $e){
            return response()->json(['error'=>['message'=>$e->getMessage(),'line'=>$e->getLine()]], HttpResponse::HTTP_CONFLICT);
        }
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id){
        try{
            $loggedUser = auth()->userOrFail();
            $movimiento = Movimiento::with('unidadMedica','unidadMedicaMovimiento','almacenMovimiento','areaServicioMovimiento','programa','turno','paciente','personalMedico','tipoMovimiento')->find($id);
            $extras = [];

            if($movimiento->estatus != 'BOR'){
                $solicitud_id = $movimiento->solicitud_id;
                $movimiento->load(['listaArticulos' => function($listaArticulos)use($loggedUser,$solicitud_id){ 
                                        return $listaArticulos->select('movimientos_articulos.*','solicitudes_articulos.cantidad_solicitada as cantidad_solicitado')
                                                            ->leftjoin('solicitudes_articulos',function($join)use($solicitud_id){
                                                                return $join->on('solicitudes_articulos.bien_servicio_id','=','movimientos_articulos.bien_servicio_id')
                                                                            ->where('solicitudes_articulos.solicitud_id',$solicitud_id);
                                                            })
                                                            ->with([
                                                                'articulo'=>function($articulos)use($loggedUser){
                                                                    return $articulos->datosDescripcion($loggedUser->unidad_medica_asignada_id);
                                                                },'stock'=>function($stock){
                                                                    return $stock->with('marca','programa','empaqueDetalle')->withTrashed();
                                                                }
                                                            ]);
                                    },'movimientoHijo' => function($movimientoHijo){
                                        return $movimientoHijo->with('almacen','tipoMovimiento','concluidoPor','modificadoPor');
                                    },'solicitud'=> function($solicitud){
                                        return $solicitud->with('tipoSolicitud','tipoUso');
                                    },'modificacionActiva'=>function($modificacionActiva){
                                        $modificacionActiva->with('solicitadoUsuario','aprobadoUsuario');
                                    },'almacen.tiposMovimiento','creadoPor','modificadoPor','concluidoPor','canceladoPor','eliminadoPor']);
            }else{
                $almacen_id = $movimiento->almacen_id;
                $programa_id = $movimiento->programa_id;
                $movimiento_id = $movimiento->id;

                $movimiento->load('listaArticulosBorrador','almacen.tiposMovimiento','creadoPor','modificadoPor');
                $articulos_ids = $movimiento->listaArticulosBorrador()->pluck('bien_servicio_id');

                $articulos_borrador = BienServicio::datosDescripcion()//->whereIn('bienes_servicios.id',$articulos_ids)
                                                    ->select('bienes_servicios.*','cog_partidas_especificas.descripcion AS partida_especifica','familias.nombre AS familia','catalogo_unidades_medida.descripcion as unidad_medida',
                                                    'unidad_medica_catalogo_articulos.es_normativo','unidad_medica_catalogo_articulos.cantidad_minima','unidad_medica_catalogo_articulos.cantidad_maxima',
                                                    'unidad_medica_catalogo_articulos.id AS en_catalogo_unidad','catalogo_tipos_bien_servicio.descripcion AS tipo_bien_servicio','catalogo_tipos_bien_servicio.clave_form',
                                                    'movimientos_articulos_borrador.cantidad_solicitado','movimientos_articulos_borrador.modo_movimiento')
                                                    ->join('movimientos_articulos_borrador',function($borrador)use($movimiento_id){
                                                        $borrador->on('movimientos_articulos_borrador.bien_servicio_id','bienes_servicios.id')
                                                                ->where('movimientos_articulos_borrador.movimiento_id',$movimiento_id);
                                                    })
                                                    ->with(['stocks'=>function($stocks)use($almacen_id,$programa_id,$movimiento_id){
                                                        $stocks = $stocks->select('stocks.*','movimientos_articulos_borrador.cantidad') //,'movimientos_articulos_borrador.cantidad_solicitado'
                                                                ->where('almacen_id',$almacen_id)
                                                                ->orderBy('stocks.fecha_caducidad','ASC')
                                                                ->leftjoin('movimientos_articulos_borrador',function($join)use($movimiento_id){
                                                                    $join->on('movimientos_articulos_borrador.stock_id','stocks.id')
                                                                        ->on('movimientos_articulos_borrador.bien_servicio_id','stocks.bien_servicio_id')
                                                                        ->where('movimientos_articulos_borrador.movimiento_id',$movimiento_id);
                                                                })
                                                                ->where('stocks.existencia','>',0)
                                                                ->with('marca','programa','empaqueDetalle');
                                                        if($programa_id){
                                                            $stocks = $stocks->where('programa_id',$programa_id);
                                                        }
                                                        return $stocks;
                                                    }])
                                                    ->groupBy('movimientos_articulos_borrador.bien_servicio_id')
                                                    ->get();
                //
                $movimiento = $movimiento->toArray();
                $movimiento['lista_articulos_borrador'] = $articulos_borrador;
                //$extras['articulos_borrador'] = $articulos_borrador;
                //$extras['cantidades_stocks'] = $cantidades_stocks;
            }
            return response()->json(['data'=>$movimiento],HttpResponse::HTTP_OK);
        }catch(\Exception $e){
            return response()->json(['error'=>['message'=>$e->getMessage(),'line'=>$e->getLine()]], HttpResponse::HTTP_CONFLICT);
        }
    }

    /**
     * Create the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request){
        try{
            $parametros = $request->all();
            $loggedUser = auth()->userOrFail();

            $mensajes = [
                'required'      => "required",
                'email'         => "email",
                'unique'        => "unique",
            ];
    
            $reglas = [
                'almacen_id' => 'required',
                'fecha_movimiento' => 'required',
                'tipo_movimiento_id' => 'required',
            ];

            DB::beginTransaction();

            $v = Validator::make($parametros, $reglas, $mensajes);

            if ($v->fails()){
                DB::rollback();
                return response()->json(['error'=>"Hacen falta campos obligatorios"],HttpResponse::HTTP_OK);
                //throw new \Exception("Hacen falta campos obligatorios", 1);
            }

            $concluir = $parametros['concluir'];

            $datos_movimiento = [
                'unidad_medica_id' => $loggedUser->unidad_medica_asignada_id,
                'almacen_id' => $parametros['almacen_id'],
                'direccion_movimiento' => 'SAL',
                'tipo_movimiento_id' => $parametros['tipo_movimiento_id'],
                'turno_id' => $parametros['turno_id'],
                'estatus' => ($concluir)?'FIN':'BOR',
                'fecha_movimiento' => $parametros['fecha_movimiento'],
                'programa_id' => (isset($parametros['programa_id']) && $parametros['programa_id'])?$parametros['programa_id']:null,
                'unidad_medica_movimiento_id' => (isset($parametros['unidad_medica_movimiento_id']) && $parametros['unidad_medica_movimiento_id'])?$parametros['unidad_medica_movimiento_id']:null,
                'almacen_movimiento_id' => (isset($parametros['almacen_movimiento_id']) && $parametros['almacen_movimiento_id'])?$parametros['almacen_movimiento_id']:null,
                'area_servicio_movimiento_id' => (isset($parametros['area_servicio_movimiento_id']) && $parametros['area_servicio_movimiento_id'])?$parametros['area_servicio_movimiento_id']:null,
                'solicitud_tipo_uso_id' =>  (isset($parametros['solicitud_tipo_uso_id']) && $parametros['solicitud_tipo_uso_id'])?$parametros['solicitud_tipo_uso_id']:null,
                'descripcion' => 'Salida Manual Enviado a Unidad Medica',
                'documento_folio' => $parametros['documento_folio'],
                'observaciones' => $parametros['observaciones'],
                'es_colectivo' => (isset($parametros['es_colectivo']) && $parametros['es_colectivo'])?$parametros['es_colectivo']:null,
                'personal_medico_id' => null,
                'paciente_id' => null,
                'total_claves' => 0,
                'total_articulos' => 0,
            ];

            $consecutivo = 0;
            $folio = '';

            $tipo_movimiento = TipoMovimiento::find($parametros['tipo_movimiento_id']);
            if($concluir){
                //Generar Folio
                $unidad_medica = UnidadMedica::find($loggedUser->unidad_medica_asignada_id);
                $fecha = DateTime::createFromFormat("Y-m-d", $parametros['fecha_movimiento']);

                $consecutivo = Movimiento::where('unidad_medica_id',$loggedUser->unidad_medica_asignada_id)->where('almacen_id',$parametros['almacen_id'])
                                            ->where('direccion_movimiento',$tipo_movimiento->movimiento)->where('tipo_movimiento_id',$parametros['tipo_movimiento_id'])->max('consecutivo');
                if($consecutivo){
                    $consecutivo++;
                }else{
                    $consecutivo = 1;
                }

                $folio = $unidad_medica->clues . '-' . $fecha->format('Y') . '-' . $fecha->format('m') . '-' . $tipo_movimiento->movimiento . '-' . $tipo_movimiento->clave . '-' . str_pad($consecutivo,4,'0',STR_PAD_LEFT);
            }

            if($tipo_movimiento->clave == 'RCTA' || $tipo_movimiento->clave == 'PSNL'){
                if(isset($parametros['personal_medico']) && $parametros['personal_medico']){
                    $personal_medico = $parametros['personal_medico'];
                    if(isset($personal_medico['clave']) && $personal_medico['clave'] == 'NEW'){
                        $nuevo_personal= PersonalMedico::create([
                            'unidad_medica_id' => $loggedUser->unidad_medica_asignada_id,
                            'nombre_completo' => $personal_medico['nombre_completo'],
                            'puede_recetar' => ($tipo_movimiento->clave == 'RCTA')?true:false,
                        ]);
                        $parametros['personal_medico_id'] = $nuevo_personal->id;
                        $datos_movimiento['personal_medico_id'] = $nuevo_personal->id;
                    }else{
                        $parametros['personal_medico_id'] = $personal_medico['id'];
                        $datos_movimiento['personal_medico_id'] = $personal_medico['id'];
                    }
                }
            }

            if($tipo_movimiento->clave == 'RCTA'){
                $parametros['expediente_clinico']   = trim($parametros['expediente_clinico']);
                $paciente = Paciente::where('expediente_clinico',$parametros['expediente_clinico'])->first();
                
                if(!$paciente){
                    $paciente = Paciente::create([
                        'expediente_clinico'=>$parametros['expediente_clinico'],
                        'nombre_completo'=>strtoupper($parametros['paciente']),
                        'curp'=>strtoupper($parametros['curp'])
                    ]);
                }
                $datos_movimiento['paciente_id'] = $paciente->id;
                $datos_movimiento['personal_medico_id'] = $parametros['personal_medico_id'];
            }

            if(isset($parametros['id']) && $parametros['id']){
                $movimiento = Movimiento::with('listaArticulos','listaArticulosBorrador')->find($parametros['id']);
                if($concluir){
                    if(!$movimiento->folio){
                        $datos_movimiento['consecutivo'] = $consecutivo;
                        $datos_movimiento['folio'] = $folio;
                    }
                    $datos_movimiento['concluido_por_usuario_id'] = $loggedUser->id;
                }else{
                    $datos_movimiento['modificado_por_usuario_id'] = $loggedUser->id;
                }
                $movimiento->update($datos_movimiento);
            }else{
                if($concluir){
                    $datos_movimiento['consecutivo'] = $consecutivo;
                    $datos_movimiento['folio'] = $folio;
                    $datos_movimiento['concluido_por_usuario_id'] = $loggedUser->id;
                }
                $datos_movimiento['creado_por_usuario_id'] = $loggedUser->id;
                $datos_movimiento['modificado_por_usuario_id'] = $loggedUser->id;
                $movimiento = Movimiento::create($datos_movimiento);
            }

            $conteo_claves = count($parametros['lista_articulos']);
            $total_claves = $conteo_claves;
            $total_articulos = 0;

            if(!$concluir){
                $lista_articulos_borrador = [];

                for ($i=0; $i < $conteo_claves ; $i++) { 
                    $articulo = $parametros['lista_articulos'][$i];
                    $total_articulos += $articulo['total_piezas'];
                    $modo_movimiento = ($parametros['lista_articulos'][$i]['surtir_en_unidades'])?'UNI':'NRM';
                    
                    if($articulo['total_piezas'] > 0){
                        for($j=0; $j < count($articulo['lotes']); $j++){
                            $lote = $articulo['lotes'][$j];

                            if($lote['salida']){
                                $lista_articulos_borrador[] = [
                                    'bien_servicio_id' => $articulo['id'],
                                    'stock_id' => $lote['id'],
                                    'direccion_movimiento' => 'SAL',
                                    'modo_movimiento' => $modo_movimiento,
                                    'cantidad_solicitado' => (isset($articulo['cantidad_solicitado']))?$articulo['cantidad_solicitado']:null,
                                    'cantidad' => $lote['salida'],
                                    'user_id' => $loggedUser->id,
                                ];
                            }
                        }
                    }else if($tipo_movimiento->acepta_ceros){
                        $lista_articulos_borrador[] = [
                            'bien_servicio_id' => $articulo['id'],
                            'direccion_movimiento' => 'SAL',
                            'modo_movimiento' => $modo_movimiento,
                            'cantidad_solicitado' => (isset($articulo['cantidad_solicitado']))?$articulo['cantidad_solicitado']:null,
                            'cantidad' => 0,
                            'user_id' => $loggedUser->id,
                        ];
                    }else{
                        $total_claves -= 1;
                    }
                }

                $movimiento->listaArticulosBorrador()->delete();
                $movimiento->listaArticulosBorrador()->createMany($lista_articulos_borrador);
            }else{
                //SI es concluir
                $lista_articulos_agregar = [];
                $lista_articulos_eliminar = [];

                $lista_articulos_guardados_raw = $movimiento->listaArticulos;
                $lista_articulos_guardados = [];
                for ($i=0; $i < count($lista_articulos_guardados_raw); $i++) { 
                    $articulo_guardado = $lista_articulos_guardados_raw[$i];
                    $lista_articulos_guardados[$articulo_guardado->bien_servicio_id.'-'.$articulo_guardado->stock_id] = $articulo_guardado;
                }

                for ($i=0; $i < $conteo_claves ; $i++) { 
                    $articulo = $parametros['lista_articulos'][$i];
                    $datos_articulo = BienServicio::find($articulo['id']);

                    if(!$datos_articulo){
                        DB::rollback();
                        return response()->json(['error'=>"No se encontro el articulo: ".$articulo['clave']],HttpResponse::HTTP_OK);
                        //throw new \Exception("No se encontro el articulo: ".$articulo['id'], 1);
                    }

                    $total_articulos += $articulo['total_piezas'];
                    //$total_monto += $articulo['total_monto'];
                    $modo_movimiento = ($parametros['lista_articulos'][$i]['surtir_en_unidades'])?'UNI':'NRM';

                    if($articulo['total_piezas'] > 0){
                        $articulos_lotes = $articulo['lotes'];
                        for($j=0; $j < count($articulos_lotes); $j++){
                            $lote = $articulos_lotes[$j];

                            if($lote['salida']){
                                $lote_guardado = Stock::with('empaqueDetalle')->where('id',$lote['id'])->first();
                                
                                if(!$lote_guardado){
                                    DB::rollback();
                                    return response()->json(['error'=>"No se encontro un lote para el medicamento: ".$articulo['clave']],HttpResponse::HTTP_OK);
                                    //throw new \Exception("No se encontro un lote para el medicamento: ".$articulo['clave'], 1);
                                }

                                if($lote_guardado->empaqueDetalle){
                                    $piezas_x_empaque = $lote_guardado->empaqueDetalle->piezas_x_empaque;
                                }else{
                                    $piezas_x_empaque = 1;
                                }

                                $cantidad_anterior = ($modo_movimiento == 'UNI')?$lote_guardado->existencia_unidades:$lote_guardado->existencia;
                                if($cantidad_anterior >= $lote['salida']){
                                    if($modo_movimiento == 'UNI'){
                                        $lote_guardado->existencia_unidades -= $lote['salida'];
                                        $lote_guardado->existencia = floor($lote_guardado->existencia_unidades / $piezas_x_empaque);
                                    }else{
                                        $lote_guardado->existencia -= $lote['salida'];
                                        if($datos_articulo->puede_surtir_unidades){
                                            $lote_guardado->existencia_unidades -= ($lote['salida'] * $piezas_x_empaque);
                                        }
                                    }
                                    $lote_guardado->user_id = $loggedUser->id;
                                    $lote_guardado->save();
                                }else{
                                    DB::rollback();
                                    return response()->json(['error'=>"Existencias insuficientes para el medicamento: ".$articulo['clave']],HttpResponse::HTTP_OK);
                                    //throw new \Exception("Existencias insuficientes para el medicamento: ".$articulo['clave'], 1);
                                }

                                if(isset($lista_articulos_guardados[$articulo['id'].'-'.$lote_guardado->id])){
                                    $articulo_guardado = $lista_articulos_guardados[$articulo['id'].'-'.$lote_guardado->id];
                                    $articulo_guardado->stock_id = $lote_guardado->id;
                                    $articulo_guardado->bien_servicio_id = $articulo['id'];
                                    $articulo_guardado->direccion_movimiento = 'SAL';
                                    $articulo_guardado->modo_movimiento = $modo_movimiento;
                                    $articulo_guardado->cantidad = $lote['salida'];
                                    $articulo_guardado->cantidad_anterior = $cantidad_anterior;
                                    $articulo_guardado->user_id = $loggedUser->id;
                                    $articulo_guardado->save();

                                    $lista_articulos_guardados[$articulo['id'].'-'.$lote_guardado->id] = NULL;
                                }else{
                                    $lista_articulos_agregar[] = [
                                        'stock_id' => $lote_guardado->id,
                                        'bien_servicio_id' => $articulo['id'],
                                        'direccion_movimiento' => 'SAL',
                                        'modo_movimiento' => $modo_movimiento,
                                        'cantidad' => $lote['salida'],
                                        'cantidad_anterior' => $cantidad_anterior,
                                        'user_id' => $loggedUser->id,
                                    ];
                                }
                            }
                        }
                    }else if($tipo_movimiento->acepta_ceros){
                        $cantidad_anterior = 0;
                        $lista_articulos_agregar[] = [
                            'bien_servicio_id' => $articulo['id'],
                            'direccion_movimiento' => 'SAL',
                            'modo_movimiento' => $modo_movimiento,
                            'cantidad' => 0,
                            'cantidad_anterior' => $cantidad_anterior,
                            'user_id' => $loggedUser->id,
                        ];
                    }else{
                        $total_claves -= 1;
                    }
                }

                if($total_claves <= 0){
                    DB::rollback();
                    return response()->json(['error'=>'No se encontraron claves asignadas al movimiento'],HttpResponse::HTTP_OK);
                }

                for ($i=0; $i < count($lista_articulos_guardados); $i++) { 
                    $articulo_guardado = $lista_articulos_guardados[$articulo['id'].'-'.$lote_guardado->id];
                    if($articulo_guardado){
                        $lista_articulos_eliminar[] = $articulo_guardado->id;
                    }
                }

                if(count($lista_articulos_eliminar)){
                    $movimiento->listaArticulos()->whereIn('id',$lista_articulos_eliminar)->delete();
                }

                if(count($lista_articulos_agregar)){
                    $movimiento->listaArticulos()->createMany($lista_articulos_agregar);
                }

                $movimiento->listaArticulosBorrador()->delete();
            }

            $movimiento->total_claves = $total_claves;
            $movimiento->total_articulos = $total_articulos;
            $movimiento->save();

            if($tipo_movimiento->clave == 'LMCN' && $concluir){ //si es movimiento de Traspado entre almacenes
                //Se debe crear un movimiento de entrada en el almacen al que se mando
                $movimiento->update(['estatus'=>'PERE']);
                $tipo_movimiento_recepcion = TipoMovimiento::where('clave','RCPCN')->first();

                if(!$tipo_movimiento_recepcion){
                    DB::rollback();
                    return response()->json(['error'=>"No se encontro el tipo de movimiento: Recepción"],HttpResponse::HTTP_OK);
                    //throw new \Exception("No se encontro el tipo de movimiento: Recepción", 1);
                }

                $datos_movimiento_entrada = [
                    'unidad_medica_id' => $loggedUser->unidad_medica_asignada_id,
                    'almacen_id' => $movimiento->almacen_movimiento_id,
                    'almacen_movimiento_id' => $movimiento->almacen_id,
                    'direccion_movimiento' => 'ENT',
                    'tipo_movimiento_id' => $tipo_movimiento_recepcion->id,
                    'estatus' => 'PERE',
                    'fecha_movimiento' => $movimiento->fecha_movimiento,
                    'turno_id' => $movimiento->turno_id,
                    'programa_id' => $movimiento->programa_id,
                    'descripcion' => 'Recepción Generada Automaticamente por un Traspaso entre Almacenes',
                    'documento_folio' => ($movimiento->es_colectivo)?$movimiento->documento_folio:$movimiento->folio,
                    'es_colectivo' => $movimiento->es_colectivo,
                    'total_claves' => $movimiento->total_claves,
                    'total_articulos' => $movimiento->total_articulos,
                    'creado_por_usuario_id' => $loggedUser->id,
                    'movimiento_padre_id' => $movimiento->id,
                ];
                $movimiento_entrada = Movimiento::create($datos_movimiento_entrada);
            }

            if(($movimiento->es_colectivo || $tipo_movimiento->clave == 'RCTA') && $concluir){
                if($tipo_movimiento->clave == 'RCTA'){
                    $tipo_solicitud = TipoSolicitud::where('clave','RCTA')->first();
                }else{
                    $tipo_solicitud = TipoSolicitud::where('clave','CTVO')->first();
                }
                
                if(!$tipo_solicitud){
                    DB::rollback();
                    return response()->json(['error'=>"No se encontro el tipo de solicitud especificado"],HttpResponse::HTTP_OK);
                    //throw new \Exception("No se encontro tipo de solicitud", 1);
                }

                $buscar_solicitud = Solicitud::where('folio',$movimiento->documento_folio);
                if($movimiento->solicitud_id){
                    $buscar_solicitud = $buscar_solicitud->where('id','!=',$movimiento->solicitud_id);
                }
                $buscar_solicitud = $buscar_solicitud->first();

                if($buscar_solicitud){
                    DB::rollback();
                    $buscar_solicitud->load('listaArticulos.articulo','paciente','personalMedico','tipoSolicitud','usuarioFinaliza');
                    return response()->json(['error'=>'Se econtró una solicitud con el mismo folio','code'=>'solicitud_repetida','data'=>$buscar_solicitud],HttpResponse::HTTP_OK);
                }

                $solicitud_articulos = [];
                if($movimiento->solicitud_id){
                    $solicitud = Solicitud::with('listaArticulos')->find($movimiento->solicitud_id);

                    $solicitud = Solicitud::update([
                        'folio'                         =>$movimiento->documento_folio,
                        'tipo_solicitud_id'             =>$tipo_solicitud->id,
                        'tipo_uso_id'                   =>$movimiento->solicitud_tipo_uso_id,
                        'fecha_solicitud'               =>$movimiento->fecha_movimiento,
                        'mes'                           =>substr($movimiento->fecha_movimiento,5,2),
                        'anio'                          =>substr($movimiento->fecha_movimiento,0,4),
                        'observaciones'                 =>'Elemento generado de forma automatica por el modulo de salidas',
                        'estatus'                       =>$movimiento->estatus,                        
                        'unidad_medica_id'              =>$movimiento->unidad_medica_id,
                        'almacen_id'                    =>$movimiento->almacen_movimiento_id,
                        'area_servicio_id'              =>$movimiento->area_servicio_movimiento_id,
                        'programa_id'                   =>$movimiento->programa_id,
                        'turno_id'                      =>$movimiento->turno_id,
                        'paciente_id'                   =>$movimiento->paciente_id,
                        'personal_medico_id'            =>$movimiento->personal_medico_id,
                        'total_claves_solicitadas'      =>$total_claves,
                        'total_articulos_surtidos'      =>$total_articulos,
                        'usuario_finaliza_id'           =>($movimiento->estatus == 'FIN')?$loggedUser->id:null,
                    ]);

                    for ($i=0; $i < count($solicitud->listaArticulos) ; $i++) { 
                        $solicitud_articulos[$solicitud->listaArticulos[$i]->bien_servicio_id] = $solicitud->listaArticulos[$i];
                    }
                }else{
                    $solicitud = Solicitud::create([
                        'folio'                         =>$movimiento->documento_folio,
                        'tipo_solicitud_id'             =>$tipo_solicitud->id,
                        'tipo_uso_id'                   =>$movimiento->solicitud_tipo_uso_id,
                        'fecha_solicitud'               =>$movimiento->fecha_movimiento,
                        'mes'                           =>substr($movimiento->fecha_movimiento,5,2),
                        'anio'                          =>substr($movimiento->fecha_movimiento,0,4),
                        'observaciones'                 =>'Elemento generado de forma automatica por el modulo de salidas',
                        'estatus'                       =>$movimiento->estatus,                        
                        'unidad_medica_id'              =>$movimiento->unidad_medica_id,
                        'almacen_id'                    =>$movimiento->almacen_movimiento_id,
                        'area_servicio_id'              =>$movimiento->area_servicio_movimiento_id,
                        'programa_id'                   =>$movimiento->programa_id,
                        'turno_id'                      =>$movimiento->turno_id,
                        'paciente_id'                   =>$movimiento->paciente_id,
                        'personal_medico_id'            =>$movimiento->personal_medico_id,
                        'total_claves_solicitadas'      =>$total_claves,
                        'total_articulos_solicitados'   =>0,
                        'total_claves_surtidas'         =>0,
                        'total_articulos_surtidos'      =>$total_articulos,
                        'porcentaje_claves_surtidas'    =>0,
                        'porcentaje_articulos_surtidos' =>0,
                        'usuario_captura_id'            =>$loggedUser->id,
                        'usuario_finaliza_id'           =>($movimiento->estatus == 'FIN')?$loggedUser->id:null,
                    ]);

                    $movimiento->update(['solicitud_id'=>$solicitud->id]);
                    if(isset($movimiento_entrada) && $movimiento_entrada){
                        $movimiento_entrada->update(['solicitud_id'=>$solicitud->id]);
                    }
                }

                $total_claves_surtidas = $total_claves;
                $total_articulos_solicitados = 0;
                $nuevos_articulos = [];

                for ($i=0; $i < $conteo_claves ; $i++) { 
                    $articulo = $parametros['lista_articulos'][$i];
                    if($articulo['cantidad_solicitado'] > 0){
                        $datos_articulo = [
                            'bien_servicio_id' => $articulo['id'],
                            'cantidad_solicitada' => $articulo['cantidad_solicitado'],
                            'cantidad_surtida' => $articulo['total_piezas'],
                        ];
                        $total_articulos_solicitados += $articulo['cantidad_solicitado'];
                        if($articulo['total_piezas'] <= 0){
                            $total_claves_surtidas -= 1;
                        }
                        if(isset($solicitud_articulos[$articulo['id']])){
                            $solicitud_articulos[$articulo['id']]->update($datos_articulo);
                            $solicitud_articulos[$articulo['id']] = null;
                        }else{
                            $nuevos_articulos[] = $datos_articulo;
                        }
                    }else{
                        DB::rollback();
                        return response()->json(['error'=>"Al articulo con Clave: '".$articulo['clave']."' le falta la cantidad solicitada."],HttpResponse::HTTP_OK);
                        //throw new \Exception("Al articulo con Clave: '".$articulo['clave']."' le falta la cantidad solicitada.", 1);
                    }
                }

                $articulos_solicitud_eliminar = [];
                for ($i=0; $i < count($solicitud_articulos) ; $i++) { 
                    if($solicitud_articulos[$i]){
                        $articulos_solicitud_eliminar[] = $solicitud_articulos[$i]->id;
                    }
                }
                if(count($articulos_solicitud_eliminar)){
                    $solicitud->listaArticulos()->whereIn('id',$articulos_solicitud_eliminar)->delete();
                }

                $porcentaje_claves_surtidas = round((($total_claves_surtidas/$total_claves)*100),2);
                $porcentaje_articulos_surtidos = round((($total_articulos/$total_articulos_solicitados)*100),2);

                $solicitud->update([
                                'total_articulos_solicitados'   =>$total_articulos_solicitados,
                                'total_claves_surtidas'         =>$total_claves_surtidas,
                                'porcentaje_claves_surtidas'    =>$porcentaje_claves_surtidas,
                                'porcentaje_articulos_surtidos' =>$porcentaje_articulos_surtidos,
                            ]);

                if(count($nuevos_articulos)){
                    $solicitud->listaArticulos()->createMany($nuevos_articulos);
                }
                $movimiento->load('solicitud.tipoSolicitud');
            }
            
            DB::commit();

            if($concluir){
                $movimiento = Movimiento::with(['unidadMedica','unidadMedicaMovimiento','almacenMovimiento','areaServicioMovimiento','programa','turno','paciente',
                                            'personalMedico','tipoMovimiento','almacen',
                                            'movimientoHijo' => function($movimientoHijo){
                                                return $movimientoHijo->with('almacen','tipoMovimiento','concluidoPor','modificadoPor');
                                            },'solicitud'=> function($solicitud){
                                                return $solicitud->with('tipoSolicitud','tipoUso');
                                            },'modificacionActiva'=>function($modificacionActiva){
                                                $modificacionActiva->with('solicitadoUsuario','aprobadoUsuario');
                                            }])->find($movimiento->id);
            }
            
            return response()->json(['data'=>$movimiento],HttpResponse::HTTP_OK);
        }catch(\Exception $e){
            DB::rollback();
            return response()->json(['error'=>['message'=>$e->getMessage(),'line'=>$e->getLine()]], HttpResponse::HTTP_CONFLICT);
        }
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id){
        try{
            DB::beginTransaction();

            $movimiento = Movimiento::with('listaArticulos','listaArticulosBorrador')->find($id);

            if($movimiento->estatus != 'BOR'){
                throw new \Exception("No se puede eliminar este movimiento", 1);
            }
            
            $movimiento->listaArticulos()->delete();
            $movimiento->listaArticulosBorrador()->delete();
            $movimiento->delete();

            DB::commit();

            return response()->json(['data'=>$movimiento],HttpResponse::HTTP_OK);
        }catch(\Exception $e){
            DB::rollback();
            return response()->json(['error'=>['message'=>$e->getMessage(),'line'=>$e->getLine()]], HttpResponse::HTTP_CONFLICT);
        }
    }

    public function cancelarMovimiento($id,Request $request){
        try{
            DB::beginTransaction();
            $loggedUser = auth()->userOrFail();
            $parametros = $request->all();

            if(!$this->authorize('has-permission','XwFSazUr0aCZcAYtcdjYkw69N9amlutP')){
                DB::rollback();
                return response()->json(['error'=>"El usuario no tiene permiso para realizar esta acción"],HttpResponse::HTTP_OK);
                //throw new \Exception("El usuario no tiene permiso para realizar esta acción", 1);
            }
            
            $movimiento = Movimiento::with(['listaArticulos'=>function($articulos){
                                                $articulos->with('articulo','stock.empaqueDetalle');
                                            }])->find($id);

            if($movimiento->estatus != 'FIN' && $movimiento->estatus != 'PERE' ){
                DB::rollback();
                return response()->json(['error'=>"No se puede cancelar este movimiento"],HttpResponse::HTTP_OK);
                //throw new \Exception("No se puede cancelar este movimiento", 1);
            }

            $movimiento_hijo = Movimiento::where('movimiento_padre_id',$id)->first();
            if($movimiento_hijo){
                if($movimiento_hijo->estatus == 'PERE'){
                    $movimiento_hijo->update(['cancelado_por_usuario_id'=>$loggedUser->id, 'estatus'=>'CAN', 'cancelado'=>true, 'fecha_cancelacion'=>$parametros['fecha'], 'motivo_cancelacion'=>$parametros['motivo']]);
                }else if($movimiento_hijo->estatus != 'CAN'){
                    DB::rollback();
                    return response()->json(['error'=>"No se puede cancelar este movimiento, ya que la recepción sigue activa"],HttpResponse::HTTP_OK);
                }
                //throw new \Exception("No se puede cancelar este movimiento, ya que la recepción sigue activa", 1);
            }
            
            //$control_stocks = [];
            foreach ($movimiento->listaArticulos as $articulo_movimiento) {
                if($articulo_movimiento->stock){
                    $stock = $articulo_movimiento->stock;

                    if($stock->empaqueDetalle){
                        $piezas_x_empaque = $stock->empaqueDetalle->piezas_x_empaque;
                    }else{
                        $piezas_x_empaque = 1;
                    }

                    if($articulo_movimiento->modo_movimiento == 'UNI'){
                        $stock->existencia_unidades += $articulo_movimiento->cantidad;
                        $stock->existencia = floor($stock->existencia_unidades / $piezas_x_empaque);
                    }else{
                        $stock->existencia += $articulo_movimiento->cantidad;
                        if($articulo_movimiento->articulo->puede_surtir_unidades){
                            $stock->existencia_unidades += ($articulo_movimiento->cantidad * $piezas_x_empaque);
                        }
                    }
                    $stock->save();
                }
            }

            $movimiento->update(['cancelado_por_usuario_id'=>$loggedUser->id, 'estatus'=>'CAN', 'cancelado'=>true, 'fecha_cancelacion'=>$parametros['fecha'], 'motivo_cancelacion'=>$parametros['motivo']]);

            DB::commit();

            return response()->json(['data'=>$movimiento],HttpResponse::HTTP_OK);
        }catch(\Exception $e){
            DB::rollback();
            return response()->json(['error'=>['message'=>$e->getMessage(),'line'=>$e->getLine()]], HttpResponse::HTTP_CONFLICT);
        }
    }
}
