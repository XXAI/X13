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

            $entradas = Movimiento::select('movimientos.*','almacenes.nombre as almacen','programas.descripcion as programa','proveedores.nombre as proveedor')
                                    ->leftJoin('almacenes','almacenes.id','=','movimientos.almacen_id')
                                    ->leftJoin('programas','programas.id','=','movimientos.programa_id')
                                    ->leftJoin('proveedores','proveedores.id','=','movimientos.proveedor_id')
                                    ->where('movimientos.direccion_movimiento','ENT')
                                    ->where('movimientos.unidad_medica_id',$loggedUser->unidad_medica_asignada_id)
                                    ->orderBy('updated_at','DESC');
            
            //Filtros, busquedas, ordenamiento
            if(isset($parametros['query']) && $parametros['query']){
                $entradas = $entradas->where(function($query)use($parametros){
                    return $query//->where('nombre','LIKE','%'.$parametros['query'].'%')
                                ->whereRaw('CONCAT_WS(" ",personas.apellido_paterno, personas.apellido_materno, personas.nombre) like "%'.$parametros['query'].'%"' )
                                ->orWhere('formularios.descripcion','LIKE','%'.$parametros['query'].'%');
                });
            }

            if(isset($parametros['tipo_movimiento']) && $parametros['tipo_movimiento']){
                $entradas = $entradas->where('tipo_movimiento_id',$parametros['tipo_movimiento']);
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
            $movimiento = Movimiento::with(['listaArticulos'=>function($listaArticulos)use($loggedUser){ 
                                                    return $listaArticulos->with(['articulo'=>function($articulos)use($loggedUser){
                                                                $articulos->datosDescripcion($loggedUser->unidad_medica_asignada_id);
                                                            },'stock','cartaCanje']);
                                            },'listaArticulosBorrador.articulo'=>function($articulos)use($loggedUser){
                                                    $articulos->datosDescripcion($loggedUser->unidad_medica_asignada_id);
                                            },'proveedor'])->find($id);
            if($movimiento->estatus != 'BOR'){
                $movimiento->load(['programa','almacen']);
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
                'almacen_id' => 'required',
                'fecha_movimiento' => 'required',
                'tipo_movimiento_id' => 'required'
                //'folio' => 'required',
                //'descripcion' => 'required',
                //'entrega' => 'required',
                //'recibe' => 'required',
                //'observaciones' => 'required',
                //'programa_id' => 'required',
                //'id' => 'required',
            ];

            DB::beginTransaction();

            $v = Validator::make($parametros, $reglas, $mensajes);

            if ($v->fails()){
                throw new \Exception("Hacen falta campos obligatorios", 1);
            }

            $concluir = $parametros['concluir'];

            $datos_movimiento = [
                'unidad_medica_id' => $loggedUser->unidad_medica_asignada_id,
                'almacen_id' => $parametros['almacen_id'],
                'direccion_movimiento' => 'ENT',
                'tipo_movimiento_id' => $parametros['tipo_movimiento_id'],
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

            $consecutivo = 0;
            $folio = '';
            if($concluir){
                //Generar Folio
                $tipo_movimiento = TipoMovimiento::find($parametros['tipo_movimiento_id']);
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

            $total_claves = count($parametros['lista_articulos']);
            $total_articulos = 0;
            $total_monto = 0;

            if(!$concluir){
                $lista_articulos_borrador = [];

                for ($i=0; $i < $total_claves ; $i++) { 
                    $articulo = $parametros['lista_articulos'][$i];
                    $total_articulos += $articulo['total_piezas'];
                    $total_monto += $articulo['total_monto'];
                    
                    for($j=0; $j < count($articulo['lotes']); $j++){
                        $lote = $articulo['lotes'][$j];
                        $lista_articulos_borrador[] = [
                            'bien_servicio_id' => $articulo['id'],
                            'direccion_movimiento' => 'ENT',
                            'modo_movimiento' => 'NRM',
                            'cantidad' => $lote['cantidad'],
                            'marca_id' => (isset($lote['marca_id']))?$lote['marca_id']:null,
                            'lote' => $lote['lote'],
                            'codigo_barras' => $lote['codigo_barras'],
                            'fecha_caducidad' => $lote['fecha_caducidad'],
                            'precio_unitario' => $lote['precio_unitario'],
                            'iva' => $lote['iva'],
                            'total_monto' => $lote['total_monto'],
                            'memo_folio' => (isset($lote['memo_folio']))?$lote['memo_folio']:null,
                            'memo_fecha' => (isset($lote['memo_fecha']))?$lote['memo_fecha']:null,
                            'vigencia_meses' => (isset($lote['vigencia_meses']))?$lote['vigencia_meses']:null,
                            'user_id' => $loggedUser->id,
                        ];
                    }
                }

                $movimiento->listaArticulosBorrador()->delete();
                $movimiento->listaArticulosBorrador()->createMany($lista_articulos_borrador);
            }else{
                $lista_articulos_agregar = [];
                $lista_articulos_eliminar = [];

                $lista_articulos_guardados_raw = $movimiento->listaArticulos;
                $lista_articulos_guardados = [];
                for ($i=0; $i < count($lista_articulos_guardados_raw); $i++) { 
                    $articulo_guardado = $lista_articulos_guardados_raw[$i];
                    $lista_articulos_guardados[$articulo_guardado->bien_servicio_id.'-'.$articulo_guardado->stock_id] = $articulo_guardado;
                }

                for ($i=0; $i < $total_claves ; $i++) { 
                    $articulo = $parametros['lista_articulos'][$i];
                    $total_articulos += $articulo['total_piezas'];
                    $total_monto += $articulo['total_monto'];

                    for($j=0; $j < count($articulo['lotes']); $j++){
                        $lote = $articulo['lotes'][$j];

                        $stock_lote = [
                            'unidad_medica_id' => $loggedUser->unidad_medica_asignada_id,
                            'almacen_id' => $parametros['almacen_id'],
                            'bienes_servicios_id' => $articulo['id'],
                            'programa_id' => $parametros['programa_id'],
                            'existencia' => $lote['cantidad'],
                            'marca_id' => (isset($lote['marca_id']))?$lote['marca_id']:null,
                            'lote' => $lote['lote'],
                            'codigo_barras' => $lote['codigo_barras'],
                            'fecha_caducidad' => $lote['fecha_caducidad'],
                            'user_id' => $loggedUser->id,
                        ];

                        $lote_guardado = Stock::where("almacen_id",$parametros['almacen_id'])
                                                ->where("bienes_servicios_id",$stock_lote['bienes_servicios_id'])
                                                ->where("programa_id",$stock_lote['programa_id'])
                                                ->where("lote",$stock_lote['lote'])
                                                ->where("fecha_caducidad",$stock_lote['fecha_caducidad'])
                                                ->where("codigo_barras",$stock_lote['codigo_barras'])
                                                ->where("marca_id",$stock_lote['marca_id'])
                                                ->first();
                        if($lote_guardado){
                            $lote_guardado->existencia += $stock_lote['existencia'];
                            $lote_guardado->user_id = $loggedUser->id;
                            $lote_guardado->save();
                        }else{
                            $lote_guardado = Stock::create($stock_lote);
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
                            $articulo_guardado->stock_id = $lote_guardado->id;
                            $articulo_guardado->bien_servicio_id = $articulo['id'];
                            $articulo_guardado->direccion_movimiento = 'ENT';
                            $articulo_guardado->modo_movimiento = 'NRM';
                            $articulo_guardado->cantidad = $lote['cantidad'];
                            $articulo_guardado->precio_unitario = $lote['precio_unitario'];
                            $articulo_guardado->iva = $lote['iva'];
                            $articulo_guardado->total_monto = $lote['total_monto'];
                            $articulo_guardado->cantidad_anterior = $lote_guardado->existencia - $lote['cantidad'];
                            $articulo_guardado->user_id = $loggedUser->id;
                            $articulo_guardado->save();

                            $lista_articulos_guardados[$articulo['id'].'-'.$lote_guardado->id] = NULL;
                        }else{
                            $lista_articulos_agregar[] = [
                                'stock_id' => $lote_guardado->id,
                                'bien_servicio_id' => $articulo['id'],
                                'direccion_movimiento' => 'ENT',
                                'modo_movimiento' => 'NRM',
                                'cantidad' => $lote['cantidad'],
                                'precio_unitario' => $lote['precio_unitario'],
                                'iva' => $lote['iva'],
                                'total_monto' => $lote['total_monto'],
                                'cantidad_anterior' => $lote_guardado->existencia - $lote['cantidad'],
                                'user_id' => $loggedUser->id,
                            ];
                        }
                    }
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

                DB::statement("UPDATE cartas_canje A, movimientos_articulos B set A.movimiento_articulo_id = B.id
                                where A.movimiento_id = B.movimiento_id AND A.stock_id = B.stock_id AND A.bien_servicio_id = B.bien_servicio_id AND A.movimiento_id = :idMovimiento", 
                            array('idMovimiento' => $movimiento->id));
            }

            $movimiento->total_claves = $total_claves;
            $movimiento->total_articulos = $total_articulos;
            $movimiento->total_monto = $total_monto;
            $movimiento->save();
            
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

            $movimiento = Movimiento::with('listaArticulos','listaArticulosBorrador')->find($id);

            if($movimiento->estatus != 'BOR'){
                throw new Exception("No se puede eliminar este movimiento", 1);
            }
            
            $movimiento->listaArticulos()->delete();
            $movimiento->listaArticulosBorrador()->delete();
            $movimiento->delete();

            return response()->json(['data'=>$movimiento],HttpResponse::HTTP_OK);
        }catch(\Exception $e){
            DB::rollback();
            return response()->json(['error'=>['message'=>$e->getMessage(),'line'=>$e->getLine()]], HttpResponse::HTTP_CONFLICT);
        }
    }
}
