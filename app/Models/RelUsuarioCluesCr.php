<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class RelUsuarioCluesCr extends Model
{
    use SoftDeletes;
    protected $fillable = [''];
    protected $table = 'rel_usuario_clues_cr';
    
    public function clues(){
        return $this->hasOne('App\Models\Clues', 'clues', "clues");
    }

    public function cr(){
        return $this->hasOne('App\Models\Cr','cr','cr_id');
    }

    public function empleados()
    {
        return $this->hasMany('App\Models\Empleado','cr_id','cr_id');
    }
    

}
