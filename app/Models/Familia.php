<?php

namespace App\Models;

use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Familia extends Model{
    
    use SoftDeletes;
    protected $table = 'familias';  
    protected $fillable = ['id','nombre'];    

    public function bienesServicios(){
        return $this->hasMany('App\Models\BienesServicios','familia_id');
    }
}
