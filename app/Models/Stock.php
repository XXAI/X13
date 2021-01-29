<?php

namespace App\Models;

use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Stock extends Model{
    
    use SoftDeletes;
    protected $table = 'stocks';  
    protected $fillable = ['id','almacen_id','insumo_medico_id','programa_id','marca_id','lote','fecha_caducidad','codigo_barras','existencia','existencia_unidosis','user_id'];

    public function insumoMedico(){
        return $this->belongsTo('App\Models\InsumoMedico','insumo_medico_id');
    }
}
