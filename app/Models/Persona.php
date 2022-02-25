<?php

namespace App\Models;

use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Persona extends Model{
    
    use SoftDeletes;
    protected $table = 'personas';  
    protected $fillable = ['nombre_completo','curp','rfc'];
}
