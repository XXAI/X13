<?php
namespace App\Http\Controllers\API\Modulos;

use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;

use App\Http\Requests;

use App\Http\Controllers\Controller;
use \Validator,\Hash, \Response, \DB;

use App\Models\Firmantes;
/*use App\Models\EmpleadoEscolaridad;
use App\Models\Clues;
use App\Models\Cr;
use App\Models\Profesion;
use App\Models\Rama;
use App\Models\PermutaAdscripcion;
use App\Models\CluesEmpleado;
use App\Models\User;*/

class FirmantesController extends Controller
{
    public function index()
    {
        
        try{
            $loggedUser = auth()->userOrFail();
            
            $loggedUser->load('gruposUnidades.listaFirmantes.empleado');
            
            return response()->json(['data'=>$loggedUser->gruposUnidades[0]->listaFirmantes ],HttpResponse::HTTP_OK);
        }catch(\Exception $e){
            return response()->json(['error'=>['message'=>$e->getMessage(),'line'=>$e->getLine()]], HttpResponse::HTTP_CONFLICT);
        }
    }

    /**
     * sTORE the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $mensajes = [
            
            'required'      => "required",
            'email'         => "email",
            'unique'        => "unique"
        ];

        $reglas = [
            //'grupo_unidades_id'             => 'required',
            'firmante_id'             => 'required',
            'cargo'             => 'required',
        ];

        $inputs = $request->all();
        $v = Validator::make($inputs, $reglas, $mensajes);

        if ($v->fails()) {
            throw new \Exception("Hacen falta campos obligatorios", 1);
            //return response()->json(['error' => "Hace falta campos obligatorios."], HttpResponse::HTTP_CONFLICT);
        }

        DB::beginTransaction();
        try {
            
            $loggedUser = auth()->userOrFail();
            
            $loggedUser->load('gruposUnidades.listaFirmantes');

            $firmantes = new Firmantes();
                
            $firmantes->grupo_unidades_id = $loggedUser->gruposUnidades[0]->id;
            $firmantes->firmante_id = $inputs['firmante_id'];
            $firmantes->cargo = strtoupper($inputs['cargo']);
            $firmantes->save();
            DB::commit();
            
            return response()->json($firmantes,HttpResponse::HTTP_OK);

        } catch (\Exception $e) {
            DB::rollback();
            return Response::json(['error' => $e->getMessage()], HttpResponse::HTTP_CONFLICT);
        }

    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        try{
            $firmante = Firmantes::find($id);

            $firmante->delete();

            return response()->json(['eliminado'=>true],HttpResponse::HTTP_OK);
        }catch(\Exception $e){
            return response()->json(['error'=>['message'=>$e->getMessage(),'line'=>$e->getLine()]], HttpResponse::HTTP_CONFLICT);
        }
    }
}
