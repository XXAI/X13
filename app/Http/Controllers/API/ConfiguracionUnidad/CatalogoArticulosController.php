<?php

namespace App\Http\Controllers\API\ConfiguracionUnidad;

use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;

use Illuminate\Support\Facades\Hash;

use Validator;
use Illuminate\Validation\Rule;

use App\Http\Controllers\Controller;

use App\Models\UnidadMedicaCatalogo;
use App\Models\UnidadMedicaCatalogoArticulo;
use App\Models\BienServicio;

use DB;

class CatalogoArticulosController extends Controller
{
    public function getCatalogos(Request $request){
        try{
            $loggedUser = auth()->userOrFail();

            $catalogos_unidad = UnidadMedicaCatalogo::with('tipoBienServicio')->where('unidad_medica_id',$loggedUser->unidad_medica_asignada_id)->get();

            return response()->json(['data'=>$catalogos_unidad],HttpResponse::HTTP_OK);
        }catch(\Exception $e){
            return response()->json(['error'=>['message'=>$e->getMessage(),'line'=>$e->getLine()]], HttpResponse::HTTP_CONFLICT);
        }
    }

    public function cerrarCaptura(Request $request, $id){
        try{
            $loggedUser = auth()->userOrFail();
            $catalogo = UnidadMedicaCatalogo::find($id);
            $catalogo->puede_editar = false;
            $catalogo->ultima_modificacion_por = $loggedUser->id;
            $catalogo->save();
            
            return response()->json(['data'=>$catalogo],HttpResponse::HTTP_OK);
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
        /*if (\Gate::denies('has-permission', \Permissions::VER_ROL) && \Gate::denies('has-permission', \Permissions::SELECCIONAR_ROL)){
            return response()->json(['message'=>'No esta autorizado para ver este contenido'],HttpResponse::HTTP_FORBIDDEN);
        }*/
        
        try{
            $loggedUser = auth()->userOrFail();
            $parametros = $request->all();

            $catalogo_articulos = UnidadMedicaCatalogoArticulo::select('unidad_medica_catalogo_articulos.*','cog_partidas_especificas.descripcion as partida_especifica','familias.nombre as familia',
                                                                'familias.id as familia_id','bienes_servicios.articulo','bienes_servicios.clave_cubs','bienes_servicios.clave_local',
                                                                'bienes_servicios.especificaciones','bienes_servicios.descontinuado',
                                                                DB::raw('IF(bienes_servicios.clave_local,bienes_servicios.clave_local,bienes_servicios.clave_cubs) AS clave'))
                                                        ->leftjoin('bienes_servicios','bienes_servicios.id','=','unidad_medica_catalogo_articulos.bien_servicio_id')
                                                        ->leftjoin('cog_partidas_especificas','cog_partidas_especificas.clave','=','bienes_servicios.clave_partida_especifica')
                                                        ->leftjoin('familias','familias.id','=','bienes_servicios.familia_id')
                                                        ->where('unidad_medica_catalogo_articulos.unidad_medica_id',$loggedUser->unidad_medica_asignada_id)
                                                        ->orderBy('unidad_medica_catalogo_articulos.updated_at','DESC');

            if(isset($parametros['catalogo_id']) && $parametros['catalogo_id']){
                $catalogo_articulos = $catalogo_articulos->where('unidad_medica_catalogo_articulos.unidad_medica_catalogo_id',$parametros['catalogo_id']);
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
    public function show($id){
        //$this->authorize('has-permission',\Permissions::VER_ROL);
        try{
            $articulo = UnidadMedicaCatalogoArticulo::with(['articulo'=>function($articulo){ $articulo->with('partidaEspecifica','familia'); }])->find($id);
            
            return response()->json(['data'=>$articulo],HttpResponse::HTTP_OK);
        }catch(\Exception $e){
            return response()->json(['error'=>['message'=>$e->getMessage(),'line'=>$e->getLine()]], HttpResponse::HTTP_CONFLICT);
        }
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request){
        //$this->authorize('has-permission',\Permissions::CREAR_ROL);
        try{
            $loggedUser = auth()->userOrFail();
            $parametros = $request->all();

            DB::beginTransaction();

            $parametros['unidad_medica_id'] = $loggedUser->unidad_medica_asignada_id;
            $parametros['modificado_por'] = $loggedUser->id;

            $articulo = UnidadMedicaCatalogoArticulo::create($parametros);

            if($articulo){
                $catalogo_unidad = UnidadMedicaCatalogo::find($parametros['unidad_medica_catalogo_id']);
                $catalogo_unidad->ultima_modificacion_por = $loggedUser->id;
                $catalogo_unidad->total_articulos += 1;
                $catalogo_unidad->save();

                DB::commit();
                return response()->json(['data'=>$articulo], HttpResponse::HTTP_OK);
            }else{
                DB::rollback();
                return response()->json(['error'=>'No se pudo crear el elemento'], HttpResponse::HTTP_CONFLICT);
            }
        }catch(\Exception $e){
            DB::rollback();
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
    public function update(Request $request, $id){
        //$this->authorize('has-permission',\Permissions::EDITAR_ROL);
        try{
            $loggedUser = auth()->userOrFail();
            $parametros = $request->all();
            $articulo = UnidadMedicaCatalogoArticulo::find($id);
            
            DB::beginTransaction();

            $parametros['modificado_por'] = $loggedUser->id;

            if($articulo->update($parametros)){
                $catalogo_unidad = UnidadMedicaCatalogo::find($articulo->unidad_medica_catalogo_id);
                $catalogo_unidad->ultima_modificacion_por = $loggedUser->id;
                $catalogo_unidad->save();
                DB::commit();
                return response()->json(['data'=>$articulo], HttpResponse::HTTP_OK);
            }else{
                DB::rollback();
                return response()->json(['error'=>'No se pudo guardar el Tipo de Pedido'], HttpResponse::HTTP_CONFLICT);
            }
        }catch(\Exception $e){
            DB::rollback();
            return response()->json(['error'=>['message'=>$e->getMessage(),'line'=>$e->getLine()]], HttpResponse::HTTP_CONFLICT);
        }
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id){
        //$this->authorize('has-permission',\Permissions::ELIMINAR_ROL);
        try{
            DB::beginTransaction();

            $loggedUser = auth()->userOrFail();

            $articulo = UnidadMedicaCatalogoArticulo::find($id);
            $catalogo_unidad = UnidadMedicaCatalogo::find($articulo->unidad_medica_catalogo_id);

            $articulo->modificado_por = $loggedUser->id;
            $articulo->save();
            $articulo->delete();

            $catalogo_unidad->ultima_modificacion_por = $loggedUser->id;
            $catalogo_unidad->total_articulos -= 1;
            $catalogo_unidad->save();

            DB::commit();

            return response()->json(['data'=>'Tipo de Pedido eliminado'], HttpResponse::HTTP_OK);
        }catch(\Exception $e){
            DB::rollback();
            return response()->json(['error'=>['message'=>$e->getMessage(),'line'=>$e->getLine()]], HttpResponse::HTTP_CONFLICT);
        }
    }
}
