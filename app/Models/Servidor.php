<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Servidor extends Model{
    use SoftDeletes;
    public $incrementing = false;
    protected $keyType = 'string';
    protected $table = 'servidores';  
    protected $fillable = ['id','nombre','secret_key','clues','tiene_internet','version','principal','ultima_sincronizacion'];
}
