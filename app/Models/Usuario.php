<?php

namespace App\Models;

use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\SoftDeletes;

class Usuario extends BaseModel{
    
    use SoftDeletes;
    protected $generarID = true;
    protected $guardarIDServidor = true;
    protected $guardarIDUsuario = false;
    protected $keyType = 'string';
    protected $table = 'users';  
    protected $fillable = ['username', 'password', 'name', 'email', 'is_superuser', 'avatar' ];
    
    public function roles(){
        return $this->belongsToMany('App\Models\Role');
    }

    public function permissions(){
        return $this->belongsToMany('App\Models\Permission')->withPivot('status');
    }
}