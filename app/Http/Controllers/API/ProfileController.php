<?php

namespace App\Http\Controllers\API;

use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;

use Illuminate\Support\Facades\Hash;

use Validator;

use App\Http\Controllers\Controller;
use App\Models\User;

use DB;

class ProfileController extends Controller
{
    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        try{
            $auth_user = auth()->user();

            if($auth_user->id != $id){
                throw new \Exception("El usuario requisitado no coincide con la sesion iniciada", 1);
            }

            $user = User::with('roles.permissions','permissions')->find($id);

            return response()->json(['data'=>$user],HttpResponse::HTTP_OK);
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
        try{
            $validation_rules = [
                'name' => 'required',
                'email' => 'required'
            ];
        
            $validation_eror_messages = [
                'name.required' => 'El nombre es obligatorio',
                'email.required' => 'Es correo electronico es obligatorio'
            ];

            $usuario = User::find($id);

            $parametros = $request->all();

            $resultado = Validator::make($parametros,$validation_rules,$validation_eror_messages);

            if($resultado->passes()){
                DB::beginTransaction();

                $usuario->name = $parametros['name'];
                $usuario->email = $parametros['email'];
                $usuario->username = $parametros['username'];
                $usuario->avatar = $parametros['avatar'];
                
                if($parametros['password']){
                    $usuario->password = Hash::make($parametros['password']);
                }

                $usuario->save();

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
}
