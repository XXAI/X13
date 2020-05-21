<?php

namespace App\Models;

use Tymon\JWTAuth\Contracts\JWTSubject;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\SoftDeletes;

use Illuminate\Foundation\Auth\User as Authenticatable;

class User extends Authenticatable implements JWTSubject{
    use Notifiable;
    use SoftDeletes;
    protected $keyType = 'string';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'username', 'password', 'name', 'email', 'is_superuser', 'avatar' 
    ];

    /**
     * The attributes that should be hidden for arrays.
     *
     * @var array
     */
    protected $hidden = [
        'password', 'remember_token',
    ];

    /**
     * Get the identifier that will be stored in the subject claim of the JWT.
     *
     * @return mixed
     */
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    /**
     * Return a key value array, containing any custom claims to be added to the JWT.
     *
     * @return array
     */
    public function getJWTCustomClaims()
    {
        return [];
    }

    public function roles(){
        return $this->belongsToMany('App\Models\Role');
    }

    public function permissions(){
        return $this->belongsToMany('App\Models\Permission')->withPivot('status');
    }

    //Funciones para validación y obtención de permisos del usuario.

    //Aplica sobre un objeto usuario
    public function hasPermission($permission){
        $permissions = User::getPermissionsList($this);
        if(isset($permissions[$permission])){
            return true;
        }else{
            return false;
        }
    } 

    //Aplica desde la clase, y usa un objeto usuario como parametro
    static function getPermissionsList($usuario){
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

        return $permisos;
    }
}
