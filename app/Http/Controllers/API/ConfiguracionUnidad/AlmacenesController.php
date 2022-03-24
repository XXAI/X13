<?php

namespace App\Http\Controllers\API\ConfiguracionUnidad;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Http\Response as HttpResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Response, Validator;

use App\Models\Almacen;

class AlmacenesController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {

        try{

            //$parametros = Input::all();
            $parametros = $request->all();
            $usuario = auth()->userOrFail();

            //$servicios = Almacen::orderBy('id')->with('clues');
            //SI NO TRAE CLUES MOSTRAR TODOS LOS SERVICIOS

            if(isset($usuario->unidad_medica_asignada_id, $usuario->unidad_medica_asignada_id)){

                $almacenes = Almacen::select('almacenes.*')->with('unidad_medica', 'tipoAlmacen')
                ->where('unidad_medica_id', $usuario->unidad_medica_asignada_id)
                ->orderBy('id');
                
            }else{
                $almacenes = Almacen::orderBy('id')->with('unidad_medica', 'tipoAlmacen');
            }

            //Filtros, busquedas, ordenamiento
            if(isset($parametros['query']) && $parametros['query']){
                $almacenes = $almacenes->where(function($query)use($parametros){
                    return $query->where('nombre','LIKE','%'.$parametros['query'].'%');
                                //->orWhere('nombre','LIKE','%'.$parametros['query'].'%');
                });
            }

            if(isset($parametros['page'])){
                $resultadosPorPagina = isset($parametros["per_page"])? $parametros["per_page"] : 20;
    
                $almacenes = $almacenes->paginate($resultadosPorPagina);
            } else {
                $almacenes = $almacenes->get();
            }

            return response()->json(['data'=>$almacenes],HttpResponse::HTTP_OK);
        }catch(\Exception $e){
            return response()->json(['error'=>['message'=>$e->getMessage(),'line'=>$e->getLine()]], HttpResponse::HTTP_CONFLICT);
        }
    }
    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request){
        $loggedUser = auth()->userOrFail();
        $datos = $request->all();

        try {
            $reglas = [
                //'unidad_medica_id'     => 'required:almacenes',
                'nombre'               => 'required:almacenes',
                'tipo_almacen_id'      => 'required:almacenes',
                //'responsable'          => '',
            ];

            $mensajes = [
                'unidad_medica_id'              => 'La Unidad Medica es Obligatoria',
                'nombre.required'               => 'El nombre del Almacen es Obligatorio',
                'tipo_almacen_id.required'      => 'El tipo de Almacen es Obligatorio',
                'responsable.required'          => 'La nombre del Responsable del Almacen es Obligatorio',
            ];

            $v = Validator::make($datos, $reglas, $mensajes);
            
            if ($v->fails()) {
                return Response::json(array($v->errors(), 409));
            }

            $datos['user_id'] = $loggedUser->id;
            $datos['unidad_medica_id'] = $loggedUser->unidad_medica_asignada_id;

            $almacen = Almacen::create($datos);

            if(count($datos['tipos_movimiento'])){
                $almacen->tiposMovimiento()->sync($datos['tipos_movimiento']);
            }
            
            return response()->json(['data'=>$almacen],HttpResponse::HTTP_OK);

        } catch (\Exception $e) {
            return response()->json(['error'=>['message'=>$e->getMessage(),'line'=>$e->getLine()]], HttpResponse::HTTP_CONFLICT);
        }
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id){
        $almacen = Almacen::with('unidad_medica','tipoAlmacen','tiposMovimiento')->find($id);

        if(!$almacen){
            return response()->json(['No se encuentra el recurso que esta buscando.'], HttpResponse::HTTP_CONFLICT);
            //404
        }

        return response()->json(['data' => $almacen], 200);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id){
        $loggedUser = auth()->userOrFail();
        $datos = $request->all();

        $reglas = [
            //'unidad_medica_id'     => 'required:almacenes',
            'nombre'               => 'required:almacenes',
            'tipo_almacen_id'      => 'required:almacenes',
            //'responsable'          => 'required:almacenes',
        ];

        $mensajes = [
            'unidad_medica_id'              => 'La Unidad Medica es Obligatoria',
            'nombre.required'               => 'El nombre del Almacen es Obligatorio',
            'tipo_almacen_id.required'      => 'El tipo de Almacen es Obligatorio',
            'responsable.required'          => 'La nombre del Responsable del Almacen es Obligatorio',
        ];

        //$inputs = Input::only('nombre');
        $almacen = new Almacen();

        $v = Validator::make($datos, $reglas, $mensajes);
        

        if ($v->fails()) {

            return Response::json(array($v->errors(), 409));
        }

        try {
            $almacen = Almacen::find($id);

            $datos['user_id'] = $loggedUser->id;
            $datos['unidad_medica_id'] = $loggedUser->unidad_medica_asignada_id;

            $almacen->update($datos);

            if(count($datos['tipos_movimiento'])){
                $almacen->tiposMovimiento()->sync($datos['tipos_movimiento']);
            }else{
                $almacen->tiposMovimiento()->sync([]);
            }
            /*
            $almacen->unidad_medica_id     = $datos['unidad_medica_id'];
            $almacen->nombre               = $datos['nombre'];
            $almacen->tipo_almacen_id      = $datos['tipo_almacen_id'];
            $almacen->externo              = $datos['externo'];
            $almacen->unidosis             = $datos['unidosis'];
            $almacen->responsable          = $datos['responsable'];
            $almacen->user_id              = $datos['user_id'];
            $almacen->save();
            */

            return response()->json(['data'=>$almacen],HttpResponse::HTTP_OK);

        } catch (\Exception $e) {
            return $this->respuestaError($e->getMessage(), 409);
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
        try {
            $total_stocks = Stock::where('almacen_id',$id)->where(function($where){
                                                                $where->where('existencia','>',0)->orWhere('existencia_unidades','>',0);
                                                            })->count();

            if($total_stocks > 0){
                throw new \Exception("No se pude eliminar el almacen, ya que tiene articulos en existencia", 1);
            }

            $almacen = Almacen::find($id);

            $almacen->tiposMovimiento()->sync([]);
            $almacen->delete();

            return response()->json(['data'=>$id],HttpResponse::HTTP_OK);
        } catch (\Exception $e) {
            return response()->json(['error'=>['message'=>$e->getMessage(),'line'=>$e->getLine()]], HttpResponse::HTTP_CONFLICT);
        }
    }
}
