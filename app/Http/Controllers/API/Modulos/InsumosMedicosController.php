<?php

namespace App\Http\Controllers\API\Modulos;

use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;

use App\Http\Controllers\Controller;

use App\Http\Requests;

use DB;

use App\Models\InsumoMedico;

class InsumosMedicosController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        try{
            $parametros = $request->all();
            
            $insumos = InsumoMedico::with('medicamento','materialCuracion');
            
            //Filtros, busquedas, ordenamiento
            if(isset($parametros['query']) && $parametros['query']){
                $insumos = $insumos->where(function($query)use($parametros){
                    return $query->where('descripcion','LIKE','%'.$parametros['query'].'%')
                                ->orWhere('nombre_generico','LIKE','%'.$parametros['query'].'%')
                                ->orWhere('clave','LIKE','%'.$parametros['query'].'%');
                                //->whereRaw('CONCAT_WS(" ",personas.apellido_paterno, personas.apellido_materno, personas.nombre) like "%'.$parametros['query'].'%"' )
                                //->orWhere('formularios.descripcion','LIKE','%'.$parametros['query'].'%');
                });
            }

            if(isset($parametros['tipo_insumo']) && $parametros['tipo_insumo'] && $parametros['tipo_insumo'] != '*'){
                $insumos = $insumos->where('tipo_insumo',$parametros['tipo_insumo']);
            }

            if(isset($parametros['page'])){
                $resultadosPorPagina = isset($parametros["per_page"])? $parametros["per_page"] : 20;
                $insumos = $insumos->paginate($resultadosPorPagina);

            } else {
                $insumos = $insumos->get();
            }

            return response()->json(['data'=>$insumos],HttpResponse::HTTP_OK);
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
            $insumo = InsumoMedico::with('medicamento','materialCuracion')->find($id);

            $return_data['insumo'] = $insumo;

            return response()->json(['data'=>$return_data],HttpResponse::HTTP_OK);
        }catch(\Exception $e){
            return response()->json(['error'=>['message'=>$e->getMessage(),'line'=>$e->getLine()]], HttpResponse::HTTP_CONFLICT);
        }
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        //
    }
}
