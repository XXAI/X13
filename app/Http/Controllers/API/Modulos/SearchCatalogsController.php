<?php

namespace App\Http\Controllers\API\Modulos;

use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;

use App\Http\Controllers\Controller;

use App\Models\Clues;
use App\Models\Codigo;
use App\Models\Cr;
use App\Models\Fuente;
use App\Models\Profesion;
use App\Models\Programa;
use App\Models\Rama;
use App\Models\TipoNomina;
use App\Models\TipoProfesion;

class SearchCatalogsController extends Controller
{
    public function getProfesionAutocomplete(Request $request)
    {
        /*if (\Gate::denies('has-permission', \Permissions::VER_ROL) && \Gate::denies('has-permission', \Permissions::SELECCIONAR_ROL)){
            return response()->json(['message'=>'No esta autorizado para ver este contenido'],HttpResponse::HTTP_FORBIDDEN);
        }*/

        try{
            $parametros = $request->all();
            $profesiones = Profesion::select('id', 'descripcion');
            
            //Filtros, busquedas, ordenamiento
            if(isset($parametros['query']) && $parametros['query']){
                $profesiones = $profesiones->where(function($query)use($parametros){
                    return $query->where('descripcion','LIKE','%'.$parametros['query'].'%');
                });
            }

            if(isset($parametros['filter']) && $parametros['filter']){
                switch ($parametros['filter']) {
                    case 'LIC':
                        $profesiones = $profesiones->whereIn('tipo_profesion_id',[1,2,8]);
                        break;
                    case 'MA':
                        $profesiones = $profesiones->whereIn('tipo_profesion_id',[3]);
                        break;
                    case 'DOC':
                        $profesiones = $profesiones->whereIn('tipo_profesion_id',[6]);
                        break;
                    case 'DIP':
                        $profesiones = $profesiones->whereIn('tipo_profesion_id',[4]);
                        break;
                    default:
                        # code...
                        break;
                }
            }
            
            if(isset($parametros['page'])){
                $resultadosPorPagina = isset($parametros["per_page"])? $parametros["per_page"] : 20;
                $profesiones = $profesiones->paginate($resultadosPorPagina);
            } else {
                $profesiones = $profesiones->get();
            }

            return response()->json(['data'=>$profesiones],HttpResponse::HTTP_OK);
        }catch(\Exception $e){
            return response()->json(['error'=>['message'=>$e->getMessage(),'line'=>$e->getLine()]], HttpResponse::HTTP_CONFLICT);
        }
    }

    public function getCodigoAutocomplete(Request $request)
    {
        /*if (\Gate::denies('has-permission', \Permissions::VER_ROL) && \Gate::denies('has-permission', \Permissions::SELECCIONAR_ROL)){
            return response()->json(['message'=>'No esta autorizado para ver este contenido'],HttpResponse::HTTP_FORBIDDEN);
        }*/

        try{
            $parametros = $request->all();
            $codigos = Codigo::select('codigo', 'descripcion', 'grupo_funcion_id')->with('grupoFuncion');
            
            //Filtros, busquedas, ordenamiento
            if(isset($parametros['query']) && $parametros['query']){
                $codigos = $codigos->where(function($query)use($parametros){
                    return $query->where('codigo','LIKE','%'.$parametros['query'].'%')
                                ->orWhere('descripcion','LIKE','%'.$parametros['query'].'%');
                });
            }
            
            if(isset($parametros['page'])){
                $resultadosPorPagina = isset($parametros["per_page"])? $parametros["per_page"] : 20;
                $codigos = $codigos->paginate($resultadosPorPagina);
            } else {
                $codigos = $codigos->get();
            }

            return response()->json(['data'=>$codigos],HttpResponse::HTTP_OK);
        }catch(\Exception $e){
            return response()->json(['error'=>['message'=>$e->getMessage(),'line'=>$e->getLine()]], HttpResponse::HTTP_CONFLICT);
        }
    }

    public function getCluesAutocomplete(Request $request)
    {
        /*if (\Gate::denies('has-permission', \Permissions::VER_ROL) && \Gate::denies('has-permission', \Permissions::SELECCIONAR_ROL)){
            return response()->json(['message'=>'No esta autorizado para ver este contenido'],HttpResponse::HTTP_FORBIDDEN);
        }*/

        try{
            $parametros = $request->all();
            $unidades = Clues::select('clues', 'cve_jurisdiccion', 'nombre_unidad', 'estatus', 'clave_estatus', 'nivel_atencion', 'clave_nivel', 'estatus_acreditacion')->with('cr');
            
            //Filtros, busquedas, ordenamiento
            if(isset($parametros['query']) && $parametros['query']){
                $unidades = $unidades->where(function($query)use($parametros){
                    return $query->where('nombre_unidad','LIKE','%'.$parametros['query'].'%')
                                ->orWhere('clues','LIKE','%'.$parametros['query'].'%');
                });
            }

            if(isset($parametros['page'])){
                $resultadosPorPagina = isset($parametros["per_page"])? $parametros["per_page"] : 20;
                $unidades = $unidades->paginate($resultadosPorPagina);
            } else {

                $unidades = $unidades->get();
            }

            return response()->json(['data'=>$unidades],HttpResponse::HTTP_OK);
        }catch(\Exception $e){
            return response()->json(['error'=>['message'=>$e->getMessage(),'line'=>$e->getLine()]], HttpResponse::HTTP_CONFLICT);
        }
    }
}
