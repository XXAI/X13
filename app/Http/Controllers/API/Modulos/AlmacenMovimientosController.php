<?php

namespace App\Http\Controllers\API\Modulos;

use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;

use App\Http\Controllers\Controller;

use App\Http\Requests;

use DB;

use App\Models\Almacen;
use App\Models\Programa;
use App\Models\Proveedor;
use App\Models\TipoMovimiento;

class AlmacenMovimientosController extends Controller{
    
    public function obtenerCatalogos(Request $request){
        try{
            $loggedUser = auth()->userOrFail();
            $parametros = $request->all();
            $catalogos = [
                'programas'   => Programa::get(),
                'almacenes'   => Almacen::where('unidad_medica_id',$loggedUser->unidad_medica_asignada_id)->get(),
                'proveedores' => Proveedor::get(),
                'tipos_movimiento' => TipoMovimiento::where('movimiento','ENT')->get(),
            ];
            
            return response()->json(['data'=>$catalogos],HttpResponse::HTTP_OK);
        }catch(\Exception $e){
            return response()->json(['error'=>['message'=>$e->getMessage(),'line'=>$e->getLine()]], HttpResponse::HTTP_CONFLICT);
        }
    }
}