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
    public function index(Request $request)
    {        
        $params = $request->input();
        if(isset($params["all"])){
            return response()->json(["data"=>Stock::all()]);
        } else {
            if(!isset($params['pageSize'])){
                $params['pageSize'] = 1;
            }
            
            $loggedUser = auth()->userOrFail();
            
            if($loggedUser->is_superuser){
                $almacenes = Almacen::where('unidad_medica_id',$loggedUser->unidad_medica_asignada_id)->get()->pluck('id');
            }else{
                $almacenes = $loggedUser->almacenes()->pluck('almacen_id');
            }

            $items = Stock::leftJoin("bienes_servicios", "bienes_servicios.id","=","stocks.bien_servicio_id")
                            ->leftJoin("cog_partidas_especificas", "cog_partidas_especificas.clave","=","bienes_servicios.clave_partida_especifica")
                            ->leftJoin("almacenes","almacenes.id","=","stocks.almacen_id")
                            ->leftJoin("programas","programas.id","=","stocks.programa_id")
                            ->leftJoin("familias","familias.id","=","bienes_servicios.familia_id")
                            ->where('stocks.unidad_medica_id',$loggedUser->unidad_medica_asignada_id)
                            ->where('stocks.existencia','>',0)
                            ->whereIn('stocks.almacen_id',$almacenes);

            if(isset($params['groupBy']) && trim($params['groupBy']) != ""){
                if($params['groupBy'] == 'articulo'){
                    $items = $items->select(
                        //"almacenes.nombre as almacen",
                        //"programas.descripcion as programa",
                        DB::raw("CONCAT('En ',COUNT(DISTINCT stocks.almacen_id),' Almacen(es)') as almacen"),
                        DB::raw("CONCAT('En ',COUNT(DISTINCT stocks.programa_id),' Programa(s)') as programa"),
                        "stocks.bien_servicio_id as id", 
                        DB::raw("IF(bienes_servicios.clave_local,bienes_servicios.clave_local,bienes_servicios.clave_cubs) as clave"),
                        "bienes_servicios.articulo as articulo",
                        "bienes_servicios.especificaciones as especificaciones",
                        "cog_partidas_especificas.clave_partida_generica as clave_partida_generica",
                        "cog_partidas_especificas.clave as clave_partida_especifica",
                        "cog_partidas_especificas.descripcion as partida_especifica_descripcion",
                        "familias.nombre as familia",
                        DB::raw("SUM(stocks.existencia) as existencia"),
                        DB::raw("SUM(stocks.existencia_unidosis) as existencia_unidosis"),
                        DB::raw("COUNT(distinct stocks.id) as total_lotes"))
                        ->groupBy('stocks.bien_servicio_id');
                }
            }else{
                $items = $items->select(
                    //"almacenes.nombre as almacen",
                    DB::raw("CONCAT('En ',COUNT(DISTINCT stocks.almacen_id),' Almacen(es)') as almacen"),
                    "programas.descripcion as programa",
                    "stocks.id as id", 
                    "stocks.bien_servicio_id as bien_servicio_id", 
                    "bienes_servicios.articulo as articulo",
                    "bienes_servicios.especificaciones as especificaciones",
                    "cog_partidas_especificas.clave_partida_generica as clave_partida_generica",
                    "cog_partidas_especificas.clave as clave_partida_especifica",
                    "cog_partidas_especificas.descripcion as partida_especifica_descripcion",
                    "stocks.existencia as existencia",
                    "stocks.existencia_unidosis as existencia_unidosis",
                    "stocks.fecha_caducidad as fecha_caducidad",
                    "stocks.lote as lote",
                    "stocks.codigo_barras as codigo_barras",
                    DB::raw("(CASE WHEN stocks.fecha_caducidad  < NOW() THEN '1' ELSE '0' END) as caducado"));
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

            if(isset($params['caducidad'])){
                if($params['caducidad'] == "CAD"){
                    $items = $items->whereDate("fecha_caducidad","<",date("Y-m-d"));
                }

                if($params['caducidad'] == "PROX"){
                    $items = $items->whereDate("fecha_caducidad",">=",date("Y-m-d"))->whereDate("fecha_caducidad","<",DB::raw('DATE_ADD("'.date("Y-m-d").'", INTERVAL 3 MONTH)'));
                }
                
            }
            
            if(isset($params['familia_id']) && trim($params['familia_id'])!= ""){
                $items = $items->where("bienes_servicios.familia_id","=", $params['familia_id']);
            }

            if(isset($params['clave_partida_especifica']) && trim($params['clave_partida_especifica'])!= ""){
                $items = $items->where("bienes_servicios.clave_partida_especifica","=", $params['clave_partida_especifica']);
            }

            if(isset($params['almacen_id']) && trim($params['almacen_id'])!= ""){
                $items = $items->where("stocks.almacen_id","=", $params['almacen_id']);
            }

            if(isset($params['programa_id']) && trim($params['programa_id'])!= ""){
                $items = $items->where("stocks.programa_id","=", $params['programa_id']);
            }

            if(isset($params['search']) && trim($params['search'])!= ""){

                $items = $items->where(function($query) use ($params) {
                    $query->where("codigo_barras","LIKE", "%".$params['search']."%")
                    ->orWhere("lote","LIKE", "%".$params['search']."%")
                    ->orWhere("articulo","LIKE", "%".$params['search']."%")
                    ->orWhere("especificaciones","LIKE", "%".$params['search']."%");
                });
            }
            
            $items = $items->paginate($params['pageSize']);

            return response()->json($items);
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
        $stock = Stock::where("id",$id)->first();
        if($stock != null) {
            return response()->json(['stock' => $stock]);
        } else {
            return response()->json(['message' => "Stock no encontrado"],404);
        }
        
    }

     /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
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
                $almacenes = Almacen::where('unidad_medica_id',$loggedUser->unidad_medica_asignada_id)->get()->pluck('id');
            }else{
                $almacenes = $loggedUser->almacenes()->pluck('almacen_id');
            }

            $params = $request->input();

            $returnData = [];

            if($params['es_articulo']){
                $por_almacen = Stock::select("almacenes.id","almacenes.nombre as almacen","programas.descripcion as programa",DB::raw("SUM(stocks.existencia) as existencias"))
                                    ->leftJoin("almacenes","almacenes.id","=","stocks.almacen_id")
                                    ->leftJoin("programas","programas.id","=","stocks.programa_id")
                                    ->where("stocks.existencia",">",0)
                                    ->where("stocks.bien_servicio_id",$id)
                                    ->where("stocks.unidad_medica_id",$loggedUser->unidad_medica_asignada_id)
                                    ->groupBy('stocks.programa_id')
                                    ->groupBy('stocks.almacen_id')
                                    ->whereIn('stocks.almacen_id',$almacenes)
                                    ->get();
                $returnData['por_almacen'] = $por_almacen;

                $datos_catalogo = UnidadMedicaCatalogoArticulo::where('bien_servicio_id',$id)->first();
                $returnData['datos_catalogo'] = $datos_catalogo;

                $movimientos = Stock::select(
                    "almacenes.nombre as almacen",
                    "movimientos_articulos.movimiento_id as id", 
                    "movimientos.folio as folio", 
                    "movimientos.estatus as estatus", 
                    "movimientos_articulos.direccion_movimiento as direccion_movimiento",
                    "movimientos.fecha_movimiento as fecha_movimiento",
                    DB::raw("SUM(movimientos_articulos.cantidad) as cantidad"),
                    DB::raw("CONCAT(COUNT(DISTINCT stocks.id),' Lote(s)') as lotes"))
                ->leftjoin("movimientos_articulos",function($joinArticulos){
                    $joinArticulos->on("movimientos_articulos.stock_id","=","stocks.id")->whereNull("movimientos_articulos.deleted_at");
                })
                ->leftJoin("movimientos",function($joinMovimientos){
                    $joinMovimientos->on("movimientos.id","=","movimientos_articulos.movimiento_id")->whereNull("movimientos.deleted_at");
                })
                ->leftJoin("almacenes","almacenes.id","=","stocks.almacen_id")
                ->where("stocks.bien_servicio_id",$id)
                ->where("stocks.unidad_medica_id",$loggedUser->unidad_medica_asignada_id)
                ->where("movimientos.estatus","FIN")
                ->orderBy("movimientos.fecha_movimiento","ASC")
                ->orderBy("movimientos.created_at","ASC")
                ->orderBy("stocks.lote")
                ->groupBy("movimientos_articulos.movimiento_id")
                ->groupBy("stocks.bien_servicio_id")
                ->whereIn('stocks.almacen_id',$almacenes)
                ->get();
                $returnData['movimientos'] = $movimientos;
            }
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
            if($loggedUser->is_superuser){
                $almacenes = Almacen::where('unidad_medica_id',$loggedUser->unidad_medica_asignada_id)->get()->pluck('id');
            }else{
                $almacenes = $loggedUser->almacenes()->pluck('almacen_id');
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
            $resultado = $stocks->get();
            $columnas = array_keys(collect($resultado[0])->toArray());

            $filename = 'Existencias Por Almacen';

            return (new DevReportExport($resultado,$columnas))->download($filename.'.xlsx'); //Excel::XLSX, ['Access-Control-Allow-Origin'=>'*','Access-Control-Allow-Methods'=>'GET']
        }catch(\Exception $e){
            return response()->json(['error' => $e->getMessage(),'line'=>$e->getLine()], HttpResponse::HTTP_CONFLICT);
        }
    }

}
