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

            $unidad_medica_id = $loggedUser->unidad_medica_asignada_id;

            if($loggedUser->is_superuser){
                $almacenes_ids = Almacen::where('unidad_medica_id',$loggedUser->unidad_medica_asignada_id)->get()->pluck('id');
            }else{
                $almacenes_ids = $loggedUser->almacenes()->pluck('almacen_id');
            }

            $lista_articulos = Stock::select('stocks.bien_servicio_id AS id','catalogo_tipos_bien_servicio.descripcion AS tipo_bien_servicio', DB::raw("IF(bienes_servicios.clave_local is not null,bienes_servicios.clave_local,bienes_servicios.clave_cubs) AS clave"),
                                            "bienes_servicios.articulo AS articulo","bienes_servicios.especificaciones AS especificaciones","bienes_servicios.puede_surtir_unidades","bienes_servicios.descontinuado",'unidad_medica_catalogo_articulos.es_normativo',
                                            'unidad_medica_catalogo_articulos.cantidad_minima','unidad_medica_catalogo_articulos.cantidad_maxima','unidad_medica_catalogo_articulos.id AS en_catalogo_unidad',
                                            DB::raw("COUNT(DISTINCT stocks.id) as total_lotes"), DB::raw("SUM(stocks.existencia) as existencia"), DB::raw("SUM(stocks.existencia_piezas) as existencia_piezas"), DB::raw("SUM(stocks.resguardo_piezas) as resguardo_piezas"))
                                    ->leftJoin("bienes_servicios", "bienes_servicios.id","=","stocks.bien_servicio_id")
                                    ->leftJoin('catalogo_tipos_bien_servicio','catalogo_tipos_bien_servicio.id','bienes_servicios.tipo_bien_servicio_id')
                                    ->leftJoin('unidad_medica_catalogo_articulos',function($join)use($unidad_medica_id){
                                        return $join->on('unidad_medica_catalogo_articulos.bien_servicio_id','=','bienes_servicios.id')
                                            ->where('unidad_medica_catalogo_articulos.unidad_medica_id',$unidad_medica_id)
                                            ->whereNull('unidad_medica_catalogo_articulos.deleted_at');
                                    })
                                    ->where('stocks.unidad_medica_id',$unidad_medica_id)
                                    ->whereIn('stocks.almacen_id',$almacenes_ids)
                                    ->groupBy('stocks.bien_servicio_id');
            
            //Filtros, busquedas, ordenamiento
            if(isset($parametros['query']) && $parametros['query']){
                $params_query = urldecode($parametros['query']);

                $search_queries = explode('+',$params_query);

                $lista_articulos = $lista_articulos->where(function($query)use($search_queries){
                    //->where('cog_partidas_especificas.descripcion','LIKE','%'.$parametros['query'].'%')
                    //->where('familias.nombre','LIKE','%'.$parametros['query'].'%')
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
                $params['incluir_existencias_cero'] = true;
            }
            
            if(isset($params['incluir_existencias_cero']) && $params['incluir_existencias_cero']){
                $lista_articulos = $lista_articulos->where(function($where){
                    $where->where('stocks.existencia','>=',0);
                });
            }else{
                $lista_articulos = $lista_articulos->where(function($where){
                    $where->where('stocks.existencia','>',0)->orWhere('existencia_piezas','>',0);
                });
            }

            if(isset($parametros['page'])){
                $resultadosPorPagina = isset($parametros["per_page"])? $parametros["per_page"] : 20;
                $lista_articulos = $lista_articulos->paginate($resultadosPorPagina);
            } else {
                $lista_articulos = $lista_articulos->get();
            }

            return response()->json($lista_articulos,HttpResponse::HTTP_OK);
        }catch(\Exception $e){
            return response()->json(['error'=>['message'=>$e->getMessage(),'line'=>$e->getLine()]], HttpResponse::HTTP_CONFLICT);
        }
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
                                                                    DB::raw('COUNT(DISTINCT stocks.id) as total_lotes'), DB::raw("SUM(stocks.existencia) as existencia"), DB::raw("SUM(stocks.existencia_piezas) as existencia_piezas"))
                                                            ->leftJoin('catalogo_tipos_almacen','catalogo_tipos_almacen.id','=','almacenes.tipo_almacen_id')
                                                            ->leftJoin('stocks',function($join)use($id){
                                                                return $join->on('stocks.almacen_id','=','almacenes.id')->where('stocks.bien_servicio_id',$id)->whereNull('stocks.deleted_at');
                                                            })
                                                            ->whereIn('almacenes.id',$almacenes_ids)
                                                            ->groupBy('almacenes.id')
                                                            ->get();
            //
            return response()->json($returnData);
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
        $loggedUser = auth()->userOrFail();

        if($loggedUser->is_superuser){
            $almacenes = Almacen::where('unidad_medica_id',$loggedUser->unidad_medica_asignada_id)->get()->pluck('id');
        }else{
            $almacenes = $loggedUser->almacenes()->pluck('almacen_id');
        }

        $params = $request->input();

        $items = Stock::select(
                        "almacenes.nombre as almacen",
                        "movimientos_articulos.movimiento_id as id", 
                        "movimientos.folio as folio", 
                        "movimientos.estatus as estatus", 
                        "movimientos_articulos.direccion_movimiento as direccion_movimiento",
                        "movimientos.fecha_movimiento as fecha_movimiento",
                        "movimientos_articulos.cantidad as cantidad",
                        "movimientos_articulos.user_id",
                        "stocks.lote",
                        "stocks.fecha_caducidad",
                        "users.username as user")
                    ->leftjoin("movimientos_articulos",function($joinArticulos){
                        $joinArticulos->on("movimientos_articulos.stock_id","=","stocks.id")->whereNull("movimientos_articulos.deleted_at");
                    })
                    ->leftJoin("movimientos",function($joinMovimientos){
                        $joinMovimientos->on("movimientos.id","=","movimientos_articulos.movimiento_id")->whereNull("movimientos.deleted_at");
                    })
                    ->leftJoin("users", "users.id","=","movimientos_articulos.user_id")
                    ->leftJoin("almacenes","almacenes.id","=","stocks.almacen_id")
                    ->where("stocks.bien_servicio_id",$id)
                    ->where("stocks.unidad_medica_id",$loggedUser->unidad_medica_asignada_id)
                    ->where("movimientos.estatus","FIN")
                    ->orderBy("movimientos.fecha_movimiento","ASC")
                    ->orderBy("movimientos.created_at","ASC")
                    ->orderBy("stocks.id","ASC")
                    ->whereIn('stocks.almacen_id',$almacenes)
                    ;

        if(isset($params['almacen_id']) && trim($params['almacen_id'])!= ""){
            $items = $items->where('stocks.almacen_id',$params['almacen_id']);
        }

        if(isset($params['orderBy']) && trim($params['orderBy'])!= ""){
            $sortOrder = 'asc';
            if(isset($params['sortOrder'])){
                $sortOrder = $params['sortOrder'];
            }

            $items = $items->orderBy($params['orderBy'],$sortOrder);
        }  else {
            $items = $items->orderBy('id','desc');
        }

        
        $items = $items->paginate($params['pageSize']);

        return response()->json($items);
    }

    public function exportExcel(Request $request){
        ini_set('memory_limit', '-1');

        try{
            $loggedUser = auth()->userOrFail();
            $params = $request->all();

            if(isset($params['almacenes_ids']) && trim($params['almacenes_ids']) != ''){
                $almacenes = explode('|',$params['almacenes_ids']);
            }else{
                if($loggedUser->is_superuser){
                    $almacenes = Almacen::where('unidad_medica_id',$loggedUser->unidad_medica_asignada_id)->get()->pluck('id');
                }else{
                    $almacenes = $loggedUser->almacenes()->pluck('almacen_id');
                }
            }
            $unidad_medica_id = $loggedUser->unidad_medica_asignada_id;
            
            $stocks = Stock::select('almacenes.nombre as ALMACEN','programas.descripcion as PROGRAMA','catalogo_tipos_bien_servicio.descripcion as TIPO_ARTICULO',
                                'bienes_servicios.clave_local as CLAVE','bienes_servicios.especificaciones as DESCRIPCION','bienes_servicios.descontinuado as DESCONTINUADO',
                                'stocks.lote as LOTE','stocks.fecha_caducidad as FECHA_CADUCIDAD','stocks.existencia as EXISTENCIA',
                                'unidad_medica_catalogo_articulos.es_normativo as NORMATIVO')
                            ->leftJoin('bienes_servicios','bienes_servicios.id','=','stocks.bien_servicio_id')
                            ->leftJoin('catalogo_tipos_bien_servicio','catalogo_tipos_bien_servicio.id','=','bienes_servicios.tipo_bien_servicio_id')
                            ->leftjoin('almacenes','almacenes.id','=','stocks.almacen_id')
                            ->leftJoin('programas','programas.id','=','stocks.programa_id')
                            ->leftJoin('unidad_medica_catalogo_articulos',function($join)use($unidad_medica_id){
                                $join->on('unidad_medica_catalogo_articulos.bien_servicio_id','=','stocks.bien_servicio_id')
                                    ->where('unidad_medica_catalogo_articulos.unidad_medica_id',$unidad_medica_id)
                                    ->whereNull('unidad_medica_catalogo_articulos.deleted_at');
                            })
                            ->whereIn('stocks.almacen_id',$almacenes)
                            ->orderBy('almacenes.nombre','ASC')
                            ->orderBy('programas.descripcion','ASC')
                            ->orderBy('bienes_servicios.articulo','ASC')
                            ->orderBy('bienes_servicios.clave_local','ASC')
                            ->orderBy('stocks.fecha_caducidad','ASC');
            //
            if(isset($params['agrupar_por']) && trim($params['agrupar_por']) != ''){
                if($params['agrupar_por'] == 'articulo'){
                    $stocks = $stocks->select('catalogo_tipos_bien_servicio.descripcion as TIPO_ARTICULO','bienes_servicios.clave_local as CLAVE',
                                            'bienes_servicios.especificaciones as DESCRIPCION','bienes_servicios.descontinuado as DESCONTINUADO',
                                            DB::raw('count(stocks.lote) as NO_LOTES'),DB::raw('SUM(stocks.existencia) as EXISTENCIAS'),
                                            'unidad_medica_catalogo_articulos.es_normativo as NORMATIVO')
                                    ->groupBy('stocks.bien_servicio_id');
                }
            }
            $resultado = $stocks->get();
            $columnas = array_keys(collect($resultado[0])->toArray());

            $filename = 'Existencias Por Almacen';

            return (new DevReportExport($resultado,$columnas))->download($filename.'.xlsx'); //Excel::XLSX, ['Access-Control-Allow-Origin'=>'*','Access-Control-Allow-Methods'=>'GET']
        }catch(\Exception $e){
            return response()->json(['error' => $e->getMessage(),'line'=>$e->getLine()], HttpResponse::HTTP_CONFLICT);
        }
    }

}
