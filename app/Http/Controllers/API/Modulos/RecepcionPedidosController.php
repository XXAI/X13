<?php

namespace App\Http\Controllers\API\Modulos;

use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;

use App\Http\Controllers\Controller;

use App\Http\Requests;

use DB;

use App\Models\Pedido;
use App\Models\UnidadMedica;
use App\Models\Movimiento;
use App\Models\Stock;
use App\Models\Proveedor;

class RecepcionPedidosController extends Controller
{

    public function datosCatalogo(Request $request){
        try{
            $data = [];
            $parametros = $request->all();

            if(isset($parametros['pedido_id']) && $parametros['pedido_id']){
                $pedido = Pedido::with('unidadMedica.almacenes')->find($parametros['pedido_id']);
                if($pedido){
                    $data['almacenes'] = $pedido->unidadMedica->almacenes;
                }
            }

            $data['proveedores'] = Proveedor::all();

            return response()->json(['data'=>$data],HttpResponse::HTTP_OK);
        }catch(\Exception $e){
            return response()->json(['error'=>['message'=>$e->getMessage(),'line'=>$e->getLine()]], HttpResponse::HTTP_CONFLICT);
        }
    }
    
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        try{
            $parametros = $request->all();
            $access_data = $this->getUserAccessData();

            $pedidos = Pedido::with('avanceRecepcion');

            if(!$access_data->is_superuser){
                $pedidos = $pedidos->whereIn('unidad_medica_id',$access_data->lista_unidades_ids);
            }
            
            //Filtros, busquedas, ordenamiento
            if(isset($parametros['query']) && $parametros['query']){
                $pedidos = $pedidos->where(function($query)use($parametros){
                    return $query->where('folio','LIKE','%'.$parametros['query'].'%')
                                ->orWhere('descripcion','LIKE','%'.$parametros['query'].'%')
                                ->orWhere('observaciones','LIKE','%'.$parametros['query'].'%');
                });
            }
            
            $pedidos = $pedidos->orderBy('updated_at','desc')->whereIn('estatus',['PUB']);

            if(isset($parametros['page'])){
                $resultadosPorPagina = isset($parametros["per_page"])? $parametros["per_page"] : 20;
                $pedidos = $pedidos->paginate($resultadosPorPagina);

            } else {
                $pedidos = $pedidos->get();
            }

            return response()->json(['data'=>$pedidos],HttpResponse::HTTP_OK);
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
    public function show($id)
    {
        try{
            $pedido = Pedido::with(['tipoElementoPedido','unidadMedica','programa','avanceRecepcion','listaUnidadesMedicas.unidadMedica','recepcionActual.listaArticulosBorrador',
                                    'recepcionesAnteriores' => function($recepciones){
                                        $recepciones->with('proveedor','almacen');
                                    },
                                    'listaArticulos' => function($articulos){
                                        $articulos->with(['articulo'=>function($articulo){
                                                                        $articulo->leftJoin('familias','familias.id','=','bienes_servicios.familia_id')
                                                                                ->select('bienes_servicios.*','familias.nombre as nombre_familia');
                                                                    },'articulo.partidaEspecifica'])
                                                ->select('pedidos_lista_articulos.*',DB::raw('sum(movimientos_articulos.cantidad) as cantidad_recibida'))
                                                ->leftjoin('rel_movimientos_pedidos','rel_movimientos_pedidos.pedido_id','=','pedidos_lista_articulos.pedido_id')
                                                ->leftjoin('movimientos_articulos',function($join){
                                                    $join->on('movimientos_articulos.movimiento_id','=','rel_movimientos_pedidos.movimiento_id')
                                                            ->whereNull('movimientos_articulos.deleted_at')
                                                            ->on('movimientos_articulos.bien_servicio_id','=','pedidos_lista_articulos.bien_servicio_id');
                                                })
                                                ->groupBy('pedidos_lista_articulos.bien_servicio_id')
                                                ->orderBy('pedidos_lista_articulos.id');
                                    }])->find($id);

            $return_data = ['data'=>$pedido];

            return response()->json($return_data,HttpResponse::HTTP_OK);
        }catch(\Exception $e){
            return response()->json(['error'=>['message'=>$e->getMessage(),'line'=>$e->getLine()]], HttpResponse::HTTP_CONFLICT);
        }
    }

    public function listaArticulosRecepcion($id){
        try{
            $recepcion = Movimiento::with(['listaArticulos.stock','almacen'])->find($id);

            $return_data = ['data'=>$recepcion];

            return response()->json($return_data,HttpResponse::HTTP_OK);
        }catch(\Exception $e){
            return response()->json(['error'=>['message'=>$e->getMessage(),'line'=>$e->getLine()]], HttpResponse::HTTP_CONFLICT);
        }
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        try{
            DB::beginTransaction();

            $loggedUser = auth()->userOrFail();

            $parametros = $request->all();

            $pedido = Pedido::with(['listaArticulos','avanceRecepcion','recepcionActual.listaArticulosBorrador'])->find($id); 

            if(isset($pedido->recepcionActual[0])){
                $pedido->recepcionActual[0]->almacen_id = $parametros['recepcion']['almacen_id'];
                $pedido->recepcionActual[0]->fecha_movimiento = $parametros['recepcion']['fecha_movimiento'];
                $pedido->recepcionActual[0]->entrega = $parametros['recepcion']['entrega'];
                $pedido->recepcionActual[0]->recibe = $parametros['recepcion']['recibe'];
                $pedido->recepcionActual[0]->total_claves = $parametros['avance']['total_claves'];
                $pedido->recepcionActual[0]->total_articulos = $parametros['avance']['total_articulos'];
                $pedido->recepcionActual[0]->save();

                $recepcion_actual = $pedido->recepcionActual[0];
            }else{
                $movimiento_data = [
                    'almacen_id' => $parametros['recepcion']['almacen_id'],
                    'direccion_movimiento' => 'ENT',
                    'estatus' => 'RP-BR',
                    'fecha_movimiento' => $parametros['recepcion']['fecha_movimiento'],
                    'programa_id' => $pedido->programa_id,
                    'entrega' => $parametros['recepcion']['entrega'],
                    'recibe' => $parametros['recepcion']['recibe'],
                    'folio' => $pedido->folio,
                    'descripcion' => 'Recepción de pedido',
                    'total_claves' => $parametros['avance']['total_claves'],
                    'total_articulos' => $parametros['avance']['total_articulos'],
                    'user_id' => $loggedUser->id
                ];
                $recepcion_actual = Movimiento::create($movimiento_data);
                $pedido->recepcionActual()->attach($recepcion_actual);
            }
            $suma_recepciones = [];

            if(!$parametros['concluir']){
                //MovmientosInsumosBorrador
                $articulos_guardados = [];
                if(count($recepcion_actual->listaArticulosBorrador)){
                    foreach ($recepcion_actual->listaArticulosBorrador as $articulo) {
                        $articulos_guardados[$articulo->id] = $articulo;
                    }
                }

                $listado_articulos = $parametros['articulos_recibidos'];
                $crear_articulos_borrador = [];
                $editar_articulos_borrador = [];
                $eliminar_articulos_borrador = [];

                foreach ($listado_articulos as $articulo) {
                    if(!$articulo['id']){
                        $crear_articulos_borrador[] = [
                            'bien_servicio_id' => $articulo['bien_servicio_id'],
                            'direccion_movimiento' => 'ENT',
                            'modo_movimiento' => 'NRM',
                            'cantidad' => $articulo['cantidad'],
                            'lote' => $articulo['lote'],
                            'fecha_caducidad' => $articulo['fecha_caducidad'],
                            'codigo_barras' => $articulo['codigo_barras'],
                            'user_id' => $loggedUser->id
                        ];
                    }else{
                        $articulo_editar = $articulos_guardados[$articulo['id']];
                        $articulo_editar->cantidad = $articulo['cantidad'];
                        $articulo_editar->lote = $articulo['lote'];
                        $articulo_editar->fecha_caducidad = $articulo['fecha_caducidad'];
                        $articulo_editar->codigo_barras = $articulo['codigo_barras'];

                        $editar_articulos_borrador[] = $articulo_editar;
                        unset($articulos_guardados[$articulo['id']]);
                    }
                }

                if(count($articulos_guardados)){
                    $eliminar_articulos_borrador = array_keys($articulos_guardados);
                }

                if(count($crear_articulos_borrador)){
                    $recepcion_actual->listaArticulosBorrador()->createMany($crear_articulos_borrador);
                }

                if(count($editar_articulos_borrador)){
                    $recepcion_actual->listaArticulosBorrador()->saveMany($editar_articulos_borrador);
                }

                if(count($eliminar_articulos_borrador)){
                    $recepcion_actual->listaArticulosBorrador()->whereIn('id',$eliminar_articulos_borrador)->delete();
                }
            }else{
                //MovimientoArticulos y Stock
                //creando estructura con stocks
                $listado_articulos = $parametros['articulos_recibidos'];
                foreach ($listado_articulos as $articulo) {
                    if(!isset($articulo['marca_id'])){
                        $articulo['marca_id'] = null;
                    }

                    $stock = Stock::where('almacen_id',$recepcion_actual->almacen_id)
                                    ->where('bienes_servicios_id',$articulo['bien_servicio_id'])
                                    ->where('programa_id',$recepcion_actual->programa_id)
                                    ->where('marca_id',$articulo['marca_id'])
                                    ->where('lote',$articulo['lote'])
                                    ->where('fecha_caducidad',$articulo['fecha_caducidad'])
                                    ->where('codigo_barras',$articulo['codigo_barras'])
                                    ->first();

                    if($stock){
                        $stock->existencia += $articulo['cantidad'];
                        $stock->save();
                    }else{
                        $stock = Stock::create([
                            'almacen_id'    => $recepcion_actual->almacen_id,
                            'bienes_servicios_id'  => $articulo['bien_servicio_id'],
                            'programa_id'   => $recepcion_actual->programa_id,
                            'marca_id'  => $articulo['marca_id'],
                            'lote'  => $articulo['lote'],
                            'fecha_caducidad'   => $articulo['fecha_caducidad'],
                            'codigo_barras' => $articulo['codigo_barras'],
                            'user_id' => $loggedUser->id,
                            'existencia' => $articulo['cantidad']
                        ]);
                    }

                    $recepcion_actual->listaArticulos()->create([
                        'stock_id' => $stock->id,
                        'bien_servicio_id' => $articulo['bien_servicio_id'],
                        'direccion_movimiento' => 'EN',
                        'modo_movimiento' => 'NRM',
                        'cantidad' => $articulo['cantidad'],
                        'user_id' => $loggedUser->id,
                    ]);
                }
                $recepcion_actual->estatus = 'RP-FI';
                $recepcion_actual->save();

                $pedido->load(['recepcionesAnteriores' => function($recepciones){
                    $recepciones->select('movimientos.id',DB::raw('COUNT(distinct movimientos_articulos.bien_servicio_id) as total_claves'), DB::raw('SUM(movimientos_articulos.cantidad) as total_articulos'),
                                        DB::raw('MAX(fecha_movimiento) as ultimo_movimiento'))
                                ->leftjoin('movimientos_articulos','movimientos.id','=','movimientos_articulos.movimiento_id')
                                ->whereNull('movimientos_articulos.deleted_at')
                                ->groupBy('rel_movimientos_pedidos.pedido_id');
                }]);
                $suma_recepciones = $pedido->recepcionesAnteriores;
                //
                $porcentaje_claves  = round((($suma_recepciones[0]->total_claves/$pedido->total_claves)*100),2);
                $porcentaje_articulos = round((($suma_recepciones[0]->total_articulos/$pedido->total_articulos)*100),2);
                $datos_avance = [
                    'total_claves_recibidas'        => $suma_recepciones[0]->total_claves,
                    'porcentaje_claves'             => $porcentaje_claves,
                    'total_articulos_recibidos'     => $suma_recepciones[0]->total_articulos,
                    'porcentaje_articulos'          => $porcentaje_articulos,
                    'porcentaje_total'              => round(($porcentaje_articulos+$porcentaje_claves)/2,2),
                    'fecha_ultima_entrega'          => $suma_recepciones[0]->ultimo_movimiento
                ];

                if($pedido->avanceRecepcion){
                    $pedido->avanceRecepcion()->update($datos_avance);
                }else{
                    $datos_avance['fecha_primer_entrega'] = $suma_recepciones[0]->ultimo_movimiento;
                    $pedido->avanceRecepcion()->create($datos_avance);
                }
            }
            
            DB::commit();

            //$pedido = Pedido::with(['listaArticulos','avanceRecepcion','recepcionActual.listaArticulosBorrador'])->find($id); 
            $return_data = [];
            if(!$parametros['concluir']){
                $pedido->load('avanceRecepcion','recepcionActual.listaArticulosBorrador');
                $return_data['data'] = $pedido;
            }else{
                $recepcion_actual->load('proveedor','almacen');

                $pedido->load('avanceRecepcion'); //Agregar Recepcion Anterior
                $return_data['data'] = $pedido;
                $return_data['recepcion_reciente'] = $recepcion_actual;
            }

            return response()->json($return_data,HttpResponse::HTTP_OK);
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
    public function destroy($id)
    {
        //
    }

    private function getUserAccessData($loggedUser = null){
        if(!$loggedUser){
            $loggedUser = auth()->userOrFail();
        }
        
        //$loggedUser->load('perfilCr');
        $loggedUser->load('grupos.unidadesMedicas','grupos.unidadMedicaPrincipal');
        
        $lista_unidades_id = [];
        foreach ($loggedUser->grupos as $grupo) {
            $lista_unidades = $grupo->unidadesMedicas->pluck('id')->all();
            
            $lista_unidades_id = array_merge($lista_unidades_id,$lista_unidades);
        }

        $accessData = (object)[];
        $accessData->grupo_pedidos = $loggedUser->grupos[0];
        $accessData->lista_unidades_ids = $lista_unidades_id;
        $accessData->is_superuser = $loggedUser->is_superuser;

        /*if (\Gate::allows('has-permission', \Permissions::ADMIN_PERSONAL_ACTIVO)){
            $accessData->is_admin = true;
        }else{
            $accessData->is_admin = false;
        }*/

        return $accessData;
    }
}
