<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Firmantes extends Model
{
    use SoftDeletes;
    protected $fillable = ['id','grupo_unidades_id','firmante_id', 'cargo'];
    protected $table = 'firmantes_grupo';

    public function empleado(){
        return $this->hasOne('App\Models\Empleado', 'id', "firmante_id");
    }
}
