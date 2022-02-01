<?php

namespace App\Models;

use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Marca extends Model{
    use SoftDeletes;
    protected $table = 'catalogo_marcas';  
    protected $fillable = ['id','nombre'];
}