<?php

namespace App\Http\Controllers\API\Modulos;

use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;

use App\Http\Controllers\Controller;

use App\Http\Requests;

use DB;

use App\Models\Almacen;
use App\Models\Programa;
use App\Models\Proveedor;
use App\Models\TipoMovimiento;
use App\Models\UnidadMedica;
use App\Models\Stock;

class AlmacenMovimientosController extends Controller{
    
    public function obtenerCatalogos(Request $request){
        try{
            $loggedUser = auth()->userOrFail();
            $parametros = $request->all();

            $config_catalogs = [
                'programas'         => Programa::getModel(),
                'almacenes'         => Almacen::where('unidad_medica_id',$loggedUser->unidad_medica_asignada_id),
                'unidades_medicas'  => UnidadMedica::getModel(),
                'proveedores'       => Proveedor::getModel(),
                'tipos_movimiento'  => TipoMovimiento::getModel(),
            ];

            $catalogos = [];
            foreach ($parametros as $key => $value) {
                $temp_cat = $config_catalogs[$key];

                if($value == '*'){
                    $catalogos[$key] = $temp_cat->get();
                }else{
                    $filter = explode('.',$value);
                    $catalogos[$key] = $temp_cat->where($filter[0],$filter[1])->get();
                }
            }

            return response()->json(['data'=>$catalogos],HttpResponse::HTTP_OK);
        }catch(\Exception $e){
            return response()->json(['error'=>['message'=>$e->getMessage(),'line'=>$e->getLine()]], HttpResponse::HTTP_CONFLICT);
        }
    }

    public function buscarStock(Request $request){
        try{
            $loggedUser = auth()->userOrFail();
            $parametros = $request->all();

            $unidad_medica_id = $loggedUser->unidad_medica_asignada_id;

            $stock_existencias = Stock::select('stocks.id','bienes_servicios.id AS articulo_id','bienes_servicios.clave_partida_especifica','bienes_servicios.familia_id','bienes_servicios.clave_cubs',
                                                'bienes_servicios.clave_local','bienes_servicios.articulo','bienes_servicios.especificaciones','bienes_servicios.descontinuado',
                                                'bienes_servicios.tiene_fecha_caducidad','cog_partidas_especificas.descripcion AS partida_especifica','familias.nombre AS familia',
                                                'programas.descripcion AS programa','almacenes.nombre AS almacen','unidad_medica_catalogo_articulos.es_indispensable',
                                                'unidad_medica_catalogo_articulos.cantidad_minima','unidad_medica_catalogo_articulos.cantidad_maxima','unidad_medica_catalogo_articulos.id AS en_catalogo_unidad',
                                                'stocks.lote','stocks.fecha_caducidad','stocks.codigo_barras','stocks.existencia')
                                        ->leftJoin('bienes_servicios','bienes_servicios.id','=','stocks.bienes_servicios_id')
                                        ->leftjoin('cog_partidas_especificas','cog_partidas_especificas.clave','=','bienes_servicios.clave_partida_especifica')
                                        ->leftjoin('familias','familias.id','=','bienes_servicios.familia_id')
                                        ->leftjoin('programas','programas.id','=','stocks.programa_id')
                                        ->leftjoin('almacenes','almacenes.id','=','stocks.almacen_id')
                                        ->where('stocks.unidad_medica_id',$unidad_medica_id)
                                        ->orderBy('bienes_servicios.especificaciones');

            if(isset($parametros['buscar_catalogo_completo']) && $parametros['buscar_catalogo_completo']){
                $stock_existencias = $stock_existencias->leftJoin('unidad_medica_catalogo_articulos',function($join)use($unidad_medica_id){
                    return $join->on('unidad_medica_catalogo_articulos.bien_servicio_id','=','bienes_servicios.id')
                        ->where('unidad_medica_catalogo_articulos.unidad_medica_id',$unidad_medica_id)
                        ->whereNull('unidad_medica_catalogo_articulos.deleted_at');
                });
            }else{
                $stock_existencias = $stock_existencias->join('unidad_medica_catalogo_articulos',function($join)use($unidad_medica_id){
                    return $join->on('unidad_medica_catalogo_articulos.bien_servicio_id','=','bienes_servicios.id')
                        ->where('unidad_medica_catalogo_articulos.unidad_medica_id',$unidad_medica_id)
                        ->whereNull('unidad_medica_catalogo_articulos.deleted_at');
                });
            }

            //Filtros, busquedas, ordenamiento
            if(isset($parametros['query']) && $parametros['query']){
                $stock_existencias = $stock_existencias->where(function($query)use($parametros){
                    return $query->where('cog_partidas_especificas.descripcion','LIKE','%'.$parametros['query'].'%')
                                ->orWhere('familias.nombre','LIKE','%'.$parametros['query'].'%')
                                ->orWhere('bienes_servicios.clave_cubs','LIKE','%'.$parametros['query'].'%')
                                ->orWhere('bienes_servicios.clave_local','LIKE','%'.$parametros['query'].'%')
                                ->orWhere('bienes_servicios.articulo','LIKE','%'.$parametros['query'].'%')
                                ->orWhere('bienes_servicios.especificaciones','LIKE','%'.$parametros['query'].'%')
                                ->orWhere('stocks.lote','LIKE','%'.$parametros['query'].'%')
                                ->orWhere('stocks.codigo_barras','LIKE','%'.$parametros['query'].'%');
                });
            }

            if(isset($parametros['familia_id']) && $parametros['familia_id']){
                $stock_existencias = $stock_existencias->where('bienes_servicios.familia_id',$parametros['familia_id']);
            }

            if(isset($parametros['clave_partida']) && $parametros['clave_partida']){
                $stock_existencias = $stock_existencias->where('bienes_servicios.clave_partida_especifica',$parametros['clave_partida']);
            }

            if(isset($parametros['con_caducidad']) && $parametros['con_caducidad']){
                $stock_existencias = $stock_existencias->where('bienes_servicios.tiene_fecha_caducidad',1);
            }

            if(isset($parametros['sin_caducidad']) && $parametros['sin_caducidad']){
                $stock_existencias = $stock_existencias->where('bienes_servicios.tiene_fecha_caducidad','!=',1);
            }

            if(isset($parametros['descontinuados']) && $parametros['descontinuados']){
                $stock_existencias = $stock_existencias->where('bienes_servicios.descontinuado',1);
            }

            if(isset($parametros['no_descontinuados']) && $parametros['no_descontinuados']){
                $stock_existencias = $stock_existencias->where('bienes_servicios.descontinuado','!=',1);
            }

            if(isset($parametros['indispensables']) && $parametros['indispensables']){
                $stock_existencias = $stock_existencias->where('unidad_medica_catalogo_articulos.es_indispensable',1);
            }

            if(isset($parametros['no_indispensables']) && $parametros['no_indispensables']){
                $stock_existencias = $stock_existencias->where('unidad_medica_catalogo_articulos.es_indispensable','!=',1);
            }

            if(isset($parametros['page'])){
                $resultadosPorPagina = isset($parametros["per_page"])? $parametros["per_page"] : 20;
                $stock_existencias = $stock_existencias->paginate($resultadosPorPagina);
            } else {
                $stock_existencias = $stock_existencias->get();
            }

            return response()->json(['data'=>$stock_existencias],HttpResponse::HTTP_OK);
        }catch(\Exception $e){
            return response()->json(['error'=>['message'=>$e->getMessage(),'line'=>$e->getLine()]], HttpResponse::HTTP_CONFLICT);
        }
    }
}