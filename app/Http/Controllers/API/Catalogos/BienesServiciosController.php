<?php

namespace App\Http\Controllers\API\Catalogos;

use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;

use App\Http\Controllers\Controller;

use App\Http\Requests;

use DB;

use App\Models\BienServicio;

class BienesServiciosController extends Controller{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request){
        try{
            $loggedUser = auth()->userOrFail();
            $parametros = $request->all();

            $catalogo_articulos = BienServicio::select('bienes_servicios.*','cog_partidas_especificas.descripcion AS partida_especifica','familias.nombre AS familia',
                                                        'unidad_medica_catalogo_articulos.es_indispensable','unidad_medica_catalogo_articulos.cantidad_minima','unidad_medica_catalogo_articulos.cantidad_maxima',
                                                        'unidad_medica_catalogo_articulos.id AS en_catalogo_unidad')
                                                ->leftjoin('cog_partidas_especificas','cog_partidas_especificas.clave','=','bienes_servicios.clave_partida_especifica')
                                                ->leftjoin('familias','familias.id','=','bienes_servicios.familia_id')
                                                ->orderBy('bienes_servicios.especificaciones');

            if(isset($parametros['buscar_catalogo_completo']) && $parametros['buscar_catalogo_completo']){
                $catalogo_articulos = $catalogo_articulos->leftJoin('unidad_medica_catalogo_articulos',function($join)use($loggedUser){
                    return $join->on('unidad_medica_catalogo_articulos.bien_servicio_id','=','bienes_servicios.id')
                        ->where('unidad_medica_catalogo_articulos.unidad_medica_id',$loggedUser->unidad_medica_asignada_id)
                        ->whereNull('unidad_medica_catalogo_articulos.deleted_at');
                });
            }else{
                $catalogo_articulos = $catalogo_articulos->join('unidad_medica_catalogo_articulos',function($join)use($loggedUser){
                    return $join->on('unidad_medica_catalogo_articulos.bien_servicio_id','=','bienes_servicios.id')
                        ->where('unidad_medica_catalogo_articulos.unidad_medica_id',$loggedUser->unidad_medica_asignada_id)
                        ->whereNull('unidad_medica_catalogo_articulos.deleted_at');
                });
            }

            //Filtros, busquedas, ordenamiento
            if(isset($parametros['query']) && $parametros['query']){
                $catalogo_articulos = $catalogo_articulos->where(function($query)use($parametros){
                    return $query->where('cog_partidas_especificas.descripcion','LIKE','%'.$parametros['query'].'%')
                                ->orWhere('familias.nombre','LIKE','%'.$parametros['query'].'%')
                                ->orWhere('bienes_servicios.clave_cubs','LIKE','%'.$parametros['query'].'%')
                                ->orWhere('bienes_servicios.clave_local','LIKE','%'.$parametros['query'].'%')
                                ->orWhere('bienes_servicios.articulo','LIKE','%'.$parametros['query'].'%')
                                ->orWhere('bienes_servicios.especificaciones','LIKE','%'.$parametros['query'].'%');
                });
            }

            if(isset($parametros['familia_id']) && $parametros['familia_id']){
                $catalogo_articulos = $catalogo_articulos->where('bienes_servicios.familia_id',$parametros['familia_id']);
            }

            if(isset($parametros['clave_partida']) && $parametros['clave_partida']){
                $catalogo_articulos = $catalogo_articulos->where('bienes_servicios.clave_partida_especifica',$parametros['clave_partida']);
            }

            if(isset($parametros['con_caducidad']) && $parametros['con_caducidad']){
                $catalogo_articulos = $catalogo_articulos->where('bienes_servicios.tiene_fecha_caducidad',1);
            }

            if(isset($parametros['sin_caducidad']) && $parametros['sin_caducidad']){
                $catalogo_articulos = $catalogo_articulos->where('bienes_servicios.tiene_fecha_caducidad','!=',1);
            }

            if(isset($parametros['descontinuados']) && $parametros['descontinuados']){
                $catalogo_articulos = $catalogo_articulos->where('bienes_servicios.descontinuado',1);
            }

            if(isset($parametros['no_descontinuados']) && $parametros['no_descontinuados']){
                $catalogo_articulos = $catalogo_articulos->where('bienes_servicios.descontinuado','!=',1);
            }

            if(isset($parametros['indispensables']) && $parametros['indispensables']){
                $catalogo_articulos = $catalogo_articulos->where('unidad_medica_catalogo_articulos.es_indispensable',1);
            }

            if(isset($parametros['no_indispensables']) && $parametros['no_indispensables']){
                $catalogo_articulos = $catalogo_articulos->where('unidad_medica_catalogo_articulos.es_indispensable','!=',1);
            }

            if(isset($parametros['page'])){
                $resultadosPorPagina = isset($parametros["per_page"])? $parametros["per_page"] : 20;
                $catalogo_articulos = $catalogo_articulos->paginate($resultadosPorPagina);
            } else {
                $catalogo_articulos = $catalogo_articulos->get();
            }

            return response()->json(['data'=>$catalogo_articulos],HttpResponse::HTTP_OK);
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
}
