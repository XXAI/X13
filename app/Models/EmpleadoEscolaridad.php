<?php


namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class EmpleadoEscolaridad extends Model
{
    use SoftDeletes;
    protected $fillable = ["id","empleado_id", "secundaria", "preparatoria", "tecnica", "carrera", "titulo", "maestria", "doctorado", "cursos", "especialidad", "diplomado", "poliglota"];
    protected $table = 'empleado_escolaridad';

}
