<?php

namespace App\Http\Controllers\API\Modulos;

use App\Http\Controllers\Controller;

use Illuminate\Support\Facades\Http;

use Illuminate\Http\Request;
use Response;
use Validator;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;

use App\EDocs\EDoc;

use App\Models\Stock;
use App\Models\Movimiento;
use App\Models\MovimientoArticulo;
use App\Models\Programa;


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
            
           
            $items = Stock::select(
                "stocks.id as id", 
                "stocks.bienes_servicios_id as bienes_servicios_id", 
               // "insumos_medicos.clave as clave", 
                "bienes_servicios.articulo as articulo",
                "bienes_servicios.especificaciones as especificaciones",
                "cog_partidas_especificas.clave_partida_generica as clave_partida_generica",
                "cog_partidas_especificas.clave as clave_partida_especifica",
                "cog_partidas_especificas.descripcion as partida_especifica_descripcion",
               // "insumos_medicos.tipo_insumo as tipo_insumo",
                //"insumos_medicos.es_unidosis as es_unidosis",
                "stocks.existencia as existencia",
                "stocks.existencia_unidosis as existencia_unidosis",
                "stocks.fecha_caducidad as fecha_caducidad",
                "stocks.lote as lote",
                "stocks.codigo_barras as codigo_barras",
                DB::raw("(CASE WHEN stocks.fecha_caducidad  < NOW() THEN '1' ELSE '0' END) as caducado"))
            ->leftJoin("bienes_servicios", "bienes_servicios.id","=","stocks.bienes_servicios_id")
            ->leftJoin("cog_partidas_especificas", "cog_partidas_especificas.clave","=","bienes_servicios.clave_partida_especifica");
            


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
            } else {
                $items = $items->where("stocks.almacen_id","=", "");
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
     * Movimientos del stock
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function movimientos($id, Request $request)
    {
        $params = $request->input();
        $items = MovimientoArticulo::select(
            "movimientos_articulos.movimiento_id as id", 
            "movimientos.folio as folio", 
            "movimientos.estatus as estatus", 
            "movimientos_articulos.direccion_movimiento as direccion_movimiento",
            "movimientos.fecha_movimiento as fecha_movimiento",
            "movimientos_articulos.cantidad as cantidad",
            "movimientos_articulos.user_id",
            "users.username as user")
        ->leftJoin("movimientos", "movimientos.id","=","movimientos_articulos.movimiento_id")->leftJoin("users", "users.id","=","movimientos_articulos.user_id")->where("stock_id",$id);

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

}
