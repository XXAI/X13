<?php

namespace App\Http\Controllers\API\Modulos;

use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;

use App\Http\Controllers\Controller;

use App\Http\Requests;

use DB;

use App\Models\BienServicio;
use App\Models\BienServicioEmpaqueDetalle;
use App\Models\Familia;
use App\Models\PartidaEspecifica;
use App\Models\TipoBienServicio;
use App\Models\Empaque;
use App\Models\UnidadMedida;
use App\Models\UnidadMedica;
use App\Models\Almacen;
use App\Models\Stock;
use App\Models\MovimientoArticulo;
use Response, Validator;

class AlmacenAjustesController extends Controller{

    public function loteMovimientos(Request $request, $id){
        try{
            $loggedUser = auth()->userOrFail();
            $parametros = $request->all();

            $lotes = MovimientoArticulo::select('movimientos_articulos.id','movimientos_articulos.cantidad','movimientos_articulos.modo_movimiento','movimientos_articulos.direccion_movimiento','movimientos.folio','catalogo_tipos_movimiento.descripcion as tipo_movimiento','movimientos.fecha_movimiento',
                                        'almacen_movimiento.nombre as almacen_movimiento','unidad_movimiento.nombre as unidad_movimiento','area_servicio_movimiento.descripcion as area_servicio_movimiento','catalogo_tipos_solicitud.descripcion as tipo_solicitud')
                            ->leftJoin('movimientos','movimientos.id','=','movimientos_articulos.movimiento_id')
                            ->leftJoin('catalogo_tipos_movimiento','catalogo_tipos_movimiento.id','=','movimientos.tipo_movimiento_id')
                            ->leftJoin('almacenes as almacen_movimiento','almacen_movimiento.id','=','movimientos.almacen_movimiento_id')
                            ->leftJoin('catalogo_unidades_medicas as unidad_movimiento','unidad_movimiento.id','=','movimientos.unidad_medica_movimiento_id')
                            ->leftJoin('catalogo_areas_servicios as area_servicio_movimiento','area_servicio_movimiento.id','=','movimientos.area_servicio_movimiento_id')
                            ->leftJoin('solicitudes','solicitudes.id','=','movimientos.solicitud_id')
                            ->leftJoin('catalogo_tipos_solicitud','catalogo_tipos_solicitud.id','=','solicitudes.tipo_solicitud_id')
                            ->where('movimientos_articulos.stock_id',$id)
                            ->groupBy('movimientos_articulos.id')
                            ->orderBy('movimientos.fecha_movimiento')
                            ->get();
            //
            return response()->json(['data'=>$lotes],HttpResponse::HTTP_OK);
        }catch(\Exception $e){
            return response()->json(['error'=>['message'=>$e->getMessage(),'line'=>$e->getLine()]], HttpResponse::HTTP_CONFLICT);
        }
    }

