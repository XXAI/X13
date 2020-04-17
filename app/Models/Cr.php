<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Cr extends Model
{
    use SoftDeletes;
    protected $fillable = [''];
    protected $table = 'catalogo_cr';
    protected $primaryKey = 'cr';
    public $incrementing = false;

    public function clues(){
        return $this->hasOne('App\Models\Clues', 'clues', "clues");
    }
}
