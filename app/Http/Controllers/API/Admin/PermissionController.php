<?php

namespace App\Http\Controllers\API\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;

use Illuminate\Support\Facades\Hash;

use Validator;

use App\Http\Controllers\Controller;

use App\Models\Permission;

class PermissionController extends Controller
{
    
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        //$this->authorize('has-permission','G8aCoYYCgE8fAwegn0MvWjxMXhxIIrhy');
        //if (\Gate::denies('has-permission', 'G8aCoYYCgE8fAwegn0MvWjxMXhxIIrhy')){
        if (\Gate::denies('has-permission', \Permissions::SELECCIONAR_PERMISO)){
            return response()->json(['message'=>'No esta autorizado para ver este contenido'],HttpResponse::HTTP_FORBIDDEN);
        }

        try{
            $parametros = $request->all();
            $permisos = Permission::orderBy('group')->orderBy('Description');

            if(!isset($parametros['show_hidden'])){
                $permisos = $permisos->where('is_super','0');
            }

            //Filtros, busquedas, ordenamiento
            if(isset($parametros['query']) && $parametros['query']){
                $permisos = $permisos->where(function($query)use($parametros){
                    return $query->where('description','LIKE','%'.$parametros['query'].'%')
                                ->orWhere('group','LIKE','%'.$parametros['query'].'%');
                });
            }

            if(isset($parametros['page'])){
                $resultadosPorPagina = isset($parametros["per_page"])? $parametros["per_page"] : 20;
    
                $permisos = $permisos->paginate($resultadosPorPagina);
            } else {
                $permisos = $permisos->get();
            }

            return response()->json(['data'=>$permisos],HttpResponse::HTTP_OK);
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
    public function store(Request $request)
    {   
        $this->authorize('has-permission',\Permissions::CRUD_PERMISOS);
        try{
            $validation_rules = [
                'id'=>'required|unique:permissions',
                'description' => 'required',
                'group' => 'required'
            ];
        
            $validation_eror_messajes = [
                'id.required' => 'El ID es requerido',
                'id.unique' => 'El ID debe ser único',
                'description.required' => 'La descripción es requerida',
                'group.required' => 'El grupo es requerido'
            ];

            $parametros = $request->all(); 

            if(!isset($parametros['id'])){
                $parametros['id'] = str_random(32);
            }
            
            $resultado = Validator::make($parametros,$validation_rules,$validation_eror_messajes);

            if($resultado->passes()){
                $permiso = Permission::create($parametros);
                return response()->json(['data'=>$permiso], HttpResponse::HTTP_OK);
            }else{
                return response()->json(['mensaje' => 'Error en los datos del formulario', 'validacion'=>$resultado->passes(), 'errores'=>$resultado->errors()], HttpResponse::HTTP_CONFLICT);
            }
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
        $this->authorize('has-permission',\Permissions::CRUD_PERMISOS);
        try{
            $permiso = Permission::find($id);
            return response()->json(['data'=>$permiso],HttpResponse::HTTP_OK);
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
        $this->authorize('has-permission',\Permissions::CRUD_PERMISOS);
        try{
            $validation_rules = [
                'description' => 'required',
                'group' => 'required'
            ];
        
            $validation_eror_messajes = [
                'id.required' => 'El ID es requerido',
                'id.unique' => 'El ID debe ser único',
                'description.required' => 'La descripción es requerida',
                'group.required' => 'El grupo es requerido'
            ];

            $parametros = $request->all(); 

            if(isset($parametros['id']) && $parametros['id'] != $id){
                $validation_rules['id'] = 'required|unique:permissions';
            }

            $resultado = Validator::make($parametros,$validation_rules,$validation_eror_messajes);

            if($resultado->passes()){
                $permiso = Permission::find($id);

                if($permiso){
                    if(isset($parametros['id']) && $parametros['id'] != $id){
                        $permiso->id = $parametros['id'];
                    }
                    $permiso->description = $parametros['description'];
                    $permiso->group = $parametros['group'];
                    $permiso->is_super = $parametros['is_super'];
                    $permiso->save();
                }

                return response()->json(['data'=>$permiso], HttpResponse::HTTP_OK);
            }else{
                return response()->json(['mensaje' => 'Error en los datos del formulario', 'validacion'=>$resultado->passes(), 'errores'=>$resultado->errors()], HttpResponse::HTTP_CONFLICT);
            }
        }catch(\Exception $e){
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
        $this->authorize('has-permission',\Permissions::CRUD_PERMISOS);
        try{
            $permiso = Permission::find($id);
            $permiso->delete();

            return response()->json(['data'=>'Permiso eliminado'], HttpResponse::HTTP_OK);
        }catch(\Exception $e){
            return response()->json(['error'=>['message'=>$e->getMessage(),'line'=>$e->getLine()]], HttpResponse::HTTP_CONFLICT);
        }
    }
}