    public function articuloLotes(Request $request){
        try{
            $loggedUser = auth()->userOrFail();
            $parametros = $request->all();

            $almacen = Almacen::find($parametros['almacen']);

            $articulo = BienServicio::datosDescripcion($loggedUser->unidad_medica_asignada_id)->with(['empaqueDetalle'=>function($detalle){ $detalle->with('unidadMedida','empaque')->withTrashed(); }])->withTrashed()->find($parametros['articulo']);

            $lotes = Stock::select('stocks.*', DB::raw('COUNT(DISTINCT movimientos_articulos.id) as movimientos'))
                            ->leftJoin('movimientos_articulos','movimientos_articulos.stock_id','=','stocks.id')
                            ->groupBy('stocks.id')
                            /*->where(function($where){
                                $where->where('stocks.existencia','>=',0)->orWhere('stocks.existencia_unidades','>=',0);
                            })*/
                            ->where('stocks.bien_servicio_id',$parametros['articulo'])
                            ->where('stocks.almacen_id',$parametros['almacen'])
                            ->get();
            
            $return_data = [
                'almacen' => $almacen,
                'articulo' => $articulo,
                'lotes' => $lotes,
            ];

            return response()->json(['data'=>$return_data],HttpResponse::HTTP_OK);
        }catch(\Exception $e){
            return response()->json(['error'=>['message'=>$e->getMessage(),'line'=>$e->getLine()]], HttpResponse::HTTP_CONFLICT);
        }
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function listaArticulos(Request $request){
        try{
            $loggedUser = auth()->userOrFail();
            $parametros = $request->all();

            /*if(!\Gate::denies('has-permission', 'vPZUt02ZCcGoNuxDlfOCETTjJAobvJvO')){
                $parametros['buscar_catalogo_completo'] = true;
            }*/

            if($loggedUser->is_superuser){
                $almacenes_ids = Almacen::where('unidad_medica_id',$loggedUser->unidad_medica_asignada_id)->get()->pluck('id');
            }else{
                $almacenes_ids = $loggedUser->almacenes()->pluck('almacen_id');
            }

            $lista_articulos = Stock::select(DB::raw("almacenes.nombre as almacen"),'stocks.almacen_id', //DB::raw("IF(COUNT(DISTINCT stocks.almacen_id) = 1,almacenes.nombre,CONCAT('En ',COUNT(DISTINCT stocks.almacen_id),' Almacen(es)')) as almacen")
                                            DB::raw("CONCAT('En ',COUNT(DISTINCT stocks.programa_id),' Programa(s)') as programa"),"stocks.bien_servicio_id as id",'catalogo_tipos_bien_servicio.descripcion AS tipo_bien_servicio', 
                                            DB::raw("IF(bienes_servicios.clave_local is not null,bienes_servicios.clave_local,bienes_servicios.clave_cubs) as clave"),
                                            "bienes_servicios.articulo as articulo","bienes_servicios.especificaciones as especificaciones","bienes_servicios.puede_surtir_unidades",
                                            DB::raw("SUM(stocks.existencia_unidades) as existencias"))
                                    ->leftJoin("bienes_servicios", "bienes_servicios.id","=","stocks.bien_servicio_id")
                                    ->leftJoin('catalogo_tipos_bien_servicio','catalogo_tipos_bien_servicio.id','bienes_servicios.tipo_bien_servicio_id')
                                    ->leftJoin("almacenes","almacenes.id","=","stocks.almacen_id")
                                    ->leftJoin("programas","programas.id","=","stocks.programa_id")
                                    ->leftJoin("familias","familias.id","=","bienes_servicios.familia_id")
                                    ->where('stocks.unidad_medica_id',$loggedUser->unidad_medica_asignada_id)
                                    ->whereIn('stocks.almacen_id',$almacenes_ids)
                                    ->groupBy('stocks.bien_servicio_id')
                                    ->groupBy('stocks.almacen_id');
            
            //Filtros, busquedas, ordenamiento
            if(isset($parametros['query']) && $parametros['query']){
                $lista_articulos = $lista_articulos->where(function($query)use($parametros){
                    return $query->where('stocks.lote','LIKE','%'.$parametros['query'].'%')
                                ->orWhere('catalogo_tipos_bien_servicio.descripcion','LIKE','%'.$parametros['query'].'%')
                                ->orWhere('bienes_servicios.clave_cubs','LIKE','%'.$parametros['query'].'%')
                                ->orWhere('bienes_servicios.clave_local','LIKE','%'.$parametros['query'].'%')
                                ->orWhere('bienes_servicios.articulo','LIKE','%'.$parametros['query'].'%')
                                ->orWhere('bienes_servicios.especificaciones','LIKE','%'.$parametros['query'].'%');
                });
                $params['incluir_existencias_cero'] = true;
            }

            if(isset($params['incluir_existencias_cero']) && $params['incluir_existencias_cero']){
                $lista_articulos = $lista_articulos->where(function($where){
                    $where->where('stocks.existencia','>=',0);
                });
            }else{
                $lista_articulos = $lista_articulos->where(function($where){
                    $where->where('stocks.existencia','>',0)->orWhere('existencia_unidades','>',0);
                });
            }

            if(isset($parametros['page'])){
                $resultadosPorPagina = isset($parametros["per_page"])? $parametros["per_page"] : 20;
                $lista_articulos = $lista_articulos->paginate($resultadosPorPagina);
            } else {
                $lista_articulos = $lista_articulos->get();
            }

            return response()->json(['data'=>$lista_articulos],HttpResponse::HTTP_OK);
        }catch(\Exception $e){
            return response()->json(['error'=>['message'=>$e->getMessage(),'line'=>$e->getLine()]], HttpResponse::HTTP_CONFLICT);
        }
    }

    public function guardarCambiosLote(Request $request,$id){
        try{
            $loggedUser = auth()->userOrFail();
            $parametros = $request->all();

            /*if(!\Gate::denies('has-permission', 'vPZUt02ZCcGoNuxDlfOCETTjJAobvJvO')){
                $parametros['buscar_catalogo_completo'] = true;
            }*/

            $stock = Stock::find($id);

            DB::beginTransaction();

            $stock->codigo_barras = $parametros['codigo_barras'];
            if(isset($parametros['empaque_detalle_id']) && $parametros['empaque_detalle_id'] && $stock->empaque_detalle_id != $parametros['empaque_detalle_id']){
                $viejo_empaque = BienServicioEmpaqueDetalle::where('bien_servicio_id',$stock->bien_servicio_id)->where('id',$stock->empaque_detalle_id)->first();
                $nuevo_empaque = BienServicioEmpaqueDetalle::where('bien_servicio_id',$stock->bien_servicio_id)->where('id',$parametros['empaque_detalle_id'])->first();

                if(!$viejo_empaque){
                    DB::rollback();
                    return response()->json(['error'=>'No se encontraron los detalles con id: '.$stock->empaque_detalle_id.' del articulo'],HttpResponse::HTTP_OK);
                }
                
                if(!$nuevo_empaque){
                    DB::rollback();
                    return response()->json(['error'=>'No se encontraron los detalles con id: '.$parametros['empaque_detalle_id'].' del articulo'],HttpResponse::HTTP_OK);
                }

                if($viejo_empaque->piezas_x_empaque != $nuevo_empaque->piezas_x_empaque){
                    $suma_entradas = MovimientoArticulo::select(DB::raw('SUM(movimientos_articulos.cantidad) as cantidad'))
                                                    ->leftJoin('movimientos','movimientos.id','=','movimientos_articulos.movimiento_id')
                                                    ->where('movimientos.estatus','FIN')
                                                    ->where('movimientos.direccion_movimiento','ENT')
                                                    ->where('movimientos_articulos.stock_id',$stock->id)
                                                    ->groupBy('movimientos_articulos.stock_id')
                                                    ->first();
                    if($stock->existencia_unidades){
                        if($stock->existencia_unidades < $viejo_empaque->piezas_x_empaque){
                            $piezas_extra = $stock->existencia_unidades;
                        }else{
                            $piezas_extra = $stock->existencia_unidades - ( $stock->existencia * $viejo_empaque->piezas_x_empaque );
                        }
                        
                        $stock->existencia_unidades = ($stock->existencia * $nuevo_empaque->piezas_x_empaque) + $piezas_extra;
                    }else{
                        $stock->existencia_unidades = ($stock->existencia * $nuevo_empaque->piezas_x_empaque);
                    }
                }

                $stock->empaque_detalle_id = $parametros['empaque_detalle_id'];
            }
            $stock->save();

            DB::commit();

            $stock = Stock::select('stocks.*', DB::raw('COUNT(DISTINCT movimientos_articulos.id) as movimientos'))
                        ->leftJoin('movimientos_articulos','movimientos_articulos.stock_id','=','stocks.id')
                        ->groupBy('stocks.id')
                        ->where('stocks.id',$id)
                        ->first();

            return response()->json(['data'=>$stock],HttpResponse::HTTP_OK);
        }catch(\Exception $e){
            DB::rollback();
            return response()->json(['error'=>['message'=>$e->getMessage(),'line'=>$e->getLine()]], HttpResponse::HTTP_CONFLICT);
        }
    }
}
