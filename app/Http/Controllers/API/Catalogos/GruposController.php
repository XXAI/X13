<?php

namespace App\Http\Controllers\API\Catalogos;

use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;

use Illuminate\Support\Facades\Hash;

use Validator;

use App\Http\Controllers\Controller;

use App\Models\Grupo, App\Models\UnidadMedica;
use DB;

class GruposController extends Controller
{
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
            $parametros = $request->all();
            $grupos = Grupo::with('unidadMedicaPrincipal');
            //Filtros, busquedas, ordenamiento
            if(isset($parametros['query']) && $parametros['query']){
                $grupos = $grupos->where(function($query)use($parametros){
                    return $query->where('descripcion','LIKE','%'.$parametros['query'].'%');
                });
            }

            if(isset($parametros['page'])){
                $resultadosPorPagina = isset($parametros["per_page"])? $parametros["per_page"] : 20;
    
                $grupos = $grupos->paginate($resultadosPorPagina);
            } else {
                $grupos = $grupos->get();
            }

            return response()->json(['data'=>$grupos],HttpResponse::HTTP_OK);
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
            $validation_rules = [
                'descripcion' => 'required',
                //'unidades_medicas' => 'required|min:1'
            ];
        
            $validation_eror_messages = [
                'descripcion.required' => 'El nombre es requerido',
                //'unidades_medicas.required' => 'Es requerido tener unidades asignadas',
                //'unidades_medicas.min' => 'Se debe tener al menos una unidad asignada'
            ];

            $parametros = $request->all(); 
            
            $resultado = Validator::make($parametros,$validation_rules,$validation_eror_messages);

            if($resultado->passes()){
                DB::beginTransaction();

                $parametros['clave_tipo_grupo'] = 'PORD';
                $parametros['total_unidades'] = count($parametros['unidades_medicas']);

                $grupo = Grupo::create($parametros);

                $unidades_medicas = array_map(function($n){ return $n['id']; },$parametros['unidades_medicas']);

                if($grupo){
                    $grupo->unidadesMedicas()->sync($unidades_medicas);
                    $grupo->save();
                    DB::commit();
                    return response()->json(['data'=>$grupo], HttpResponse::HTTP_OK);
                }else{
                    DB::rollback();
                    return response()->json(['error'=>'No se pudo crear el Grupo'], HttpResponse::HTTP_CONFLICT);
                }
            }else{
                return response()->json(['mensaje' => 'Error en los datos del formulario', 'validacion'=>$resultado->passes(), 'errores'=>$resultado->errors()], HttpResponse::HTTP_CONFLICT);
            }
        }catch(\Exception $e){
            DB::rollback();
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
            $grupo = Grupo::with('unidadesMedicas','unidadMedicaPrincipal')->find($id);
            $grupo->unidadesMedicas->makeHidden('pivot');

            $unidades_ids = $grupo->unidadesMedicas->pluck('id');
            $unidades_medicas = UnidadMedica::whereNotIn('id',$unidades_ids)->get();

            return response()->json(['data'=>$grupo,'catalogos'=>['unidades_medicas'=>$unidades_medicas]],HttpResponse::HTTP_OK);
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
        //$this->authorize('has-permission',\Permissions::EDITAR_ROL);
        try{
            $validation_rules = [
                'descripcion' => 'required',
                //'unidades_medicas' => 'required|min:1'
            ];
        
            $validation_eror_messages = [
                'descripcion.required' => 'El nombre es requerido',
                //'unidades_medicas.required' => 'Es requerido tener unidades asignadas',
                //'unidades_medicas.min' => 'Se debe tener al menos una unidad asignada'
            ];
            
            $parametros = $request->all();

            $resultado = Validator::make($parametros,$validation_rules,$validation_eror_messages);

            if($resultado->passes()){
                DB::beginTransaction();

                $grupo = Grupo::with('unidadesMedicas')->find($id);

                $grupo->descripcion = $parametros['descripcion'];
                $grupo->unidad_medica_principal_id = $parametros['unidad_medica_principal_id'];
                $grupo->total_unidades = count($parametros['unidades_medicas']);

                $unidades_medicas = array_map(function($n){ return $n['id']; },$parametros['unidades_medicas']);

                if($grupo){
                    $grupo->unidadesMedicas()->sync($unidades_medicas);
                    $grupo->save();
                    DB::commit();
                    return response()->json(['data'=>$grupo], HttpResponse::HTTP_OK);
                }else{
                    DB::rollback();
                    return response()->json(['error'=>'No se pudo crear el Grupo'], HttpResponse::HTTP_CONFLICT);
                }
            }else{
                return response()->json(['mensaje' => 'Error en los datos del formulario', 'validacion'=>$resultado->passes(), 'errores'=>$resultado->errors()], HttpResponse::HTTP_CONFLICT);
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
            $grupo = Grupo::find($id);
            $grupo->unidadesMedicas()->detach();
            $grupo->usuarios()->detach();
            $grupo->delete();

            return response()->json(['data'=>'Grupo eliminado'], HttpResponse::HTTP_OK);
        }catch(\Exception $e){
            return response()->json(['error'=>['message'=>$e->getMessage(),'line'=>$e->getLine()]], HttpResponse::HTTP_CONFLICT);
        }
    }
}
