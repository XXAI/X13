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
use App\Models\TipoMovimiento;
use App\Models\UnidadMedica;
use App\Models\Almacen;
use App\Models\BienServicio;

class AlmacenEntradaController extends Controller
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
            
            $entradas = Movimiento::select('movimientos.*','almacenes.nombre as almacen','programas.descripcion as programa','proveedores.nombre as proveedor','catalogo_tipos_movimiento.descripcion as tipo_movimiento',
                                            'catalogo_tipos_movimiento.clave as tipo_movimiento_clave','almacen_origen.nombre as almacen_origen','unidad_origen.nombre as unidad_origen',
                                            'tipo_solicitud.descripcion as tipo_solicitud','solicitudes.porcentaje_articulos_surtidos as porcentaje_surtido','unidad_medica_turnos.nombre as turno',
                                            'eliminado_por.username as eliminado_por',
                                            'cancelado_por.username as cancelado_por',
                                            'concluido_por.username as concluido_por',
                                            'modificado_por.username as modificado_por')
                                    ->leftJoin('unidad_medica_turnos','unidad_medica_turnos.id','=','movimientos.turno_id')
                                    ->leftJoin('almacenes','almacenes.id','=','movimientos.almacen_id')
                                    ->leftJoin('almacenes as almacen_origen','almacen_origen.id','=','movimientos.almacen_movimiento_id')
                                    ->leftJoin('catalogo_unidades_medicas as unidad_origen','unidad_origen.id','=','movimientos.unidad_medica_movimiento_id')
                                    ->leftJoin('programas','programas.id','=','movimientos.programa_id')
                                    ->leftJoin('proveedores','proveedores.id','=','movimientos.proveedor_id')
                                    ->leftJoin('catalogo_tipos_movimiento','catalogo_tipos_movimiento.id','=','movimientos.tipo_movimiento_id')
                                    ->leftJoin('solicitudes','solicitudes.id','=','movimientos.solicitud_id')
                                    ->leftJoin('catalogo_tipos_solicitud as tipo_solicitud','tipo_solicitud.id','=','solicitudes.tipo_solicitud_id')
                                    ->leftJoin('users as eliminado_por','eliminado_por.id','=','movimientos.eliminado_por_usuario_id')
                                    ->leftJoin('users as cancelado_por','cancelado_por.id','=','movimientos.cancelado_por_usuario_id')
                                    ->leftJoin('users as concluido_por','concluido_por.id','=','movimientos.concluido_por_usuario_id')
                                    ->leftJoin('users as modificado_por','modificado_por.id','=','movimientos.modificado_por_usuario_id')
                                    ->where('movimientos.direccion_movimiento','ENT')
                                    ->where('movimientos.unidad_medica_id',$loggedUser->unidad_medica_asignada_id)
                                    ->whereIn('movimientos.almacen_id',$almacenes)
                                    ->orderBy('updated_at','DESC');
            
            //Filtros, busquedas, ordenamiento
            if(isset($parametros['query']) && $parametros['query']){
                $entradas = $entradas->where(function($query)use($parametros){
                    return $query->where('movimientos.folio','LIKE','%'.$parametros['query'].'%')
                                ->orWhere('almacenes.nombre','LIKE','%'.$parametros['query'].'%')
                                ->orWhere('almacen_origen.nombre','LIKE','%'.$parametros['query'].'%')
                                ->orWhere('unidad_origen.nombre','LIKE','%'.$parametros['query'].'%')
                                ->orWhere('programas.descripcion','LIKE','%'.$parametros['query'].'%')
                                ->orWhere('proveedores.nombre','LIKE','%'.$parametros['query'].'%')
                                ->orWhere('movimientos.referencia_folio','LIKE','%'.$parametros['query'].'%')
                                ->orWhere('catalogo_tipos_movimiento.descripcion','LIKE','%'.$parametros['query'].'%')
                                ;

                });
            }

            if(isset($parametros['estatus']) && $parametros['estatus']){
                if($parametros['estatus'] == 'SOL' || $parametros['estatus'] == 'MOD'){
                    $entradas = $entradas->whereHas('modificacionActiva',function($query)use($parametros){
                        $query->where('estatus',$parametros['estatus']);
                    });
                }else{
                    $entradas = $entradas->where('movimientos.estatus',$parametros['estatus'])->doesntHave('modificacionActiva');
                }
            }

            if(isset($parametros['almacen_id']) && $parametros['almacen_id']){
                $entradas = $entradas->where('movimientos.almacen_id',$parametros['almacen_id']);
            }

            if(isset($parametros['tipo_movimiento_id']) && $parametros['tipo_movimiento_id']){
                $entradas = $entradas->where('movimientos.tipo_movimiento_id',$parametros['tipo_movimiento_id']);
            }

            if(isset($parametros['fecha_inicio']) && $parametros['fecha_inicio']){
                $entradas = $entradas->where('movimientos.fecha_movimiento','>=',$parametros['fecha_inicio'])
                                    ->where('movimientos.fecha_movimiento','<=',$parametros['fecha_fin']);
            }
            /*if(!(isset($parametros['mostrar_todo']) && $parametros['mostrar_todo'])){
                $entradas = $entradas->where('estatus','like','ME-%');
            }*/

            if(isset($parametros['page'])){
                $resultadosPorPagina = isset($parametros["per_page"])? $parametros["per_page"] : 20;
                $entradas = $entradas->paginate($resultadosPorPagina);

            } else {
                $entradas = $entradas->get();
            }

            return response()->json(['data'=>$entradas],HttpResponse::HTTP_OK);
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
            /*$movimiento = Movimiento::with(['listaArticulos'=>function($listaArticulos)use($loggedUser){ 
                                                    return $listaArticulos->with(['articulo'=>function($articulos)use($loggedUser){
                                                                $articulos->datosDescripcion($loggedUser->unidad_medica_asignada_id);
                                                            },'stock.marca','cartaCanje']);
                                            },'listaArticulosBorrador'=>function($listaBorrador)use($loggedUser){ 
                                                return $listaBorrador->with(['articulo'=>function($articulos)use($loggedUser){
                                                            $articulos->datosDescripcion($loggedUser->unidad_medica_asignada_id);
                                                        },'marca']);
                                            },'proveedor','programa','tipoMovimiento'])->find($id);*/
            //if($movimiento->estatus != 'BOR'){
            $movimiento = Movimiento::with(['unidadMedica','almacen','almacenMovimiento','unidadMedicaMovimiento','proveedor','programa','tipoMovimiento','turno'])->find($id);
            //}

            if($movimiento->estatus == 'PERE'){
                $movimiento_hijo_id = $movimiento->id;
                $solicitud_id = $movimiento->solicitud_id;
                $movimiento_padre = Movimiento::with(['listaArticulos'=>function($listaArticulos)use($loggedUser,$movimiento_hijo_id,$solicitud_id){
                                                        return $listaArticulos->select('movimientos_articulos.*','movimientos_articulos_borrador.cantidad as cantidad_recibida','solicitudes_articulos.cantidad_solicitada')
                                                                                ->leftJoin('movimientos_articulos_borrador',function($join)use($movimiento_hijo_id){
                                                                                    return $join->on('movimientos_articulos_borrador.stock_id','=','movimientos_articulos.stock_id')
                                                                                                ->where('movimientos_articulos_borrador.movimiento_id',$movimiento_hijo_id);
                                                                                })
                                                                                ->leftjoin('solicitudes_articulos',function($join)use($solicitud_id){
                                                                                    return $join->on('solicitudes_articulos.bien_servicio_id','=','movimientos_articulos.bien_servicio_id')
                                                                                                ->where('solicitudes_articulos.solicitud_id',$solicitud_id);
                                                                                })
                                                                                ->with(['articulo'=>function($articulos)use($loggedUser){
                                                                                    $articulos->datosDescripcion($loggedUser->unidad_medica_asignada_id);
                                                                                },'stock.marca','cartaCanje'])
                                                                                ;
                                                }])->find($movimiento->movimiento_padre_id);
                $movimiento->lista_articulos_recepcion = $movimiento_padre->listaArticulos;
            }else{
                $solicitud_id = $movimiento->solicitud_id;
                $movimiento->load(['listaArticulos'=>function($listaArticulos)use($loggedUser,$solicitud_id){ 
                                                        return $listaArticulos->select('movimientos_articulos.*','solicitudes_articulos.cantidad_solicitada')
                                                                ->leftjoin('solicitudes_articulos',function($join)use($solicitud_id){
                                                                    return $join->on('solicitudes_articulos.bien_servicio_id','=','movimientos_articulos.bien_servicio_id')
                                                                                ->where('solicitudes_articulos.solicitud_id',$solicitud_id);
                                                                })
                                                                ->with(['articulo'=>function($articulos)use($loggedUser){
                                                                    $articulos->datosDescripcion($loggedUser->unidad_medica_asignada_id);
                                                                },'stock'=>function($stock){
                                                                    $stock->with('marca')->withTrashed();
                                                                },'cartaCanje']);
                                                },'listaArticulosBorrador'=>function($listaBorrador)use($loggedUser){ 
                                                    return $listaBorrador->with(['articulo'=>function($articulos)use($loggedUser){
                                                                $articulos->datosDescripcion($loggedUser->unidad_medica_asignada_id);
                                                            },'marca']);
                                                }]);
            }

            if($movimiento->solicitud_id){
                $movimiento->load('solicitud.tipoSolicitud');
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
                'unique'        => "unique"
            ];
    
            $reglas = [
                'almacen_id'            => 'required',
                'fecha_movimiento'      => 'required',
                'tipo_movimiento_id'    => 'required',
                //'programa_id'           => 'required',
            ];

            DB::beginTransaction();

            $v = Validator::make($parametros, $reglas, $mensajes);

            if ($v->fails()){
                throw new \Exception("Hacen falta campos obligatorios", 1);
            }

            //return response()->json(['error'=>'Probando el guardado','data'=>$parametros],HttpResponse::HTTP_OK);

            $concluir = $parametros['concluir'];
            $movimiento = null;
            $datos_movimiento = [];

            if(isset($parametros['id']) && $parametros['id']){
                $movimiento = Movimiento::with('listaArticulos','listaArticulosBorrador')->find($parametros['id']);
            }

            if($movimiento && $movimiento->estatus == 'PERE'){
                $tipo_movimiento = TipoMovimiento::find($movimiento->tipo_movimiento_id);

                $datos_movimiento = [
                    'estatus' => ($concluir)?'FIN':'PERE',
                    'fecha_movimiento' => $parametros['fecha_movimiento'],
                    'turno_id' => $parametros['turno_id'],
                    'observaciones' => $parametros['observaciones'],
                    'total_claves' => 0,
                    'total_articulos' => 0,
                    'total_monto' => 0,
                ];
            }else{
                $tipo_movimiento = TipoMovimiento::find($parametros['tipo_movimiento_id']);

                $datos_movimiento = [
                    'unidad_medica_id' => $loggedUser->unidad_medica_asignada_id,
                    'almacen_id' => $parametros['almacen_id'],
                    'direccion_movimiento' => 'ENT',
                    'tipo_movimiento_id' => $parametros['tipo_movimiento_id'],
                    'turno_id' => $parametros['turno_id'],
                    'estatus' => ($concluir)?'FIN':'BOR',
                    'fecha_movimiento' => $parametros['fecha_movimiento'],
                    'programa_id' => (isset($parametros['programa_id']) && $parametros['programa_id'])?$parametros['programa_id']:null,
                    'proveedor_id' => (isset($parametros['proveedor_id']) && $parametros['proveedor_id'])?$parametros['proveedor_id']:null,
                    'descripcion' => 'Entrada Manual',
                    'documento_folio' => $parametros['documento_folio'],
                    'referencia_folio' => $parametros['referencia_folio'],
                    'referencia_fecha' => $parametros['referencia_fecha'],
                    'observaciones' => $parametros['observaciones'],
                    'total_claves' => 0,
                    'total_articulos' => 0,
                    'total_monto' => 0,
                ];
            }
            
            $consecutivo = 0;
            $folio = '';
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

            //if(isset($parametros['id']) && $parametros['id']){
                //$movimiento = Movimiento::with('listaArticulos','listaArticulosBorrador')->find($parametros['id']);
            if($movimiento){
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

            $total_claves = count($parametros['lista_articulos']);
            $total_loop = $total_claves;
            $total_articulos = 0;
            $total_monto = 0;
            $modo_movimiento = ($tipo_movimiento->clave == 'RCPCN')?'TPS':'NRM';

            if(!$concluir){
                $lista_articulos_borrador = [];

                for ($i=0; $i < $total_loop ; $i++) { 
                    $articulo = $parametros['lista_articulos'][$i];
                    if($articulo['total_piezas'] > 0){
                        $total_articulos += ($tipo_movimiento->clave == 'RCPCN')?$articulo['total_recibido']:$articulo['total_piezas'];
                        $total_monto += $articulo['total_monto'];
                        
                        for($j=0; $j < count($articulo['lotes']); $j++){
                            $lote = $articulo['lotes'][$j];
                            $lista_articulos_borrador[] = [
                                'bien_servicio_id'      => $articulo['id'],
                                'direccion_movimiento'  => 'ENT',
                                'modo_movimiento'       => $modo_movimiento,
                                'cantidad'              => $lote['cantidad'],

                                'stock_id'              => (isset($lote['stock_id']))?$lote['stock_id']:null,

                                'marca_id'              => (isset($lote['marca_id']))?$lote['marca_id']:null,
                                'modelo'                => (isset($lote['modelo']))?$lote['modelo']:null,
                                'no_serie'              => (isset($lote['no_serie']))?$lote['no_serie']:null,

                                'lote'                  => (isset($lote['lote']))?$lote['lote']:null,
                                'codigo_barras'         => (isset($lote['codigo_barras']))?$lote['codigo_barras']:null,
                                'fecha_caducidad'       => (isset($lote['fecha_caducidad']))?$lote['fecha_caducidad']:null,

                                'precio_unitario'       => (isset($lote['precio_unitario']))?$lote['precio_unitario']:null,
                                'iva'                   => (isset($lote['iva']))?$lote['iva']:null,
                                'total_monto'           => (isset($lote['total_monto']))?$lote['total_monto']:null,
                                'memo_folio'            => (isset($lote['memo_folio']))?$lote['memo_folio']:null,
                                'memo_fecha'            => (isset($lote['memo_fecha']))?$lote['memo_fecha']:null,
                                'vigencia_meses'        => (isset($lote['vigencia_meses']))?$lote['vigencia_meses']:null,
                                'user_id'               => $loggedUser->id,
                            ];
                        }
                    }else if($movimiento->estatus == 'PERE'){
                        $lista_articulos_borrador[] = [
                            'bien_servicio_id'      => $articulo['id'],
                            'direccion_movimiento'  => 'ENT',
                            'modo_movimiento'       => $modo_movimiento,
                            'cantidad'              => 0,
                            'user_id'               => $loggedUser->id,
                        ];
                    }else{
                        $total_claves -= 1;
                    }
                }

                $movimiento->listaArticulosBorrador()->delete();
                $movimiento->listaArticulosBorrador()->createMany($lista_articulos_borrador);
            }else{

                if($total_claves <= 0){
                    DB::rollback();
                    return response()->json(['error'=>'No se encontraron claves asignadas al movimiento'],HttpResponse::HTTP_OK);
                }

                $lista_articulos_agregar = [];
                $lista_articulos_eliminar = [];

                $lista_articulos_guardados_raw = $movimiento->listaArticulos;
                $lista_articulos_guardados = [];
                for ($i=0; $i < count($lista_articulos_guardados_raw); $i++) { 
                    $articulo_guardado = $lista_articulos_guardados_raw[$i];
                    $lista_articulos_guardados[$articulo_guardado->bien_servicio_id.'-'.$articulo_guardado->stock_id] = $articulo_guardado;
                }

                $loaded_articulos = [];
                for ($i=0; $i < $total_loop ; $i++) { 
                    $articulo = $parametros['lista_articulos'][$i];

                    if(!isset($loaded_articulos[$articulo['id']])){
                        $articulo_data = BienServicio::find($articulo['id']);
                        if(!$articulo_data){
                            throw new \Exception("No se encontro el articulo con clave: ".$articulo['clave'], 1);
                        }
                        $loaded_articulos[$articulo['id']] = $articulo_data;
                    }else{
                        $articulo_data = $loaded_articulos[$articulo['id']];
                    }
                    
                    if($articulo['total_piezas'] > 0){
                        $total_articulos += ($tipo_movimiento->clave == 'RCPCN')?$articulo['total_recibido']:$articulo['total_piezas'];
                        $total_monto += $articulo['total_monto'];

                        for($j=0; $j < count($articulo['lotes']); $j++){
                            $lote = $articulo['lotes'][$j];

                            $stock_lote = [
                                'unidad_medica_id'      => $loggedUser->unidad_medica_asignada_id,
                                'almacen_id'            => $movimiento->almacen_id,
                                'bien_servicio_id'      => $articulo['id'],
                                'programa_id'           => $movimiento->programa_id,
                                'existencia'            => $lote['cantidad'],
                                'existencia_unidades'   => ($articulo_data->puede_surtir_unidades)?($articulo_data->unidades_x_empaque*$lote['cantidad']):null,

                                'marca_id'              => (isset($lote['marca_id']))?$lote['marca_id']:null,
                                'modelo'                => (isset($lote['modelo']))?$lote['modelo']:null,
                                'no_serie'              => (isset($lote['no_serie']))?$lote['no_serie']:null,

                                'lote'                  => (isset($lote['lote']))?$lote['lote']:null,
                                'codigo_barras'         => (isset($lote['codigo_barras']))?$lote['codigo_barras']:null,
                                'fecha_caducidad'       => (isset($lote['fecha_caducidad']))?$lote['fecha_caducidad']:null,

                                'user_id'               => $loggedUser->id,
                            ];

                            if($tipo_movimiento->clave == 'RCPCN'){ //Si el tipo de movimiento es de recepción, entonces ya debe venir con el id del lote, del que se saco
                                $lote_padre = Stock::where('id',$lote['stock_id'])->first();

                                if(!$lote_padre){
                                    throw new \Exception("Error al intentar copiar datos del Lote", 1);
                                }

                                $stock_lote['programa_id']      = $lote_padre->programa_id;
                                
                                $stock_lote["marca_id"]         = $lote_padre->marca_id;
                                $stock_lote["modelo"]           = $lote_padre->modelo;
                                $stock_lote["no_serie"]         = $lote_padre->no_serie;

                                $stock_lote["lote"]             = $lote_padre->lote;
                                $stock_lote["codigo_barras"]    = $lote_padre->codigo_barras;
                                $stock_lote["fecha_caducidad"]  = $lote_padre->fecha_caducidad;
                            }

                            $lote_guardado = Stock::where("almacen_id",$stock_lote['almacen_id'])
                                                ->where("bien_servicio_id",$stock_lote['bien_servicio_id'])
                                                ->where("programa_id",$stock_lote['programa_id'])

                                                ->where("marca_id",$stock_lote['marca_id'])
                                                ->where("modelo",$stock_lote['modelo'])
                                                ->where("no_serie",$stock_lote['no_serie'])
                                                
                                                ->where("lote",$stock_lote['lote'])
                                                ->where("codigo_barras",$stock_lote['codigo_barras'])
                                                ->where("fecha_caducidad",$stock_lote['fecha_caducidad'])
                                                ->first();
                            
                            if($lote_guardado){
                                $lote_guardado->existencia += $stock_lote['existencia'];
                                if($articulo_data->puede_surtir_unidades){
                                    $lote_guardado->existencia_unidades += ($articulo_data->unidades_x_empaque * $stock_lote['existencia']);
                                }
                                $lote_guardado->user_id = $loggedUser->id;
                                $lote_guardado->save();
                            }else{
                                $lote_guardado = Stock::create($stock_lote);
                            }

                            if($tipo_movimiento->clave == 'RCPCN'){
                                $cantidad_anterior = $lote['cantidad_enviada'];
                            }else{
                                $cantidad_anterior = $lote_guardado->existencia - $lote['cantidad'];
                            }

                            if(isset($lote['memo_folio']) && $lote['memo_folio']){
                                $vigencia_fecha = Carbon::createFromFormat('Y-m-d', $movimiento->fecha_movimiento);

                                $carta_canje = [
                                    'movimiento_id'         => $movimiento->id,
                                    'stock_id'              => $lote_guardado->id,
                                    'bien_servicio_id'      => $articulo['id'],
                                    'cantidad'              => $lote['cantidad'],
                                    'memo_folio'            => $lote['memo_folio'],
                                    'memo_fecha'            => $lote['memo_fecha'],
                                    'vigencia_meses'        => $lote['vigencia_meses'],
                                    'vigencia_fecha'        => $vigencia_fecha->addMonths($lote['vigencia_meses']),
                                    'estatus'               => 'PEN',
                                    'creado_por_usuario_id' => $loggedUser->id
                                ];

                                CartaCanje::create($carta_canje);
                            }

                            if(isset($lista_articulos_guardados[$articulo['id'].'-'.$lote_guardado->id])){
                                $articulo_guardado = $lista_articulos_guardados[$articulo['id'].'-'.$lote_guardado->id];
                                $articulo_guardado->stock_id                = $lote_guardado->id;
                                $articulo_guardado->bien_servicio_id        = $articulo['id'];
                                $articulo_guardado->direccion_movimiento    = 'ENT';
                                $articulo_guardado->modo_movimiento         = $modo_movimiento;
                                $articulo_guardado->cantidad                = $lote['cantidad'];
                                $articulo_guardado->precio_unitario         = ($lote['precio_unitario'])?$lote['precio_unitario']:null;
                                $articulo_guardado->iva                     = ($lote['iva'])?$lote['iva']:null;
                                $articulo_guardado->total_monto             = ($lote['total_monto'])?$lote['total_monto']:null;
                                $articulo_guardado->cantidad_anterior       = $cantidad_anterior;
                                $articulo_guardado->user_id                 = $loggedUser->id;
                                $articulo_guardado->save();

                                $lista_articulos_guardados[$articulo['id'].'-'.$lote_guardado->id] = NULL;
                            }else{
                                $lista_articulos_agregar[] = [
                                    'stock_id'              => $lote_guardado->id,
                                    'bien_servicio_id'      => $articulo['id'],
                                    'direccion_movimiento'  => 'ENT',
                                    'modo_movimiento'       => $modo_movimiento,
                                    'cantidad'              => $lote['cantidad'],
                                    'precio_unitario'       => ($lote['precio_unitario'])?$lote['precio_unitario']:null,
                                    'iva'                   => ($lote['iva'])?$lote['iva']:null,
                                    'total_monto'           => ($lote['total_monto'])?$lote['total_monto']:null,
                                    'cantidad_anterior'     => $cantidad_anterior,
                                    'user_id'               => $loggedUser->id,
                                ];
                            }
                        }
                    }else if($tipo_movimiento->clave == 'RCPCN'){
                        $articulo_en_ceros = [
                            'bien_servicio_id'      => $articulo['id'],
                            'direccion_movimiento'  => 'ENT',
                            'modo_movimiento'       => $modo_movimiento,
                            'cantidad'              => 0,
                            'precio_unitario'       => null,
                            'iva'                   => null,
                            'total_monto'           => null,
                            'cantidad_anterior'     => 0,
                            'user_id'               => $loggedUser->id,
                        ];

                        if(isset($lista_articulos_guardados[$articulo['id'].'-'.null])){
                            $articulo_guardado = $lista_articulos_guardados[$articulo['id'].'-'.null];
                            $articulo_guardado->stock_id                = null;
                            $articulo_guardado->bien_servicio_id        = $articulo_en_ceros['bien_servicio_id'];
                            $articulo_guardado->direccion_movimiento    = $articulo_en_ceros['direccion_movimiento'];
                            $articulo_guardado->modo_movimiento         = $articulo_en_ceros['modo_movimiento'];
                            $articulo_guardado->cantidad                = $articulo_en_ceros['cantidad'];
                            $articulo_guardado->precio_unitario         = $articulo_en_ceros['precio_unitario'];
                            $articulo_guardado->iva                     = $articulo_en_ceros['iva'];
                            $articulo_guardado->total_monto             = $articulo_en_ceros['total_monto'];
                            $articulo_guardado->cantidad_anterior       = $articulo_en_ceros['cantidad_anterior'];
                            $articulo_guardado->user_id                 = $articulo_en_ceros['user_id'];
                            $articulo_guardado->save();

                            $lista_articulos_guardados[$articulo['id'].'-'.null] = NULL;
                        }else{
                            $lista_articulos_agregar[] = [
                                'bien_servicio_id'        => $articulo_en_ceros['bien_servicio_id'],
                                'direccion_movimiento'    => $articulo_en_ceros['direccion_movimiento'],
                                'modo_movimiento'         => $articulo_en_ceros['modo_movimiento'],
                                'cantidad'                => $articulo_en_ceros['cantidad'],
                                'precio_unitario'         => $articulo_en_ceros['precio_unitario'],
                                'iva'                     => $articulo_en_ceros['iva'],
                                'total_monto'             => $articulo_en_ceros['total_monto'],
                                'cantidad_anterior'       => $articulo_en_ceros['cantidad_anterior'],
                                'user_id'                 => $articulo_en_ceros['user_id'],
                            ];
                        }
                    }else{
                        $total_claves -= 1;
                    }
                }

                foreach ($lista_articulos_guardados as $key => $articulo_guardado) {
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

                DB::statement("UPDATE cartas_canje A, movimientos_articulos B set A.movimiento_articulo_id = B.id
                                where A.movimiento_id = B.movimiento_id AND A.stock_id = B.stock_id AND A.bien_servicio_id = B.bien_servicio_id AND A.movimiento_id = :idMovimiento", 
                            array('idMovimiento' => $movimiento->id));
                
                if($movimiento->movimiento_padre_id){
                    $movimiento_padre = Movimiento::find($movimiento->movimiento_padre_id);
                    if(!$movimiento_padre){
                        throw new \Exception("El Movimiento padre no fue encontrado", 1);
                    }
                    $movimiento_padre->estatus = 'FIN';
                    $movimiento_padre->save();
                }
            }

            $movimiento->total_claves = $total_claves;
            $movimiento->total_articulos = $total_articulos;
            $movimiento->total_monto = $total_monto;
            $movimiento->save();

            $total_articulos = 0;
            if($movimiento->es_colectivo && $movimiento->solicitud_id && $concluir){
                $movimiento->load('solicitud.listaArticulos');
                $solicitud = $movimiento->solicitud;

                $solicitud_articulos = [];
                for ($i=0; $i < count($solicitud->listaArticulos) ; $i++) { 
                    $solicitud_articulos[$solicitud->listaArticulos[$i]->bien_servicio_id] = $solicitud->listaArticulos[$i];
                }
                
                $total_claves_surtidas = $total_claves;
                $total_articulos_surtidos = 0;
                
                for ($i=0; $i < $total_loop ; $i++) { 
                    $articulo = $parametros['lista_articulos'][$i];
                    $total_articulos = ($tipo_movimiento->clave == 'RCPCN')?$articulo['total_recibido']:$articulo['total_piezas'];
                    if($total_articulos <= 0){
                        $total_claves_surtidas -= 1;
                    }
                    $total_articulos_surtidos += $total_articulos;
                    $solicitud_articulos[$articulo['id']]->update(['cantidad_surtida'=>$total_articulos]);
                }

                $porcentaje_claves_surtidas = round((($total_claves_surtidas/$solicitud->total_claves_solicitadas)*100),2);
                $porcentaje_articulos_surtidos = round((($total_articulos_surtidos/$solicitud->total_articulos_solicitados)*100),2);

                $solicitud->update([
                                'estatus'                       =>$movimiento->estatus,
                                'total_claves_surtidas'         =>$total_claves_surtidas,
                                'total_articulos_surtidos'      =>$total_articulos_surtidos,
                                'porcentaje_claves_surtidas'    =>$porcentaje_claves_surtidas,
                                'porcentaje_articulos_surtidos' =>$porcentaje_articulos_surtidos,
                            ]);
                $movimiento->load('solicitud.tipoSolicitud');
            }
            
            DB::commit();
            
            return response()->json(['data'=>$movimiento],HttpResponse::HTTP_OK);
        }catch(\Exception $e){
            DB::rollback();
            return response()->json(['error'=>['message'=>$e->getMessage(),'line'=>$e->getLine()]], HttpResponse::HTTP_CONFLICT);
        }
    }

    public function cancelarMovimiento($id, Request $request){
        try{
            DB::beginTransaction();
            $loggedUser = auth()->userOrFail();
            $parametros = $request->all();

            if(!$this->authorize('has-permission','XwFSazUr0aCZcAYtcdjYkw69N9amlutP')){
                throw new \Exception("El usuario no tiene permiso para realizar esta acción", 1);
            }

            $movimiento = Movimiento::with('listaArticulos.stock.articulo')->find($id);

            if($movimiento->estatus != 'FIN'){
                throw new \Exception("No se puede cancelar este movimiento", 1);
            }
            
            $control_stocks = [];
            foreach ($movimiento->listaArticulos as $articulo) {
                $stock = $articulo->stock;
                if($articulo->modo_movimiento == 'UNI'){
                    $stock->existencia_unidades = $stock->existencia_unidades - $articulo->cantidad;
                    $stock->existencia = $stock->existencia - floor($articulo->cantidad / $stock->articulo->unidades_x_empaque);
                }else{
                    $stock->existencia = $stock->existencia - $articulo->cantidad;
                    if($stock->articulo->puede_surtir_unidades){
                        $stock->existencia_unidades = $stock->existencia_unidades - ($articulo->cantidad * $stock->articulo->unidades_x_empaque);
                    }
                }
                
                if($stock->existencia < 0){
                    $control_stocks[] = $stock;
                }else{
                    $stock->save();
                }
            }

            if(count($control_stocks) > 0){
                DB::rollback();
                return response()->json(['error'=>'Uno o mas elementos resultan con valores negativos','data'=>$control_stocks],HttpResponse::HTTP_OK);
            }
            
            $movimiento->update(['cancelado_por_usuario_id'=>$loggedUser->id, 'estatus'=>'CAN', 'cancelado'=>true, 'fecha_cancelacion'=>$parametros['fecha'], 'motivo_cancelacion'=>$parametros['motivo']]);

            DB::commit();

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
            $loggedUser = auth()->userOrFail();
            
            $movimiento = Movimiento::with('listaArticulos','listaArticulosBorrador')->find($id);

            if($movimiento->estatus != 'BOR'){
                throw new \Exception("No se puede eliminar este movimiento", 1);
            }

            $movimiento->update(['eliminado_por_usuario_id'=>$loggedUser->id]);
            
            $movimiento->listaArticulos->cartaCanje()->delete();
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
}
