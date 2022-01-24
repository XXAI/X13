<?php

namespace App\Models;

use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ConfigCapturaAbastoSurtimiento extends Model{
    
    use SoftDeletes;
    protected $table = 'config_captura_abasto_surtimiento';  
    protected $fillable = ['fecha_inicio','fecha_fin','ejercicio','no_semana','activo'];
}
