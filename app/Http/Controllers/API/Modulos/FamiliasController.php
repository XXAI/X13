<?php

namespace App\Http\Controllers\API\Modulos;

use App\Http\Controllers\Controller;
use Symfony\Component\HttpFoundation\Response as HttpResponse;

use Illuminate\Support\Facades\Http;

use Illuminate\Http\Request;
use Response;
use Validator;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;

use App\Models\Familia;


class FamiliasController extends Controller
{
    

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function familias(Request $request)
    {
        $params = $request->input();
        if(!isset($params["clave_partida_especifica"])){
            
            return response()->json(["data"=>Familia::all()]);
        }  else {
            $items = Familia::Select("familias.*")
            ->join("bienes_servicios", "bienes_servicios.familia_id","=","familias.id")
            ->where("bienes_servicios.clave_partida_especifica","=",$params["clave_partida_especifica"])
            ->groupBy('familias.id')->get();
            return response()->json(['data'=>$items],HttpResponse::HTTP_OK);
        }
        
    }
}

?>