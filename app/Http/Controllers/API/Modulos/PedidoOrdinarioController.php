<?php

namespace App\Http\Controllers\API\Modulos;

use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;

use App\Http\Controllers\Controller;

use App\Http\Requests;

use Illuminate\Support\Facades\Input;

use DB;

use App\Models\Pedido;

class PedidoOrdinarioController extends Controller
{

    public function datosCatalogo(){
        try{
            $data = [];
            $data = $this->getUserAccessData();

            return response()->json(['data'=>$data],HttpResponse::HTTP_OK);
        }catch(\Exception $e){
            return response()->json(['error'=>['message'=>$e->getMessage(),'line'=>$e->getLine()]], HttpResponse::HTTP_CONFLICT);
        }
    }
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        try{
            $parametros = Input::all();
            $almacen_id = '00011';

            $pedidos = Pedido::getModel();
            
            //Filtros, busquedas, ordenamiento
            if(isset($parametros['query']) && $parametros['query']){
                $pedidos = $pedidos->where(function($query)use($parametros){
                    return $query->where('folio','LIKE','%'.$parametros['query'].'%')
                                ->orWhere('descripcion','LIKE','%'.$parametros['query'].'%')
                                ->orWhere('observaciones','LIKE','%'.$parametros['query'].'%');
                });
            }

            if(isset($parametros['page'])){
                $resultadosPorPagina = isset($parametros["per_page"])? $parametros["per_page"] : 20;
                $pedidos = $pedidos->paginate($resultadosPorPagina);

            } else {
                $pedidos = $pedidos->get();
            }

            return response()->json(['data'=>$pedidos],HttpResponse::HTTP_OK);
        }catch(\Exception $e){
            return response()->json(['error'=>['message'=>$e->getMessage(),'line'=>$e->getLine()]], HttpResponse::HTTP_CONFLICT);
        }
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        try{
            $pedido = Pedido::with(['listaInsumosMedicos'=>function($insumos){
                                        $insumos->with('insumoMedico.medicamento','insumoMedico.materialCuracion','listaInsumosUnidades');
                                    },'listaUnidadesMedicas.unidadMedica'])->find($id);

            $return_data = ['data'=>$pedido];

            return response()->json($return_data,HttpResponse::HTTP_OK);
        }catch(\Exception $e){
            return response()->json(['error'=>['message'=>$e->getMessage(),'line'=>$e->getLine()]], HttpResponse::HTTP_CONFLICT);
        }
    }

    /**
     * sTORE the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        try{
            DB::beginTransaction();
            $parametros = Input::all();

            $datos_pedido = $parametros['pedido'];
            $datos_pedido['estatus'] = 'BOR';
            $datos_pedido['tipo_pedido'] = 'ORD';

            $pedido = Pedido::create($datos_pedido);

            if(isset($parametros['unidades_pedido']) && count($parametros['unidades_pedido'])){
                $unidades_medicas = [];
                foreach($parametros['unidades_pedido'] as $unidad){
                    $unidades_medicas[] = ['unidad_medica_id' => $unidad['id']];
                }
                $pedido->listaUnidadesMedicas()->createMany($unidades_medicas);
            }

            $listado_insumos = [];
            $total_insumos = 0;
            foreach ($parametros['insumos_pedido'] as $insumo) {
                $listado_insumos[] = [
                    'insumo_medico_id'=>$insumo['id'],
                    'tipo_insumo'=>$insumo['tipo_insumo'],
                    'cantidad'=>$insumo['cantidad']
                ];
                $total_insumos += $insumo['cantidad'];
            }
            $pedido->listaInsumosMedicos()->createMany($listado_insumos);

            if(isset($parametros['unidades_pedido']) && count($parametros['unidades_pedido'])){
                $insumos_pedido = $pedido->listaInsumosMedicos()->pluck('id','insumo_medico_id');
                $listado_insumos_unidades = [];
                foreach ($parametros['insumos_pedido'] as $insumo) {
                    if(isset($insumo['cuadro_distribucion']) && count($insumo['cuadro_distribucion'])){
                        foreach ($insumo['cuadro_distribucion'] as $unidad) {
                            $listado_insumos_unidades[] = ['unidad_medica_id'=>$unidad['id'], 'cantidad'=>$unidad['cantidad'], 'pedido_insumo_id'=>$insumos_pedido[$insumo['id']]];
                        }
                    }
                }
                $pedido->listaInsumosMedicosUnidades()->createMany($listado_insumos_unidades);
            }

            $pedido->total_claves = count($listado_insumos);
            $pedido->total_insumos = $total_insumos;
            $pedido->save();

            DB::commit();

            $pedido->load('listaInsumosMedicos');

            $return_data = [
                'data' => $pedido
            ];

            return response()->json($return_data,HttpResponse::HTTP_OK);
        }catch(\Exception $e){
            DB::rollback();
            return response()->json(['error'=>['message'=>$e->getMessage(),'line'=>$e->getLine()]], HttpResponse::HTTP_CONFLICT);
        }
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        try{
            DB::beginTransaction();

            $parametros = Input::all();

            $pedido = Pedido::with([
                    'listaInsumosMedicos'=>function($insumos){ $insumos->withTrashed(); },
                    'listaUnidadesMedicas'=>function($unidades){ $unidades->withTrashed(); },
                ])->find($id); 

            $datos_pedido = $parametros['pedido'];
            $datos_pedido['estatus'] = 'BOR';
            $datos_pedido['tipo_pedido'] = 'ORD';
            $diferencia_claves = 0;
            $total_insumos = 0;

            $listado_insumos = $parametros['insumos_pedido'];
            $insumos_editados = [];
            $insumos_eliminados = [];
            $insumos_agregados = [];
            $insumos_pedido = [];

            $unidades_pedido_raw = $pedido->listaUnidadesMedicas;
            $unidades_pedido = [];
            foreach ($unidades_pedido_raw as $unidad) {
                $unidades_pedido[$unidad->unidad_medica_id] = $unidad;
            }
            $unidades_agregadas = [];
            $unidades_editadas = [];
            $unidades_eliminadas = [];
            if(isset($parametros['unidades_pedido']) && count($parametros['unidades_pedido'])){
                //Si recibo unidades del cliente, se puede modificar lista de unidades
                foreach($parametros['unidades_pedido'] as $unidad){
                    if(!isset($unidades_pedido[$unidad['id']])){
                        $unidades_agregadas[] = ['unidad_medica_id' => $unidad['id']];
                    }else{
                        if($unidades_pedido[$unidad['id']]->deleted_at){
                            $unidades_pedido[$unidad['id']]->deleted_at = null;
                            $unidades_editadas[] = $unidades_pedido[$unidad['id']];
                        }
                        $unidades_pedido[$unidad['id']] = NULL;
                    }
                }
                foreach ($unidades_pedido as $unidad_id => $unidad) {
                    if($unidad){
                        if(count($unidades_agregadas) > 0){
                            $unidad->unidad_medica_id = $unidades_agregadas[0]['unidad_medica_id'];
                            $unidad->deleted_at = null;
                            $unidades_editadas[] = $unidad;
                            array_splice($unidades_agregadas,0,1);
                        }else{
                            $unidades_eliminadas[] = $unidad->id;
                        }
                    }
                }
                if(count($unidades_agregadas)){
                    $pedido->listaUnidadesMedicas()->createMany($unidades_agregadas);
                }
                if(count($unidades_editadas)){
                    $pedido->listaUnidadesMedicas()->saveMany($unidades_editadas);
                }
                if(count($unidades_eliminadas)){
                    $pedido->listaUnidadesMedicas()->whereIn('id',$unidades_eliminadas)->delete();
                }
            }else if(count($unidades_pedido_raw)){
                //Si ya tengo undades guardadas, pero no recibo unidades del cliente, se eliminan todas las unidades
                $pedido->listaUnidadesMedicas()->delete();
            }

            //Return temporal para pruebas...
            /*urn_data = [
                'id' => $id, 
                'data' => Input::all(),
                'lista_insumos' => $listado_insumos,
                'lista_guardada' => $insumos_pedido,
                'insumos_editados' => $insumos_editados,
                'insumos_eliminados' => $insumos_eliminados,
                'insumos_agregados' => $insumos_agregados,
            ];*/
            //DB::rollback();
            //return response()->json($return_data,HttpResponse::HTTP_OK);
            $pedido_insumos_unidades = [];
            $insumos_pedido_raw = $pedido->listaInsumosMedicos;
            foreach ($insumos_pedido_raw as $insumo) {
                $insumos_pedido[$insumo->id] = $insumo;
            }
            foreach ($listado_insumos as $insumo) {
                if(!isset($insumo['pedido_insumo_id'])){
                    $insumos_agregados[] = ['insumo_medico_id' => $insumo['id'], 'tipo_insumo' => $insumo['tipo_insumo'], 'cantidad' => $insumo['cantidad'], 'monto' => $insumo['monto'] ];
                    $total_insumos += $insumo['cantidad'];
                }elseif(isset($insumos_pedido[$insumo['pedido_insumo_id']])){
                    $insumo_pedido = $insumos_pedido[$insumo['pedido_insumo_id']];
                    if($insumo_pedido->insumo_medico_id !=  $insumo['id'] || $insumo_pedido->cantidad !=  $insumo['cantidad'] || $insumo_pedido->monto !=  $insumo['monto'] ){
                        $insumo_pedido->insumo_medico_id = $insumo['id'];
                        $insumo_pedido->tipo_insumo = $insumo['tipo_insumo'];
                        $insumo_pedido->cantidad =  $insumo['cantidad'];
                        $insumo_pedido->monto =  $insumo['monto'];
                        //
                        $insumos_editados[] = $insumo_pedido;
                    }
                    $total_insumos += $insumo['cantidad'];
                    $insumos_pedido[$insumo['pedido_insumo_id']] = NULL;
                }
                
                if(isset($insumo['cuadro_distribucion']) && count($insumo['cuadro_distribucion']) > 0){
                    foreach ($insumo['cuadro_distribucion'] as $unidad) {
                        $pedido_insumos_unidades[] = ['insumo_id'=>$insumo['id'], 'cantidad'=>$unidad['cantidad'], 'unidad_medica_id'=>$unidad['id']];
                    }
                }
            }

            foreach ($insumos_pedido as $pedido_insumo_id => $pedido_insumo) {
                if($pedido_insumo){
                    if(count($insumos_agregados) > 0){
                        $pedido_insumo->insumo_medico_id = $insumos_agregados[0]['insumo_medico_id'];
                        $pedido_insumo->tipo_insumo = $insumos_agregados[0]['tipo_insumo'];
                        $pedido_insumo->cantidad =  $insumos_agregados[0]['cantidad'];
                        $pedido_insumo->monto =  $insumos_agregados[0]['monto'];
                        $pedido_insumo->deleted_at = null;
                        $insumos_editados[] = $pedido_insumo;
                        array_splice($insumos_agregados,0,1);
                    }else{
                        $insumos_eliminados[] = $pedido_insumo_id;
                    }
                }
            }

            $diferencia_claves = (count($insumos_agregados) - count($insumos_eliminados));
            $datos_pedido['total_claves'] = $pedido->total_claves + $diferencia_claves;
            $datos_pedido['total_insumos'] = $total_insumos;

            if(count($insumos_agregados)){
                $pedido->listaInsumosMedicos()->createMany($insumos_agregados);
            }
            if(count($insumos_editados)){
                $pedido->listaInsumosMedicos()->saveMany($insumos_editados);
            }
            if(count($insumos_eliminados)){
                $pedido->listaInsumosMedicos()->whereIn('id',$insumos_eliminados)->delete();
                $pedido->listaInsumosMedicosUnidades()->whereIn('pedido_insumo_id',$insumos_eliminados)->delete();
            }

            $pedido->update($datos_pedido);

            if(count($pedido_insumos_unidades) > 0){
                $pedido->load(['listaInsumosMedicos'=>function($insumos){
                    $insumos->with(['listaInsumosUnidades'=>function($unidades){
                        $unidades->withTrashed();
                    }])->withTrashed();
                }])->withTrashed();

                $pedido_insumos_unidades_guardar = [];
                $pedido_insumos_unidades_editados = [];
                $pedido_insumos_unidades_eliminados = [];

                $insumos_unidades_raw = $pedido->listaInsumosMedicos;
                $insumos_unidades = [];

                foreach ($insumos_unidades_raw as $insumo_unidad) {
                    $insumos_unidades[$insumo_unidad->insumo_medico_id] = [
                        'pedido_insumo_id' => $insumo_unidad->id,
                        'lista_unidades' => []
                    ];
                    foreach ($insumo_unidad->listaInsumosUnidades as $unidad) {
                        $insumos_unidades[$insumo_unidad->insumo_medico_id]['lista_unidades'][$unidad->unidad_medica_id] = $unidad;
                    }
                }

                foreach ($pedido_insumos_unidades as $insumo_unidad) {
                    $pedido_insumo = $insumos_unidades[$insumo_unidad['insumo_id']];
                    if(isset($pedido_insumo['lista_unidades'][$insumo_unidad['unidad_medica_id']])){
                        $pedido_insumo_unidad = $pedido_insumo['lista_unidades'][$insumo_unidad['unidad_medica_id']];
                        if($pedido_insumo_unidad->cantidad != $insumo_unidad['cantidad']){
                            $pedido_insumo_unidad->cantidad = $insumo_unidad['cantidad'];
                            $pedido_insumo_unidad->deleted_at = NULL;
                            $pedido_insumos_unidades_editados[] = $pedido_insumo_unidad;
                        }
                        $insumos_unidades[$insumo_unidad['insumo_id']]['lista_unidades'][$insumo_unidad['unidad_medica_id']] = NULL;
                    }else{
                        $pedido_insumo_unidad = [
                            'pedido_insumo_id' => $pedido_insumo['pedido_insumo_id'],
                            'unidad_medica_id' => $insumo_unidad['unidad_medica_id'],
                            'cantidad' => $insumo_unidad['cantidad']
                        ];
                        $pedido_insumos_unidades_guardar[] = $pedido_insumo_unidad;
                    }
                }

                foreach ($insumos_unidades as $insumo_pedido) {
                    foreach ($insumo_pedido['lista_unidades'] as $insumo_unidad) {
                        if($insumo_unidad){
                            if(count($pedido_insumos_unidades_guardar) > 0){
                                $insumo_unidad->pedido_insumo_id = $pedido_insumos_unidades_guardar[0]['pedido_insumo_id'];
                                $insumo_unidad->unidad_medica_id = $pedido_insumos_unidades_guardar[0]['unidad_medica_id'];
                                $insumo_unidad->cantidad = $pedido_insumos_unidades_guardar[0]['cantidad'];
                                $insumo_unidad->deleted_at = NULL;
                                $pedido_insumos_unidades_editados[] = $insumo_unidad;
                                array_splice($pedido_insumos_unidades_guardar,0,1);
                            }else{
                                $pedido_insumos_unidades_eliminados[] = $insumo_unidad->id;
                            }
                        }
                    }
                }

                //DB::rollback();
                //return response()->json($pedido_insumos_unidades_editados,HttpResponse::HTTP_OK);
                if(count($pedido_insumos_unidades_guardar)){
                    $pedido->listaInsumosMedicosUnidades()->createMany($pedido_insumos_unidades_guardar);
                }
                if(count($pedido_insumos_unidades_editados)){
                    $pedido->listaInsumosMedicosUnidades()->saveMany($pedido_insumos_unidades_editados);
                }
                if(count($pedido_insumos_unidades_eliminados)){
                    $pedido->listaInsumosMedicosUnidades()->whereIn('id',$pedido_insumos_unidades_eliminados)->delete();
                }
            }

            DB::commit();

            $pedido->load('listaInsumosMedicos.listaInsumosUnidades');
            $return_data = [
                'data' => $pedido
            ];
            return response()->json($return_data,HttpResponse::HTTP_OK);
        }catch(\Exception $e){
            DB::rollback();
            return response()->json(['error'=>['message'=>$e->getMessage(),'line'=>$e->getLine()]], HttpResponse::HTTP_CONFLICT);
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
        //
    }

    private function getUserAccessData($loggedUser = null){
        if(!$loggedUser){
            $loggedUser = auth()->userOrFail();
        }
        
        //$loggedUser->load('perfilCr');
        $loggedUser->load('grupos.unidadesMedicas','grupos.unidadMedicaPrincipal');
        
        //$lista_clues = [];
        /*foreach ($loggedUser->grupos as $grupo) {
            $lista_unidades = $grupo->unidadesMedicas->toArray();
            
            $lista_clues += $lista_clues + $lista_unidades;
        }*/
        //$accessData->lista_clues = $lista_clues;

        $accessData = (object)[];
        $accessData->grupo_pedidos = $loggedUser->grupos[0];

        /*if (\Gate::allows('has-permission', \Permissions::ADMIN_PERSONAL_ACTIVO)){
            $accessData->is_admin = true;
        }else{
            $accessData->is_admin = false;
        }*/

        return $accessData;
    }
}
