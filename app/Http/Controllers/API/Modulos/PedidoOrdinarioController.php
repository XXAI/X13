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
                $insumos->with('insumoMedico.medicamento','insumoMedico.materialCuracion');
            }])->find($id);

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
            $parametros = Input::all();

            $datos_pedido = $parametros['pedido'];
            $datos_pedido['estatus'] = 'BOR';
            $datos_pedido['tipo_pedido'] = 'ORD';

            $pedido = Pedido::create($datos_pedido);

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

            $pedido->total_claves = count($listado_insumos);
            $pedido->total_insumos = $total_insumos;
            $pedido->save();

            $return_data = [
                'data' => $pedido
            ];

            return response()->json($return_data,HttpResponse::HTTP_OK);
        }catch(\Exception $e){
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
            $parametros = Input::all();

            $pedido = Pedido::find($id);

            $datos_pedido = $parametros['pedido'];
            $datos_pedido['estatus'] = 'BOR';
            $datos_pedido['tipo_pedido'] = 'ORD';

            $pedido->update($datos_pedido);

            $listado_insumos = $parametros['insumos_pedido'];
            $insumos_editados = [];
            $insumos_eliminados = [];
            $insumos_agregados = [];
            $insumos_pedido = [];
            //$insumos_pedido = $pedido->listaInsumosMedicos->pluck('cantidad','id');
            $insumos_pedido_raw = $pedido->listaInsumosMedicos->toArray();
            
            foreach ($insumos_pedido_raw as $insumo) {
                $insumos_pedido[$insumo['id']] = $insumo;
            }

            foreach ($listado_insumos as $insumo) {
                if(!isset($insumo['pedido_insumo_id'])){
                    $insumos_agregados[] = $insumo;
                }elseif(isset($insumos_pedido[$insumo['pedido_insumo_id']])){
                    if($insumos_pedido[$insumo['pedido_insumo_id']]['insumo_medico_id'] !=  $insumo['id'] || $insumos_pedido[$insumo['pedido_insumo_id']]['cantidad'] !=  $insumo['cantidad'] || $insumos_pedido[$insumo['pedido_insumo_id']]['monto'] !=  $insumo['monto'] ){
                        $insumos_editados[] = $insumo;
                    }
                    $insumos_pedido[$insumo['pedido_insumo_id']] = 0;
                }
            }

            foreach ($insumos_pedido as $key => $value) {
                if($value > 0){
                    $insumos_eliminados[] = $key;
                }
            }

            $return_data = [
                'id' => $id, 
                'data' => Input::all(),
                'lista_insumos' => $listado_insumos,
                'lista_guardada' => $insumos_pedido,
                'insumos_editados' => $insumos_editados,
                'insumos_eliminados' => $insumos_eliminados,
                'insumos_agregados' => $insumos_agregados,
            ];

            return response()->json($return_data,HttpResponse::HTTP_OK);
        }catch(\Exception $e){
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
