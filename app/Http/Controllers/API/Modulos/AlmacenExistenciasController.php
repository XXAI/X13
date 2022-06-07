<?php

namespace App\Http\Controllers\API\Modulos;

use App\Http\Controllers\Controller;

use Illuminate\Support\Facades\Http;

use Illuminate\Http\Response as HttpResponse;
use Illuminate\Http\Request;
use Response;
use Validator;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;

use App\Exports\DevReportExport;

use App\EDocs\EDoc;

use App\Models\Stock;
use App\Models\BienServicio;
use App\Models\TipoBienServicio;
use App\Models\Movimiento;
use App\Models\MovimientoArticulo;
use App\Models\Programa;
use App\Models\UnidadMedicaCatalogoArticulo;
use App\Models\Almacen;

class AlmacenExistenciasController extends Controller
{
    /**
     * Create a new DocumentosController instance.
     *
     * @return void
     */

     /*
    public function __construct() {
        $this->middleware('auth:api');
    }*/

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request){
        try{
            $loggedUser = auth()->userOrFail();
            $parametros = $request->all();

            /*if(!\Gate::denies('has-permission', 'vPZUt02ZCcGoNuxDlfOCETTjJAobvJvO')){
                $parametros['buscar_catalogo_completo'] = true;
            }*/

            $lista_articulos = $this->obtenerQueryListaArticulos($parametros, $loggedUser);
            
            if(isset($parametros['page'])){
                $resultadosPorPagina = isset($parametros["per_page"])? $parametros["per_page"] : 20;
                $lista_articulos = $lista_articulos->paginate($resultadosPorPagina);
            } else {
                $lista_articulos = $lista_articulos->get();
            }
            //return response()->json(['error'=>'asdf','data'=>$parametros],HttpResponse::HTTP_OK);
            return response()->json($lista_articulos,HttpResponse::HTTP_OK);
        }catch(\Exception $e){
            return response()->json(['error'=>['message'=>$e->getMessage(),'line'=>$e->getLine()]], HttpResponse::HTTP_CONFLICT);
        }
    }

    private function obtenerQueryListaArticulos($parametros, $loggedUser){
        $unidad_medica_id = $loggedUser->unidad_medica_asignada_id;

        if(isset($parametros['almacenes']) && $parametros['almacenes']){
            $almacenes_ids = explode('|',$parametros['almacenes']);
        }else if($loggedUser->is_superuser){
            $almacenes_ids = Almacen::where('unidad_medica_id',$loggedUser->unidad_medica_asignada_id)->get()->pluck('id');
        }else{
            $almacenes_ids = $loggedUser->almacenes()->pluck('almacen_id');
        }

        $stocks = Stock::select('stocks.bien_servicio_id AS id','catalogo_tipos_bien_servicio.descripcion AS tipo_bien_servicio', DB::raw("IF(bienes_servicios.clave_local is not null,bienes_servicios.clave_local,bienes_servicios.clave_cubs) AS clave"),
                                        "bienes_servicios.articulo AS articulo","bienes_servicios.especificaciones AS especificaciones","bienes_servicios.puede_surtir_unidades","bienes_servicios.descontinuado",'unidad_medica_catalogo_articulos.es_normativo',
                                        'unidad_medica_catalogo_articulos.cantidad_minima','unidad_medica_catalogo_articulos.cantidad_maxima','unidad_medica_catalogo_articulos.id AS en_catalogo_unidad','stocks.id as stock_id','stocks.lote','stocks.fecha_caducidad',
                                        DB::raw("COUNT(DISTINCT stocks.id) AS total_lotes"), DB::raw("SUM(stocks.existencia) AS existencia"), DB::raw("SUM(stocks.existencia_piezas) AS existencia_piezas"), 
                                        DB::raw('SUM(stocks.existencia_piezas % IF(ED.id,ED.piezas_x_empaque,1)) AS existencia_fraccion'),
                                        DB::raw("SUM(stocks.resguardo_piezas) AS resguardo_piezas"), DB::raw("SUM(stocks.resguardo_piezas / IF(ED.id,ED.piezas_x_empaque,1)) AS resguardo"), 
                                        DB::raw("SUM(stocks.resguardo_piezas % IF(ED.id,ED.piezas_x_empaque,1)) AS resguardo_fraccion"), DB::raw("SUM(stocks.existencia_piezas - IFNULL(stocks.resguardo_piezas,0)) AS existencia_filtro"))
                                ->leftJoin("bienes_servicios", "bienes_servicios.id","=","stocks.bien_servicio_id")
                                ->leftJoin("bienes_servicios_empaque_detalles AS ED", "ED.id","=","stocks.empaque_detalle_id")
                                ->leftJoin('catalogo_tipos_bien_servicio','catalogo_tipos_bien_servicio.id','bienes_servicios.tipo_bien_servicio_id')
                                ->leftJoin('unidad_medica_catalogo_articulos',function($join)use($unidad_medica_id){
                                    return $join->on('unidad_medica_catalogo_articulos.bien_servicio_id','=','bienes_servicios.id')
                                        ->where('unidad_medica_catalogo_articulos.unidad_medica_id',$unidad_medica_id)
                                        ->whereNull('unidad_medica_catalogo_articulos.deleted_at');
                                })
                                ->where('stocks.unidad_medica_id',$unidad_medica_id)
                                ->whereIn('stocks.almacen_id',$almacenes_ids)
                                ;
        
        if(isset($parametros['agrupar']) && $parametros['agrupar'] == 'batch'){
            $stocks = $stocks->groupBy('stocks.bien_servicio_id')->groupBy('stocks.lote')->groupBy('stocks.fecha_caducidad');
        }else{
            $stocks = $stocks->groupBy('stocks.bien_servicio_id');
        }

        if(isset($parametros['tipo_articulo']) && $parametros['tipo_articulo']){
            $stocks = $stocks->where('bienes_servicios.tipo_bien_servicio_id',$parametros['tipo_articulo']);
        }

        if(isset($parametros['catalogo_unidad']) && $parametros['catalogo_unidad']){
            switch ($parametros['catalogo_unidad']) {
                case 'in-catalog':
                    $stocks = $stocks->whereNotNull('unidad_medica_catalogo_articulos.id');
                    break;
                case 'non-normative':
                    $stocks = $stocks->where(function($where){
                        $where->whereNull('unidad_medica_catalogo_articulos.es_normativo')->orWhere('unidad_medica_catalogo_articulos.es_normativo','!=',1);
                    })->whereNotNull('unidad_medica_catalogo_articulos.id');
                    break;
                case 'normative':
                    $stocks = $stocks->where('unidad_medica_catalogo_articulos.es_normativo',1);
                    break;
                case 'outside':
                    $stocks = $stocks->whereNull('unidad_medica_catalogo_articulos.id');
                    break;
            }
        }

        //Filtros, busquedas, ordenamiento
        if(isset($parametros['query']) && $parametros['query']){
            $params_query = urldecode($parametros['query']);

            $search_queries = explode('+',$params_query);

            $stocks = $stocks->where(function($query)use($search_queries){
                for($i = 0; $i < count($search_queries); $i++){
                    $query_value = $search_queries[$i];
                    $query = $query->where(function($where)use($query_value){
                        return $where->where('bienes_servicios.clave_cubs','LIKE','%'.$query_value.'%')
                                        ->orWhere('bienes_servicios.clave_local','LIKE','%'.$query_value.'%')
                                        ->orWhere('bienes_servicios.articulo','LIKE','%'.$query_value.'%')
                                        ->orWhere('bienes_servicios.especificaciones','LIKE','%'.$query_value.'%')
                                        ->orWhere('stocks.lote','LIKE','%'.$query_value.'%')
                                        ->orWhere('catalogo_tipos_bien_servicio.descripcion','LIKE','%'.$query_value.'%');
                    });
                }
                return $query;
            });
            //$params['incluir_existencias_cero'] = true;
        }

        if(isset($parametros['existencias']) && $parametros['existencias']){
            switch ($parametros['existencias']) {
                case 'with-stock':
                    $stocks = $stocks->having('existencia_filtro','>',0);
                    /*$stocks = $stocks->where(function($where){
                        $where->where('stocks.existencia_piezas','>',0)->orWhere(DB::raw('stocks.existencia_piezas - stocks.resguardo_piezas'),'>',0);
                    });*/
                    break;
                case 'zero-stock':
                    $stocks = $stocks->having('existencia_filtro','=',0);
                    /*$stocks = $stocks->where(function($where){
                        $where->where('stocks.existencia_piezas','=',0)->orWhere(DB::raw('stocks.existencia_piezas - stocks.resguardo_piezas'),'=',0);
                    });*/
                    break;
            }
        }else if(!isset($parametros['query']) || !$parametros['query']){
            $stocks = $stocks->where(function($where){
                $where->where('stocks.existencia_piezas','>',0);
            });
        }

        return $stocks;
    }

     /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function catalogosExistencias(Request $request){
        try{
            $loggedUser = auth()->userOrFail();
            $catalogos = [];

            if($loggedUser->is_superuser){
                $catalogos['almacenes'] = Almacen::where('unidad_medica_id',$loggedUser->unidad_medica_asignada_id)->get();
            }else{
                $catalogos['almacenes'] = $loggedUser->almacenes;
            }

            $catalogos['tipos_bien_servicio'] = TipoBienServicio::all();

            return response()->json(['data'=>$catalogos],HttpResponse::HTTP_OK);
        }catch(\Exception $e){
            return response()->json(['error'=>['message'=>$e->getMessage(),'line'=>$e->getLine()]], HttpResponse::HTTP_CONFLICT);
        }
    }

    public function catalogoUnidadesAlmacenes(Request $request)
    {     
        $data = $this->getUserAccessData();
        return response()->json($data);
    }

    private function getUserAccessData($loggedUser = null){
        //I hate this SSADII
        $programas = Programa::all();

        if(!$loggedUser){
            $loggedUser = auth()->userOrFail();
        }
        $loggedUser->load('grupos.unidadesMedicas','grupos.unidadesMedicas.almacenes');
        $accessData = (object)[];
        $accessData = $loggedUser->grupos[0];
        $accessData->catalogo_programas = $programas;
        return $accessData;
    }

    /**
     * Detalles del stock
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function detalles($id, Request $request){
        try{
            $loggedUser = auth()->userOrFail();

            if($loggedUser->is_superuser){
                $almacenes_ids = Almacen::where('unidad_medica_id',$loggedUser->unidad_medica_asignada_id)->get()->pluck('id');
            }else{
                $almacenes_ids = $loggedUser->almacenes()->pluck('almacen_id');
            }

            $params = $request->all();

            $returnData = [];

            $returnData['detalle_articulo'] = BienServicio::datosDescripcion($loggedUser->unidad_medica_asignada_id)->withTrashed()->find($id);

            $returnData['existencias_almacenes'] = Almacen::select('almacenes.id','almacenes.nombre','catalogo_tipos_almacen.descripcion as tipo_almacen','almacenes.externo', 
                                                                    DB::raw('COUNT(DISTINCT stocks.id) as total_lotes'), DB::raw("SUM(stocks.existencia) as existencia"), DB::raw("SUM(stocks.existencia_piezas) as existencia_piezas"),
                                                                    DB::raw("SUM(stocks.resguardo_piezas) as resguardo_piezas"),
                                                                    DB::raw('SUM(stocks.existencia_piezas % IF(ED.id,ED.piezas_x_empaque,1)) AS existencia_fraccion'),
                                                                    DB::raw("SUM(stocks.resguardo_piezas / IF(ED.id,ED.piezas_x_empaque,1)) AS resguardo"), 
                                                                    DB::raw("SUM(stocks.resguardo_piezas % IF(ED.id,ED.piezas_x_empaque,1)) AS resguardo_fraccion")
                                                                )
                                                            ->leftJoin('catalogo_tipos_almacen','catalogo_tipos_almacen.id','=','almacenes.tipo_almacen_id')
                                                            ->leftJoin('stocks',function($join)use($id,$params){
                                                                $join = $join->on('stocks.almacen_id','=','almacenes.id')->where('stocks.bien_servicio_id',$id)->whereNull('stocks.deleted_at');
                                                                if(isset($params['lote']) && $params['lote']){
                                                                    $join = $join->where('stocks.lote',$params['lote'])->where('stocks.fecha_caducidad',$params['caducidad']);
                                                                }
                                                                return $join;
                                                            })
                                                            ->leftJoin("bienes_servicios_empaque_detalles AS ED", "ED.id","=","stocks.empaque_detalle_id")
                                                            ->whereIn('almacenes.id',$almacenes_ids)
                                                            ->having('total_lotes','>',0)
                                                            ->groupBy('almacenes.id')
                                                            ->get();
            //
            return response()->json($returnData);
        }catch(\Exception $e){
            return response()->json(['error'=>['message'=>$e->getMessage(),'line'=>$e->getLine()]], HttpResponse::HTTP_CONFLICT);
        }
    }

    /**
     * Detalles del stock
     *
     * @return \Illuminate\Http\Response
     */
    public function lotes(Request $request){
        try{
            $loggedUser = auth()->userOrFail();
            $params = $request->all();

            $lotes = Stock::select('stocks.*', DB::raw('COUNT(DISTINCT movimientos_articulos.id) as movimientos'),'bienes_servicios_empaque_detalles.descripcion as empaque_detalle','bienes_servicios_empaque_detalles.piezas_x_empaque','catalogo_unidades_medida.descripcion as unidad_medida')
                            ->leftJoin('movimientos_articulos','movimientos_articulos.stock_id','=','stocks.id')
                            ->leftJoin('bienes_servicios_empaque_detalles','bienes_servicios_empaque_detalles.id','=','stocks.empaque_detalle_id')
                            ->leftJoin('catalogo_unidades_medida','catalogo_unidades_medida.id','=','bienes_servicios_empaque_detalles.unidad_medida_id')
                            ->groupBy('stocks.id')
                            ->where('stocks.bien_servicio_id',$params['articulo'])
                            ->where('stocks.almacen_id',$params['almacen'])
                            ->with('resguardoDetallesActivos.usuario');
            //
            if(isset($params['lote']) && $params['lote']){
                $lotes = $lotes->where('stocks.lote',$params['lote'])->where('stocks.fecha_caducidad',$params['caducidad']);
            }
            $lotes = $lotes->get();
            return response()->json(['data'=>$lotes]);
        }catch(\Exception $e){
            return response()->json(['error'=>['message'=>$e->getMessage(),'line'=>$e->getLine()]], HttpResponse::HTTP_CONFLICT);
        }
    }

    /**
     * Movimientos del stock
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function movimientos($id, Request $request){
        try{
            $loggedUser = auth()->userOrFail();
            $parametros = $request->all();

            $lotes = MovimientoArticulo::select('movimientos_articulos.id','movimientos_articulos.cantidad','movimientos_articulos.modo_movimiento','movimientos_articulos.direccion_movimiento','movimientos.folio','catalogo_tipos_movimiento.descripcion as tipo_movimiento','movimientos.fecha_movimiento',
                                        'almacen_movimiento.nombre as almacen_movimiento','unidad_medica_movimiento.nombre as unidad_medica_movimiento','area_servicio_movimiento.descripcion as area_servicio_movimiento','catalogo_tipos_solicitud.descripcion as tipo_solicitud','movimientos.estatus')
                            ->leftJoin('movimientos','movimientos.id','=','movimientos_articulos.movimiento_id')
                            ->leftJoin('catalogo_tipos_movimiento','catalogo_tipos_movimiento.id','=','movimientos.tipo_movimiento_id')
                            ->leftJoin('almacenes as almacen_movimiento','almacen_movimiento.id','=','movimientos.almacen_movimiento_id')
                            ->leftJoin('catalogo_unidades_medicas as unidad_medica_movimiento','unidad_medica_movimiento.id','=','movimientos.unidad_medica_movimiento_id')
                            ->leftJoin('catalogo_areas_servicios as area_servicio_movimiento','area_servicio_movimiento.id','=','movimientos.area_servicio_movimiento_id')
                            ->leftJoin('solicitudes','solicitudes.id','=','movimientos.solicitud_id')
                            ->leftJoin('catalogo_tipos_solicitud','catalogo_tipos_solicitud.id','=','solicitudes.tipo_solicitud_id')
                            ->where('movimientos_articulos.stock_id',$id)
                            ->where('movimientos.estatus','!=','BOR')
                            ->groupBy('movimientos_articulos.id')
                            ->orderBy('movimientos.fecha_movimiento')
                            ->orderBy('movimientos.created_at')
                            ->get();
            //
            $resumen_movimientos = MovimientoArticulo::select(DB::raw('SUM(movimientos_articulos.cantidad) as cantidad'), 'movimientos_articulos.modo_movimiento', 'movimientos_articulos.direccion_movimiento' )
                                    ->leftJoin('movimientos','movimientos.id','=','movimientos_articulos.movimiento_id')
                                    ->where(function($where){
                                        $where->where('movimientos.estatus','!=','BOR')->where('movimientos.estatus','!=','CAN');
                                    })
                                    ->where('movimientos_articulos.stock_id',$id)
                                    ->groupBy('movimientos_articulos.stock_id')
                                    ->groupBy('movimientos_articulos.direccion_movimiento')
                                    ->groupBy('movimientos_articulos.modo_movimiento')
                                    ->get();
            //
            return response()->json(['data'=>$lotes,'resumen'=>$resumen_movimientos],HttpResponse::HTTP_OK);
        }catch(\Exception $e){
            return response()->json(['error'=>['message'=>$e->getMessage(),'line'=>$e->getLine()]], HttpResponse::HTTP_CONFLICT);
        }
    }

    public function exportExcel(Request $request){
        ini_set('memory_limit', '-1');

        try{
            $loggedUser = auth()->userOrFail();
            $params = $request->all();

            $stocks = $this->obtenerQueryListaArticulos($params, $loggedUser);

            $resultado = $stocks->get();
            $columnas = array_keys(collect($resultado[0])->toArray());

            $filename = 'Existencias';

            return (new DevReportExport($resultado,$columnas))->download($filename.'.xlsx'); //Excel::XLSX, ['Access-Control-Allow-Origin'=>'*','Access-Control-Allow-Methods'=>'GET']
        }catch(\Exception $e){
            return response()->json(['error' => $e->getMessage(),'line'=>$e->getLine()], HttpResponse::HTTP_CONFLICT);
        }
    }

}
