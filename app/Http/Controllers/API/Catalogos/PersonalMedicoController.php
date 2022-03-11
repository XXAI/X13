<?php

namespace App\Http\Controllers\API\Catalogos;

use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;

use App\Http\Controllers\Controller;

use App\Http\Requests;

use DB;

use App\Models\PersonalMedico;

class PersonalMedicoController extends Controller{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request){
        try{
            $loggedUser = auth()->userOrFail();
            $parametros = $request->all();

            $personal_medico = PersonalMedico::where('unidad_medica_id',$loggedUser->unidad_medica_asignada_id);

            //Filtros, busquedas, ordenamiento
            if(isset($parametros['query']) && $parametros['query']){
                $personal_medico = $personal_medico->where(function($query)use($parametros){
                    return $query->where('personal_medico.nombre_completo','LIKE','%'.$parametros['query'].'%')
                                ->orWhere('personal_medico.curp','LIKE','%'.$parametros['query'].'%')
                                ->orWhere('personal_medico.rfc','LIKE','%'.$parametros['query'].'%')
                                ->orWhere('personal_medico.especialidad','LIKE','%'.$parametros['query'].'%');
                });
            }

            if(isset($parametros['page'])){
                $resultadosPorPagina = isset($parametros["per_page"])? $parametros["per_page"] : 20;
                $personal_medico = $personal_medico->paginate($resultadosPorPagina);
            } else {
                $personal_medico = $personal_medico->get();
            }

            return response()->json(['data'=>$personal_medico],HttpResponse::HTTP_OK);
        }catch(\Exception $e){
            return response()->json(['error'=>['message'=>$e->getMessage(),'line'=>$e->getLine()]], HttpResponse::HTTP_CONFLICT);
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
        try{
            $personal_medico = PersonalMedico::find($id);
            return response()->json(['data'=>$personal_medico],HttpResponse::HTTP_OK);
        }catch(\Exception $e){
            return response()->json(['error'=>['message'=>$e->getMessage(),'line'=>$e->getLine()]], HttpResponse::HTTP_CONFLICT);
        }
    }
}
