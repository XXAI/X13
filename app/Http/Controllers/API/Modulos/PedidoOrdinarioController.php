<?php

namespace App\Http\Controllers\API\Modulos;

use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;

use App\Http\Controllers\Controller;

use App\Http\Requests;

use Illuminate\Support\Facades\Input;

use DB;

use App\Models\Pedido;

class PedidoOrdinarioController extends Controller
{

    public function datosCatalogo(){
        try{
            $data = [];
            $data = $this->getUserAccessData();

            return response()->json(['data'=>$data],HttpResponse::HTTP_OK);
        }catch(\Exception $e){
            return response()->json(['error'=>['message'=>$e->getMessage(),'line'=>$e->getLine()]], HttpResponse::HTTP_CONFLICT);
        }
    }
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        try{
            $parametros = Input::all();
            $almacen_id = '00011';

            $pedidos = Pedido::all();
            
            //Filtros, busquedas, ordenamiento
            if(isset($parametros['query']) && $parametros['query']){
                /*$pedidos = $pedidos->where(function($query)use($parametros){
                    return $query//->where('nombre','LIKE','%'.$parametros['query'].'%')
                                ->whereRaw('CONCAT_WS(" ",personas.apellido_paterno, personas.apellido_materno, personas.nombre) like "%'.$parametros['query'].'%"' )
                                ->orWhere('formularios.descripcion','LIKE','%'.$parametros['query'].'%');
                });*/
            }

            if(isset($parametros['page'])){
                $resultadosPorPagina = isset($parametros["per_page"])? $parametros["per_page"] : 20;
                $pedidos = $pedidos->paginate($resultadosPorPagina);

            } else {
                $pedidos = $pedidos->get();
            }

            return response()->json(['data'=>$pedidos],HttpResponse::HTTP_OK);
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
            $llenado = RegistroLlenadoFormulario::with(['persona'=>function($persona){
                return $persona->select('personas.*','catalogo_estados.descripcion as estado',DB::raw('IF(personas.municipio_id,catalogo_municipios.descripcion,personas.municipio) as municipio'),DB::raw('IF(personas.localidad_id,catalogo_localidades.descripcion,personas.localidad) as localidad'))
                                ->leftjoin('catalogo_estados','catalogo_estados.id','=','personas.estado_id')
                                ->leftjoin('catalogo_municipios','catalogo_municipios.id','=','personas.municipio_id')
                                ->leftjoin('catalogo_localidades','catalogo_localidades.id','=','personas.localidad_id');
            },'registroLlenadoRespuestas'=>function($registro){
                return $registro->select('registro_llenado_respuestas.*','catalogo_tipos_preguntas.llave as tipo_pregunta','catalogo_tipos_valores.llave as tipo_valor','preguntas.descripcion as pregunta','respuestas.descripcion as respuesta')
                                    ->leftjoin('preguntas','preguntas.id','=','registro_llenado_respuestas.pregunta_id')
                                    ->leftjoin('catalogo_tipos_preguntas','catalogo_tipos_preguntas.id','=','preguntas.tipo_pregunta_id')
                                    ->leftjoin('catalogo_tipos_valores','catalogo_tipos_valores.id','=','preguntas.tipo_valor_id')
                                    ->leftjoin('respuestas','respuestas.id','=','registro_llenado_respuestas.respuesta_id');
            }])->find($id); //,'registroLlenadoRespuestas.pregunta','registroLlenadoRespuestas.respuesta'

            $return_data = [
                'id'=> $llenado->id,
                'fecha_finalizado'=> $llenado->fecha_finalizado,
                'finalizado'=> $llenado->finalizado,
                'datos_persona'=> $llenado->persona,
                'datos_preguntas'=>[]
            ];

            $return_data['datos_preguntas'] = array_values($datos_preguntas);

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

    private function getUserAccessData($loggedUser = null){
        if(!$loggedUser){
            $loggedUser = auth()->userOrFail();
        }
        
        //$loggedUser->load('perfilCr');
        $loggedUser->load('grupos.unidadesMedicas');
        
        $lista_clues = [];
        
        foreach ($loggedUser->grupos as $grupo) {
            $lista_unidades = $grupo->unidadesMedicas->toArray();
            
            $lista_clues += $lista_clues + $lista_unidades;
        }

        $accessData = (object)[];
        $accessData->lista_clues = $lista_clues;
        $accessData->grupo_pedidos = $loggedUser->grupos[0];

        /*if (\Gate::allows('has-permission', \Permissions::ADMIN_PERSONAL_ACTIVO)){
            $accessData->is_admin = true;
        }else{
            $accessData->is_admin = false;
        }*/

        return $accessData;
    }
}
