<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Clues extends Model
{
    use SoftDeletes;
    protected $fillable = [''];
    protected $table = 'catalogo_clues';
    protected $primaryKey = 'clues';
    public $incrementing = false;

    public function cr(){
        return $this->hasMany('App\Models\Cr','clues','clues');
    }

    public function responsable(){
        return $this->hasOne('App\Models\Empleado','id','responsable_id');
    }
}
