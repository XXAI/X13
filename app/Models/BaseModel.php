<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Request;
use \DB;

use JWTAuth, JWTFactory;
use Tymon\JWTAuth\Exceptions\JWTException;
use Tymon\JWTAuth\Exceptions\TokenExpiredException;

class BaseModel extends Model {
    protected $generarID = true;
    protected $guardarIDServidor = true;
    protected $guardarIDUsuario = true;
    public $incrementing = false;

    
    protected function verificarGenerarID() {
        if ($this->generarID) {

            $ultimo_incremento = DB::table($this->table)->select("incremento")->where("servidor_id",config('app.servidor_id'))->orderBy('incremento', 'desc')->first();
            if (!$ultimo_incremento) { 
                $incremento = 1;    
            } else {
                $incremento = $ultimo_incremento->incremento + 1;
            }
               
            $this->attributes['incremento'] = $incremento;
            $this->attributes['id'] =  config('app.servidor_id').$incremento;
        }
    }

    protected function verificarGuardarIDServidor() {
        if ($this->guardarIDServidor) {
            $this->attributes['servidor_id'] =  config('app.servidor_id');
        }
    }

    protected function verificarGuardarUsuario(){
        if ($this->guardarIDUsuario) {
            // Obtener el usuario del JWT

            try{
                $obj =  JWTAuth::parseToken()->getPayload();
                $usuario = Usuario::find($obj->get('id'));
                
                if(!$usuario){
                    $this->attributes['user_id'] = "";              
                }
                $this->attributes['user_id'] = $obj->get('id');
                
            } catch (TokenExpiredException $e) {
                $this->attributes['user_id'] = "";  
            } catch (JWTException $e) {
                $this->attributes['user_id'] = "";
            }
        }
    }


    public static function boot(){
        parent::boot();

        static::creating(function($item){
            $item->verificarGuardarIDServidor();
            $item->verificarGenerarID();
            $item->verificarGuardarUsuario();
        });

        static::updating(function($item){
            $item->verificarGuardarUsuario();
        });
    }

    public function usuario(){
        if ($this->guardarIDUsuario) {
		    return $this->belongsTo('App\Models\User', 'user_id');
        }
        return null;
	}
}