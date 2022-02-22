<?php

namespace App\Http\Controllers\API\ConfiguracionUnidad;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Http\Response as HttpResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Response, Validator;

use App\Models\UnidadMedica;

class ConfiguracionUnidadController extends Controller{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request){
        try{
            $parametros = $request->all();
            $usuario = auth()->userOrFail();

            $unidad_medica = UnidadMedica::with(['almacenes.tipoAlmacen','catalogos.tipoBienServicio','distrito','usuarios'=>function($usuarios){ $usuarios->where('is_superuser','<>',1); }])
                                        ->where('id',$usuario->unidad_medica_asignada_id)->first();

            return response()->json(['data'=>$unidad_medica],HttpResponse::HTTP_OK);
        }catch(\Exception $e){
            return response()->json(['error'=>['message'=>$e->getMessage(),'line'=>$e->getLine()]], HttpResponse::HTTP_CONFLICT);
        }
    }
}
