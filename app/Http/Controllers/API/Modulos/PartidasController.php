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

use App\Models\PartidaEspecifica;


class PartidasController extends Controller
{
    

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function partidas(Request $request)
    {
        $params = $request->input();
        if(isset($params["all"])){
            
            return response()->json(["data"=>PartidaEspecifica::all()]);
        }  else {
            $items = PartidaEspecifica::Select("cog_partidas_especificas.*")
            ->join("bienes_servicios", "bienes_servicios.clave_partida_especifica","=","cog_partidas_especificas.clave")
            ->groupBy('cog_partidas_especificas.clave')->get();
            return response()->json(['data'=>$items],HttpResponse::HTTP_OK);
        }
        
    }
}

?>