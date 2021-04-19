<?php

namespace App\Http\Controllers\API\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;

use Illuminate\Support\Facades\Hash;

use Validator;

use App\Http\Controllers\Controller;

use App\Models\Role, App\Models\Permission;
use DB;

class RoleController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        if (\Gate::denies('has-permission', \Permissions::VER_ROL) && \Gate::denies('has-permission', \Permissions::SELECCIONAR_ROL)){
            return response()->json(['message'=>'No esta autorizado para ver este contenido'],HttpResponse::HTTP_FORBIDDEN);
        }
        
        try{
            $parametros = $request->all();
            $roles = Role::getModel();
            
            //Filtros, busquedas, ordenamiento
            if(isset($parametros['query']) && $parametros['query']){
                $roles = $roles->where(function($query)use($parametros){
                    return $query->where('name','LIKE','%'.$parametros['query'].'%');
                });
            }

            if(isset($parametros['page'])){
                $resultadosPorPagina = isset($parametros["per_page"])? $parametros["per_page"] : 20;
    
                $roles = $roles->paginate($resultadosPorPagina);
            } else {

                $roles = $roles->with('permissions')->get();
            }

            return response()->json(['data'=>$roles],HttpResponse::HTTP_OK);
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
        $this->authorize('has-permission',\Permissions::CREAR_ROL);
        try{
            $validation_rules = [
                'name' => 'required',
                'permissions' => 'required|min:1'
            ];
        
            $validation_eror_messages = [
                'name.required' => 'El nombre es requerido',
                'permission.required' => 'Es requerido tener permisos asignados',
                'permission.min' => 'Se debe tener al menos un permiso asignado'
            ];

            $parametros = $request->all(); 
            
            $resultado = Validator::make($parametros,$validation_rules,$validation_eror_messages);

            if($resultado->passes()){
                DB::beginTransaction();

                $rol = Role::create($parametros);

                $permissions = array_map(function($n){ return $n['id']; },$parametros['permissions']);

                if($rol){
                    $rol->permissions()->sync($permissions);
                    $rol->save();
                    DB::commit();
                    return response()->json(['data'=>$rol], HttpResponse::HTTP_OK);
                }else{
                    DB::rollback();
                    return response()->json(['error'=>'No se pudo crear el Rol'], HttpResponse::HTTP_CONFLICT);
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
    public function show($id)
    {
        $this->authorize('has-permission',\Permissions::VER_ROL);
        try{
            $rol = Role::with('permissions')->find($id);
            $rol->permissions->makeHidden('pivot');
            return response()->json(['data'=>$rol],HttpResponse::HTTP_OK);
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
        $this->authorize('has-permission',\Permissions::EDITAR_ROL);
        try{
            $validation_rules = [
                'name' => 'required',
                'permissions' => 'required|min:1'
            ];
        
            $validation_eror_messages = [
                'name.required' => 'El nombre es requerido',
                'permission.required' => 'Es requerido tener permisos asignados',
                'permission.min' => 'Se debe tener al menos un permiso asignado'
            ];

            
            $parametros = $request->all();

            $resultado = Validator::make($parametros,$validation_rules,$validation_eror_messages);

            if($resultado->passes()){
                DB::beginTransaction();

                $rol = Role::with('permissions')->find($id);

                $rol->name = $parametros['name'];
                
                $permissions = array_map(function($n){ return $n['id']; },$parametros['permissions']);

                if($rol){
                    $rol->permissions()->sync($permissions);
                    $rol->save();
                    DB::commit();
                    return response()->json(['data'=>$rol], HttpResponse::HTTP_OK);
                }else{
                    DB::rollback();
                    return response()->json(['error'=>'No se pudo crear el Rol'], HttpResponse::HTTP_CONFLICT);
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
    public function destroy($id)
    {
        $this->authorize('has-permission',\Permissions::ELIMINAR_ROL);
        try{
            $rol = Role::find($id);
            $rol->permissions()->detach();
            $rol->delete();

            return response()->json(['data'=>'Rol eliminado'], HttpResponse::HTTP_OK);
        }catch(\Exception $e){
            return response()->json(['error'=>['message'=>$e->getMessage(),'line'=>$e->getLine()]], HttpResponse::HTTP_CONFLICT);
        }
    }
}
