<?php

namespace App\Http\Controllers\API\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;

use Illuminate\Support\Facades\Hash;

use Validator;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Grupo;
use App\Models\Programa;
use App\Models\UnidadMedica;

use DB;

class UserController extends Controller
{

    public function getCatalogs(Request $request){
        try{
            $loggedUser = auth()->userOrFail();
            $parametros = $request->all();
            $return_data = [];

            //if(isset($parametros['grupos']) && $parametros['grupos']){
            $return_data['grupos'] = Grupo::all();
            $return_data['programas'] = Programa::all();
            $return_data['unidades_medicas'] = UnidadMedica::all();
            //}

            return response()->json(['data'=>$return_data],HttpResponse::HTTP_OK);
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
            $usuarios = User::getModel();

            if(!$loggedUser->is_superuser){
                $usuarios = $usuarios->where('is_superuser','0');
            }
            
            //Filtros, busquedas, ordenamiento
            if($parametros['query']){
                $usuarios = $usuarios->where(function($query)use($parametros){
                    return $query->where('name','LIKE','%'.$parametros['query'].'%')
                                ->orWhere('username','LIKE','%'.$parametros['query'].'%')
                                ->orWhere('email','LIKE','%'.$parametros['query'].'%');
                });
            }

            if(isset($parametros['page'])){
                $resultadosPorPagina = isset($parametros["per_page"])? $parametros["per_page"] : 20;
    
                $usuarios = $usuarios->paginate($resultadosPorPagina);
            } else {
                $usuarios = $usuarios->get();
            }

            return response()->json(['data'=>$usuarios,'parametros'=>$parametros],HttpResponse::HTTP_OK);
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
        try{
            $validation_rules = [
                'name' => 'required',
                'email' => 'required'                
            ];
        
            $validation_eror_messages = [
                'name.required' => 'El nombre es obligatorio',
                'email.required' => 'Es correo electronico es obligatorio'
            ];

            $parametros = $request->all();

            $resultado = Validator::make($parametros,$validation_rules,$validation_eror_messages);

            if($resultado->passes()){
                $search_user = User::where('email',$parametros['email'])->orWhere('username',$parametros['username'])->first();

                if($search_user){
                    if($search_user->email == $parametros['email']){
                        return response()->json(['mensaje' => 'El correo electronico debe ser unico'], HttpResponse::HTTP_CONFLICT);
                    }

                    if($search_user->username == $parametros['username']){
                        return response()->json(['mensaje' => 'El nombre de usuario debe ser unico'], HttpResponse::HTTP_CONFLICT);
                    }
                }

                DB::beginTransaction();

                $usuario = new User();
                $usuario->name = $parametros['name'];
                $usuario->email = $parametros['email'];
                $usuario->username = $parametros['username'];
                $usuario->password = Hash::make($parametros['password']);
                $usuario->is_superuser = $parametros['is_superuser'];
                $usuario->status = $parametros['status'];
                $usuario->avatar = $parametros['avatar'];
                $usuario->unidad_medica_asignada_id = (isset($parametros['unidad_medica_asignada']))?$parametros['unidad_medica_asignada']['id']:null;
                
                $usuario->save();

                if(!$usuario->is_superuser){
                    $roles = $parametros['roles'];
                    $permisos = $parametros['permissions'];
                }else{
                    $roles = [];
                    $permisos = [];
                }
                $grupos = $parametros['groups'];
                $programas = $parametros['programas'];
                
                $usuario->roles()->sync($roles);
                $usuario->permissions()->sync($permisos);
                $usuario->grupos()->sync($grupos);
                $usuario->programas()->sync($programas);

                DB::commit();

                return response()->json(['data'=>$usuario],HttpResponse::HTTP_OK);
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
        return response()->json(['data'=>User::with('roles','permissions','grupos','unidadMedicaAsignada','programas')->find($id)],HttpResponse::HTTP_OK);
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
        try{
            $validation_rules = [
                'name' => 'required',
                'username' => 'required',
                'email' => 'required'
            ];
        
            $validation_eror_messages = [
                'name.required' => 'El nombre es obligatorio',
                'email.required' => 'El correo electronico es obligatorio',
                'email.unique' => 'El correo electronico debe ser unico',
                'username.required' => 'El nombre de usuario es obligatorio',
                'username.unique' => 'El nombre de usuario debe ser unico',
            ];

            $usuario = User::with('roles','permissions','grupos','unidadMedicaAsignada')->find($id);

            $parametros = $request->all();

            $resultado = Validator::make($parametros,$validation_rules,$validation_eror_messages);

            if($resultado->passes()){
                $search_user = User::where(function($where)use($parametros){
                                            $where->where('email',$parametros['email'])->orWhere('username',$parametros['username']);
                                        })->where('id','!=',$usuario->id)->first();

                if($search_user){
                    if($search_user->email == $parametros['email']){
                        return response()->json(['mensaje' => 'El correo electronico debe ser unico'], HttpResponse::HTTP_CONFLICT);
                    }

                    if($search_user->username == $parametros['username']){
                        return response()->json(['mensaje' => 'El nombre de usuario debe ser unico'], HttpResponse::HTTP_CONFLICT);
                    }
                }

                DB::beginTransaction();

                $usuario->name = $parametros['name'];
                $usuario->email = $parametros['email'];
                $usuario->username = $parametros['username'];
                $usuario->is_superuser = $parametros['is_superuser'];
                $usuario->status = $parametros['status'];
                $usuario->avatar = $parametros['avatar'];
                $usuario->unidad_medica_asignada_id = (isset($parametros['unidad_medica_asignada']))?$parametros['unidad_medica_asignada']['id']:null;
                
                if($parametros['password']){
                    $usuario->password = Hash::make($parametros['password']);
                }

                $usuario->save();

                if(!$usuario->is_superuser){
                    $roles = $parametros['roles'];
                    $permisos = $parametros['permissions'];
                }else{
                    $roles = [];
                    $permisos = [];
                }
                $grupos = $parametros['groups'];
                $programas = $parametros['programas'];

                $usuario->roles()->sync($roles);
                $usuario->permissions()->sync($permisos);
                $usuario->grupos()->sync($grupos);
                $usuario->programas()->sync($programas);

                DB::commit();

                return response()->json(['guardado'=>true,'usuario'=>$usuario],HttpResponse::HTTP_OK);
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
        try{
            $usuario = User::find($id);

            $usuario->delete();

            return response()->json(['eliminado'=>true],HttpResponse::HTTP_OK);
        }catch(\Exception $e){
            return response()->json(['error'=>['message'=>$e->getMessage(),'line'=>$e->getLine()]], HttpResponse::HTTP_CONFLICT);
        }
    }
}
