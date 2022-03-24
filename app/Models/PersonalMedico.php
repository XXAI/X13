<?php

namespace App\Models;

use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PersonalMedico extends Model{
    
    use SoftDeletes;
    protected $table = 'personal_medico';  
    protected $fillable = ['unidad_medica_id','nombre_completo','curp','rfc','especialidad','puede_recetar','sirh_id','actualizado_sirh'];
}

