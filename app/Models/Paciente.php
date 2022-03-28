<?php

namespace App\Models;

use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Paciente extends Model{
    use SoftDeletes;
    protected $table = 'pacientes';  
    protected $fillable = ['nombre_completo','curp','expediente_clinico'];
}
