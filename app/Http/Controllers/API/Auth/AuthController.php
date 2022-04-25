<?php

namespace App\Http\Controllers\API\Auth;

use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Permission;

class AuthController extends Controller{
    /**
     * Create a new AuthController instance.
     *
     * @return void
     */
    public function __construct(){
        $this->middleware('auth:api', ['except' => ['login','refresh']]);
    }

    /**
     * Get a JWT via given credentials.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function login(){
        $credentials = request(['username', 'password']);
        $user = User::where('username',$credentials['username'])->first();

        if(!$user){
            return response()->json(['error' => 'Nombre de usuario no encontrado'], 401);
        }

        if($user->status != 'OK'){
            if($user->status == 'BLCKD'){
                return response()->json(['error' => 'El usuario ha sido bloqueado por 5 intentos fallidos de inicio de sesión','status'=>"BLCKD"], 401);
            }else if($user->status == 'BAN'){
                return response()->json(['error' => 'El usuario ha sido baneado del sistema','status'=>"BAN"], 401);
            }else{
                return response()->json(['error' => 'Estatus usuario: '.$user->status], 401);
            }
        }

        if (! $token = auth()->attempt($credentials)) {
            $user->failed_attempts += 1;
            if($user->failed_attempts == 5){
                $user->status = 'BLCKD';
            }
            $user->save();

            return response()->json(['error' => 'Contraseña incorrecta'], 401);
        }else{
            $user->last_login = date("Y-m-d H:i:s", strtotime('now'));
            $user->failed_attempts = 0;
            $user->save();
        }

        return $this->respondWithToken($token, $credentials);
    }

    /**
     * Get the authenticated User.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function me(){
        try {
            return response()->json(auth()->userOrFail());
        } catch (\Tymon\JWTAuth\Exceptions\UserNotDefinedException $e) {
            return response()->json(['error' => 'Usuario no válido'], 401);
        }
    }

    /**
     * Log the user out (Invalidate the token).
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function logout(){
        auth()->logout();

        return response()->json(['message' => 'Sesión cerrada con éxito'],200);
    }

    /**
     * Refresh a token.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function refresh(){
        return $this->respondWithToken(auth()->refresh());
    }

    /**
     * Get the token array structure.
     *
     * @param  string $token
     *
     * @return \Illuminate\Http\JsonResponse
     */
    protected function respondWithToken($token, $credentials = null){
        $response = [
            'access_token' => $token,
            'token_type' => 'bearer',
            'expires_in' => auth()->factory()->getTTL() * 60
        ];

        if($credentials){
            $usuario = User::where('username',$credentials['username'])->with('unidadMedicaAsignada')->first();
            $permisos = [];

            if($usuario->is_superuser){
                $permisos_raw = Permission::get();
                foreach ($permisos_raw as $permiso) {
                    $permisos[$permiso->id] = true;
                }
            }else{
                $roles_permisos = User::with('roles.permissions','permissions')->find($usuario->id);

                foreach ($roles_permisos->roles as $rol) {
                    foreach ($rol->permissions as $permiso) {
                        if(!isset($permisos[$permiso->id])){
                            $permisos[$permiso->id] = true;
                        }
                    }
                }

                foreach ($roles_permisos->permissions as $permiso) {
                    if(!isset($permisos[$permiso->id])){
                        $permisos[$permiso->id] = true;
                    }elseif(!$permiso->pivot->status){
                        unset($permisos[$permiso->id]);
                    }
                }
            }

            $response['user_data'] = $usuario;
            $response['permissions'] = $permisos;
        }

        return response()->json($response);
    }
}
