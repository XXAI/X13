<?php

namespace App\Http\Controllers\API\Modulos;

use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;

use App\Http\Controllers\Controller;

use App\Http\Requests;

use DB;

use App\Models\Movimiento;

class AlmacenEntradaController extends Controller
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
            $almacen_id = '00011';

            $entradas = Movimiento::where('direccion_movimiento','ENT')->where('almacen_id',$almacen_id);
            
            //Filtros, busquedas, ordenamiento
            if(isset($parametros['query']) && $parametros['query']){
                $entradas = $entradas->where(function($query)use($parametros){
                    return $query//->where('nombre','LIKE','%'.$parametros['query'].'%')
                                ->whereRaw('CONCAT_WS(" ",personas.apellido_paterno, personas.apellido_materno, personas.nombre) like "%'.$parametros['query'].'%"' )
                                ->orWhere('formularios.descripcion','LIKE','%'.$parametros['query'].'%');
                });
            }

            if(isset($parametros['page'])){
                $resultadosPorPagina = isset($parametros["per_page"])? $parametros["per_page"] : 20;
                $entradas = $entradas->paginate($resultadosPorPagina);

            } else {
                $entradas = $entradas->get();
            }

            return response()->json(['data'=>$entradas],HttpResponse::HTTP_OK);
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
}
