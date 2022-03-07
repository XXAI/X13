<?php

namespace App\Http\Controllers\API\ConfiguracionUnidad;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Http\Response as HttpResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Response, Validator;

use App\Models\User;
use App\Models\Almacen;

class AdminUsuariosController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request){
        try{
            if(\Gate::denies('has-permission', 'wqA6AeVDylBMkKokKmWWdkjvlNYXbGLc')){
                throw new \Exception("El usuario no tiene permiso de realizar esta operación", 1);
            }
            $parametros = $request->all();
            $usuario = auth()->userOrFail();

            //Obtener los usuarios asignados a la misma unidad medica
            $usuarios = User::with('almacenes')->where('unidad_medica_asignada_id',$usuario->unidad_medica_asignada_id)->where('is_superuser',0);

            //Filtros, busquedas, ordenamiento
            if(isset($parametros['query']) && $parametros['query']){
                $usuarios = $usuarios->where(function($query)use($parametros){
                    return $query->where('name','LIKE','%'.$parametros['query'].'%')
                                ->orWhere('email','LIKE','%'.$parametros['query'].'%')
                                ->orWhere('username','LIKE','%'.$parametros['query'].'%');
                });
            }

            if(isset($parametros['page'])){
                $resultadosPorPagina = isset($parametros["per_page"])? $parametros["per_page"] : 20;
    
                $usuarios = $usuarios->paginate($resultadosPorPagina);
            } else {
                $usuarios = $usuarios->get();
            }

            //Catalogo de almacenes
            $almacenes = Almacen::where('unidad_medica_id',$usuario->unidad_medica_asignada_id)->get();

            return response()->json(['data'=>$usuarios,'catalogos'=>['almacenes'=>$almacenes]],HttpResponse::HTTP_OK);
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
    public function update(Request $request, $id){
        try{
            if(\Gate::denies('has-permission', 'wqA6AeVDylBMkKokKmWWdkjvlNYXbGLc')){
                throw new \Exception("El usuario no tiene permiso de realizar esta operación", 1);
            }

            $parametros = $request->all();
            $usuario = auth()->userOrFail();

            $item = User::find($id);
            $item->almacenes()->sync($parametros['almacenes_id']);
            $item->load('almacenes');

            return response()->json(['data'=>$item],HttpResponse::HTTP_OK);
        }catch(\Exception $e){
            return response()->json(['error'=>['message'=>$e->getMessage(),'line'=>$e->getLine()]], HttpResponse::HTTP_CONFLICT);
        }
    }
}
