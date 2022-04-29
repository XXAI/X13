<?php

namespace App\Http\Controllers\API\AdminCatalogos;

use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;

use App\Http\Controllers\Controller;

use App\Http\Requests;

use DB;

use App\Models\BienServicio;
use App\Models\Familia;
use App\Models\PartidaEspecifica;
use App\Models\TipoBienServicio;
use App\Models\Empaque;
use App\Models\UnidadMedida;

class AdminBienesServiciosController extends Controller{

    public function obtenerCatalogos(Request $request){
        try{
            $loggedUser = auth()->userOrFail();
            $parametros = $request->all();

            $catalogos = [
                'familias'              => Familia::get(),
                'partidas_especificas'  => PartidaEspecifica::get(),
                'tipos_bien_servicio'   => TipoBienServicio::get(),
                'empaques'              => Empaque::get(),
                'unidades_medida'       => UnidadMedida::get(),
            ];

            return response()->json(['data'=>$catalogos],HttpResponse::HTTP_OK);
        }catch(\Exception $e){
            return response()->json(['error'=>['message'=>$e->getMessage(),'line'=>$e->getLine()]], HttpResponse::HTTP_CONFLICT);
        }
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request){
        try{
            $loggedUser = auth()->userOrFail();
            $parametros = $request->all();

            /*if(!\Gate::denies('has-permission', 'vPZUt02ZCcGoNuxDlfOCETTjJAobvJvO')){
                $parametros['buscar_catalogo_completo'] = true;
            }*/

            $catalogo_articulos = BienServicio::select('bienes_servicios.*','familias.nombre AS familia','catalogo_tipos_bien_servicio.descripcion AS tipo_bien_servicio',DB::raw('SUM(stocks.existencia+stocks.existencia_unidades) as existencias'))
                                                ->leftJoin('familias','familias.id','=','bienes_servicios.familia_id')
                                                ->leftJoin('catalogo_tipos_bien_servicio','catalogo_tipos_bien_servicio.id','bienes_servicios.tipo_bien_servicio_id')
                                                ->leftJoin('stocks','stocks.bien_servicio_id','=','bienes_servicios.id')
                                                ->groupBy('bienes_servicios.id')
                                                ->orderBy('bienes_servicios.especificaciones');

            //Filtros, busquedas, ordenamiento
            if(isset($parametros['query']) && $parametros['query']){
                $catalogo_articulos = $catalogo_articulos->where(function($query)use($parametros){
                    return $query->where('catalogo_tipos_bien_servicio.descripcion','LIKE','%'.$parametros['query'].'%')
                                ->orWhere('familias.nombre','LIKE','%'.$parametros['query'].'%')
                                ->orWhere('bienes_servicios.clave_cubs','LIKE','%'.$parametros['query'].'%')
                                ->orWhere('bienes_servicios.clave_local','LIKE','%'.$parametros['query'].'%')
                                ->orWhere('bienes_servicios.articulo','LIKE','%'.$parametros['query'].'%')
                                ->orWhere('bienes_servicios.especificaciones','LIKE','%'.$parametros['query'].'%');
                });
            }

            if(isset($parametros['tipo_bien_servicio_id']) && $parametros['tipo_bien_servicio_id']){
                $catalogo_articulos = $catalogo_articulos->where('bienes_servicios.tipo_bien_servicio_id',$parametros['tipo_bien_servicio_id']);
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
            $bien_servicio = BienServicio::with(['familia','partidaEspecifica','empaqueDetalle'=>function($empaqueDetalle){
                                                                                                    $empaqueDetalle->with('unidadMedida','empaque');
                                                                                                }])->find($id);

            return response()->json(['data'=>$bien_servicio],HttpResponse::HTTP_OK);
        }catch(\Exception $e){
            return response()->json(['error'=>['message'=>$e->getMessage(),'line'=>$e->getLine()]], HttpResponse::HTTP_CONFLICT);
        }
    }
}
