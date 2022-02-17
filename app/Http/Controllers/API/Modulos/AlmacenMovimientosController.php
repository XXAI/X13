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
use App\Models\Marca;
use App\Models\AreaServicio;
use App\Models\BienServicio;

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
                'marcas'            => Marca::getModel(),
                'areas_servicios'   => AreaServicio::getModel(),
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

            //if($loggedUser->is_superuser){
            $parametros['buscar_catalogo_completo'] = true;
            //}

            $unidad_medica_id = $loggedUser->unidad_medica_asignada_id;

            $stock_existencias = BienServicio::select('stocks.*','bienes_servicios.id AS articulo_id','bienes_servicios.clave_partida_especifica','bienes_servicios.familia_id','bienes_servicios.clave_cubs',
                                                    'bienes_servicios.clave_local','bienes_servicios.articulo','bienes_servicios.especificaciones','bienes_servicios.descontinuado',
                                                    'bienes_servicios.tiene_fecha_caducidad','cog_partidas_especificas.descripcion AS partida_especifica','familias.nombre AS familia',
                                                    'programas.descripcion AS programa','almacenes.nombre AS almacen','unidad_medica_catalogo_articulos.es_indispensable','catalogo_marcas.nombre AS marca',
                                                    'unidad_medica_catalogo_articulos.cantidad_minima','unidad_medica_catalogo_articulos.cantidad_maxima','unidad_medica_catalogo_articulos.id AS en_catalogo_unidad',
                                                    'bienes_servicios.tipo_bien_servicio_id','catalogo_tipos_bien_servicio.descripcion AS tipo_bien_servicio','catalogo_tipos_bien_servicio.clave_form')
                                                ->orderBy('stocks.existencia','DESC')
                                                ->orderBy('stocks.fecha_caducidad','DESC')
                                                ->orderBy('unidad_medica_catalogo_articulos.id','DESC')
                                                ->orderBy('bienes_servicios.especificaciones')
                                                ;
            
            if(isset($parametros['buscar_solo_stock']) && $parametros['buscar_solo_stock']){
                $stock_existencias = $stock_existencias->join('stocks',function($join)use($unidad_medica_id,$parametros){
                                                    return $join->on('stocks.bien_servicio_id','=','bienes_servicios.id')
                                                                ->where('stocks.unidad_medica_id',$unidad_medica_id)
                                                                ->where('stocks.existencia','>',0)
                                                                ->where('stocks.programa_id',$parametros['programa_id'])
                                                                ->where('stocks.almacen_id',$parametros['almacen_id']);
                                                });
            }else{
                $stock_existencias = $stock_existencias->leftjoin('stocks',function($join)use($unidad_medica_id,$parametros){
                                                    return $join->on('stocks.bien_servicio_id','=','bienes_servicios.id')
                                                                ->where('stocks.unidad_medica_id',$unidad_medica_id)
                                                                ->where('stocks.existencia','>',0)
                                                                ->where('stocks.programa_id',$parametros['programa_id'])
                                                                ->where('stocks.almacen_id',$parametros['almacen_id']);
                                                });
            }

            $stock_existencias = $stock_existencias->leftjoin('catalogo_tipos_bien_servicio','catalogo_tipos_bien_servicio.id','=','bienes_servicios.tipo_bien_servicio_id')
                                                    ->leftjoin('cog_partidas_especificas','cog_partidas_especificas.clave','=','bienes_servicios.clave_partida_especifica')
                                                    ->leftjoin('familias','familias.id','=','bienes_servicios.familia_id')
                                                    ->leftjoin('programas','programas.id','=','stocks.programa_id')
                                                    ->leftjoin('almacenes','almacenes.id','=','stocks.almacen_id')
                                                    ->leftjoin('catalogo_marcas','catalogo_marcas.id','=','stocks.marca_id');

            /*$stock_existencias = Stock::select('stocks.*','bienes_servicios.id AS articulo_id','bienes_servicios.clave_partida_especifica','bienes_servicios.familia_id','bienes_servicios.clave_cubs',
                                                'bienes_servicios.clave_local','bienes_servicios.articulo','bienes_servicios.especificaciones','bienes_servicios.descontinuado',
                                                'bienes_servicios.tiene_fecha_caducidad','cog_partidas_especificas.descripcion AS partida_especifica','familias.nombre AS familia',
                                                'programas.descripcion AS programa','almacenes.nombre AS almacen','unidad_medica_catalogo_articulos.es_indispensable',
                                                'unidad_medica_catalogo_articulos.cantidad_minima','unidad_medica_catalogo_articulos.cantidad_maxima','unidad_medica_catalogo_articulos.id AS en_catalogo_unidad',
                                                'bienes_servicios.tipo_bien_servicio_id','catalogo_tipos_bien_servicio.descripcion AS tipo_bien_servicio','catalogo_tipos_bien_servicio.clave_form')
                                                //DB::raw('count(distinct stocks.id) as total_lotes'), DB::raw('SUM(stocks.existencia) as existencias'))
                                        ->leftJoin('bienes_servicios','bienes_servicios.id','=','stocks.bien_servicio_id')
                                        ->leftjoin('catalogo_tipos_bien_servicio','catalogo_tipos_bien_servicio.id','=','bienes_servicios.tipo_bien_servicio_id')
                                        ->leftjoin('cog_partidas_especificas','cog_partidas_especificas.clave','=','bienes_servicios.clave_partida_especifica')
                                        ->leftjoin('familias','familias.id','=','bienes_servicios.familia_id')
                                        ->leftjoin('programas','programas.id','=','stocks.programa_id')
                                        ->leftjoin('almacenes','almacenes.id','=','stocks.almacen_id')
                                        ->where('stocks.unidad_medica_id',$unidad_medica_id)
                                        ->where('stocks.existencia','>',0)
                                        ->with('marca')
                                        //->groupBy('stocks.bien_servicio_id')
                                        ->orderBy('bienes_servicios.especificaciones');*/

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

            /*if(isset($parametros['programa_id']) && $parametros['programa_id']){
                $stock_existencias = $stock_existencias->where('stocks.programa_id',$parametros['programa_id']);
            }

            if(isset($parametros['almacen_id']) && $parametros['almacen_id']){
                $stock_existencias = $stock_existencias->where('stocks.almacen_id',$parametros['almacen_id']);
            }*/

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

            $resultado_stock = [];
            $control_articulos = [];
            $index_articulo;
            foreach ($stock_existencias as $key => $value) {
                if(!isset($control_articulos[$value->articulo_id])){
                    $control_articulos[$value->articulo_id] = count($resultado_stock);
                    $resultado_stock[] = [
                        'id' => $value->articulo_id,
                        'clave_partida_especifica' => $value->clave_partida_especifica,
                        'familia_id' => $value->familia_id,
                        'clave_cubs' => $value->clave_cubs,
                        'clave_local' => $value->clave_local,
                        'articulo' => $value->articulo,
                        'especificaciones' => $value->especificaciones,
                        'descontinuado' => $value->descontinuado,
                        'tiene_fecha_caducidad' => $value->tiene_fecha_caducidad,
                        'tipo_bien_servicio' => $value->tipo_bien_servicio,
                        'clave_form' => $value->clave_form,
                        'partida_especifica'=>$value->partida_especifica,
                        'familia' => $value->familia,
                        'es_indispensable' => $value->es_indispensable,
                        'cantidad_minima' => $value->cantidad_minima,
                        'cantidad_maxima' => $value->cantidad_maxima,
                        'en_catalogo_unidad' => $value->en_catalogo_unidad,
                        'total_lotes' => 0,
                        'existencias' => 0,
                    ];
                }
                $index_articulo = $control_articulos[$value->articulo_id];

                if($value->id){
                    if(isset($parametros['programa_id']) && $parametros['programa_id']){
                        if(!isset($resultado_stock[$index_articulo]['lotes'])){
                            $resultado_stock[$index_articulo]['lotes'] = [];
                        }
    
                        $resultado_stock[$index_articulo]['lotes'][] = [
                            'id' => $value->id,
                            'lote' => $value->lote,
                            'fecha_caducidad' => $value->fecha_caducidad,
                            'codigo_barras' => $value->codigo_barras,
                            'no_serie' => $value->no_serie,
                            'modelo' => $value->modelo,
                            'marca_id' => $value->marca_id,
                            'marca' => $value->marca,
                            'existencia' => $value->existencia,
                        ];
                    }else{
                        if(!isset($resultado_stock[$index_articulo]['programa_lotes'])){
                            $resultado_stock[$index_articulo]['programa_lotes'] = [];
                        }
    
                        $programa_id = ($value->programa_id)?$value->programa_id:'S/P';
                        if(!isset($resultado_stock[$index_articulo]['programa_lotes'][$programa_id])){
                            $resultado_stock[$index_articulo]['programa_lotes'][$programa_id] = [
                                'id' => $programa_id,
                                'nombre' => ($value->programa_id)?$value->programa:'Sin Programa',
                                'lotes' => []
                            ];
                        }
    
                        $resultado_stock[$index_articulo]['programa_lotes'][$programa_id]['lotes'][] = [
                            'id' => $value->id,
                            'lote' => $value->lote,
                            'fecha_caducidad' => $value->fecha_caducidad,
                            'codigo_barras' => $value->codigo_barras,
                            'no_serie' => $value->no_serie,
                            'modelo' => $value->modelo,
                            'marca_id' => $value->marca_id,
                            'marca' => $value->marca,
                            'existencia' => $value->existencia,
                        ];
                    }
                    $resultado_stock[$index_articulo]['total_lotes']++;
                    $resultado_stock[$index_articulo]['existencias'] += $value->existencia;
                }
            }

            if(!(isset($parametros['programa_id']) && $parametros['programa_id'])){
                foreach ($resultado_stock as $key => $value) {
                    $resultado_stock[$key]['programa_lotes'] = array_values($resultado_stock[$key]['programa_lotes']);
                }
            }
            
            return response()->json(['data'=>$resultado_stock],HttpResponse::HTTP_OK);
        }catch(\Exception $e){
            return response()->json(['error'=>['message'=>$e->getMessage(),'line'=>$e->getLine()]], HttpResponse::HTTP_CONFLICT);
        }
    }
}