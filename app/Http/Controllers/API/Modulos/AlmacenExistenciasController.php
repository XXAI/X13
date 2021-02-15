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
use App\Models\MovimientoInsumo;


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
                "stocks.insumo_medico_id as insumo_medico_id", 
                "insumos_medicos.clave as clave", 
                "insumos_medicos.descripcion as descripcion",
                "insumos_medicos.tipo_insumo as tipo_insumo",
                "insumos_medicos.es_unidosis as es_unidosis",
                "stocks.existencia as existencia",
                "stocks.existencia_unidosis as existencia_unidosis",
                "stocks.fecha_caducidad as fecha_caducidad",
                "stocks.lote as lote",
                "stocks.codigo_barras as codigo_barras")
            ->leftJoin("insumos_medicos", "insumos_medicos.id","=","stocks.insumo_medico_id");
            


            if(isset($params['orderBy']) && trim($params['orderBy'])!= ""){
                $sortOrder = 'asc';
                if(isset($params['sortOrder'])){
                    $sortOrder = $params['sortOrder'];
                }
    
                $items = $items->orderBy($params['orderBy'],$sortOrder);
            }  else {
                $items = $items->orderBy('id','desc');
            }

            if(isset($params['filter']) && trim($params['filter'])!= ""){
                $items = $items->where("codigo_barras","LIKE", "%".$params['filter']."%")->orWhere("lote","LIKE", "%".$params['filter']."%")->orWhere("descripcion","LIKE", "%".$params['filter']."%");
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
     * Movimientos del stock
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function movimientos($id, Request $request)
    {
        $params = $request->input();
        $items = MovimientoInsumo::select(
            "movimientos_insumos.movimiento_id as id", 
            "movimientos.folio as folio", 
            "movimientos.estatus as estatus", 
            "movimientos_insumos.direccion_movimiento as direccion_movimiento",
            "movimientos.fecha_movimiento as fecha_movimiento",
            "movimientos_insumos.cantidad as cantidad",
            "movimientos_insumos.user_id",
            "users.username as user")
        ->leftJoin("movimientos", "movimientos.id","=","movimientos_insumos.movimiento_id")->leftJoin("users", "users.id","=","movimientos_insumos.user_id")->where("stock_id",$id);

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
