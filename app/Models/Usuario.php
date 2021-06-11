<?php

namespace App\Models;

use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Usuario extends Model{
    
    use SoftDeletes;
    protected $table = 'users';  
    protected $fillable = ['username', 'password', 'name', 'email', 'is_superuser', 'avatar' ];
    
    public function roles(){
        return $this->belongsToMany('App\Models\Role');
    }

    public function permissions(){
        return $this->belongsToMany('App\Models\Permission')->withPivot('status');
    }

    public function grupos(){
        return $this->belongsToMany('App\Models\Grupo','grupos_usuarios','usuario_id','grupo_id');
    }
}