<?php

namespace App\Http\Controllers\API\Modulos;

use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;

use App\Http\Controllers\Controller;

use App\Http\Requests;

use Illuminate\Support\Facades\Input;

use DB;

use App\Models\Pedido;
use App\Models\UnidadMedica;
use App\Models\Movimiento;
use App\Models\Stock;

class RecepcionPedidosController extends Controller
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
            
            $pedidos = $pedidos->orderBy('updated_at','desc')->whereIn('estatus',['PUB']);

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
                                    },'unidadMedica.almacenes','programa','avanceRecepcion','recepcionesAnteriores','recepcionActual.listaInsumosBorrador'])->find($id);

            $return_data = ['data'=>$pedido];

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
            DB::beginTransaction();

            $loggedUser = auth()->userOrFail();

            $parametros = Input::all();

            $pedido = Pedido::with(['listaInsumosMedicos','avanceRecepcion','recepcionActual.listaInsumosBorrador'])->find($id); 

            if(isset($pedido->recepcionActual[0])){
                $pedido->recepcionActual[0]->almacen_id = $parametros['recepcion']['almacen_id'];
                $pedido->recepcionActual[0]->fecha_movimiento = $parametros['recepcion']['fecha_movimiento'];
                $pedido->recepcionActual[0]->entrega = $parametros['recepcion']['entrega'];
                $pedido->recepcionActual[0]->recibe = $parametros['recepcion']['recibe'];
                $pedido->recepcionActual[0]->save();

                $recepcion_actual = $pedido->recepcionActual[0];
            }else{
                $movimiento_data = [
                    'almacen_id' => $parametros['recepcion']['almacen_id'],
                    'direccion_movimiento' => 'ENT',
                    'estatus' => 'RP-BR',
                    'fecha_movimiento' => $parametros['recepcion']['fecha_movimiento'],
                    'programa_id' => $pedido->programa_id,
                    'entrega' => $parametros['recepcion']['entrega'],
                    'recibe' => $parametros['recepcion']['recibe'],
                    'folio' => $pedido->folio,
                    'descripcion' => 'Recepción de pedido',
                    'user_id' => $loggedUser->id
                ];
                $recepcion_actual = Movimiento::create($movimiento_data);
                $pedido->recepcionActual()->attach($recepcion_actual);
            }
            $suma_recepciones = [];

            if(!$parametros['concluir']){
                //MovmientosInsumosBorrador
                $insumos_guardados = [];
                if(count($recepcion_actual->listaInsumosBorrador)){
                    foreach ($recepcion_actual->listaInsumosBorrador as $insumo) {
                        $insumos_guardados[$insumo->id] = $insumo;
                    }
                }

                $listado_insumos = $parametros['insumos_recibidos'];
                $crear_insumos_borrador = [];
                $editar_insumos_borrador = [];
                $eliminar_insumos_borrador = [];

                foreach ($listado_insumos as $insumo) {
                    if(!$insumo['id']){
                        $crear_insumos_borrador[] = [
                            'insumo_medico_id' => $insumo['insumo_medico_id'],
                            'direccion_movimiento' => 'ENT',
                            'modo_movimiento' => 'NRM',
                            'cantidad' => $insumo['cantidad'],
                            'lote' => $insumo['lote'],
                            'fecha_caducidad' => $insumo['fecha_caducidad'],
                            'codigo_barras' => $insumo['codigo_barras'],
                            'user_id' => $loggedUser->id
                        ];
                    }else{
                        $insumo_editar = $insumos_guardados[$insumo['id']];
                        $insumo_editar->cantidad = $insumo['cantidad'];
                        $insumo_editar->lote = $insumo['lote'];
                        $insumo_editar->fecha_caducidad = $insumo['fecha_caducidad'];
                        $insumo_editar->codigo_barras = $insumo['codigo_barras'];

                        $editar_insumos_borrador[] = $insumo_editar;
                        unset($insumos_guardados[$insumo['id']]);
                    }
                }

                if(count($insumos_guardados)){
                    $eliminar_insumos_borrador = array_keys($insumos_guardados);
                }

                if(count($crear_insumos_borrador)){
                    $recepcion_actual->listaInsumosBorrador()->createMany($crear_insumos_borrador);
                }

                if(count($editar_insumos_borrador)){
                    $recepcion_actual->listaInsumosBorrador()->saveMany($editar_insumos_borrador);
                }

                if(count($eliminar_insumos_borrador)){
                    $recepcion_actual->listaInsumosBorrador()->whereIn('id',$eliminar_insumos_borrador)->delete();
                }
            }else{
                //MovimientoInsumos y Stock
                //creando estructura con stocks
                $listado_insumos = $parametros['insumos_recibidos'];
                foreach ($listado_insumos as $insumo) {
                    if(!isset($insumo['marca_id'])){
                        $insumo['marca_id'] = null;
                    }

                    $stock = Stock::where('almacen_id',$recepcion_actual->almacen_id)
                                    ->where('insumo_medico_id',$insumo['insumo_medico_id'])
                                    ->where('programa_id',$recepcion_actual->programa_id)
                                    ->where('marca_id',$insumo['marca_id'])
                                    ->where('lote',$insumo['lote'])
                                    ->where('fecha_caducidad',$insumo['fecha_caducidad'])
                                    ->where('codigo_barras',$insumo['codigo_barras'])
                                    ->first();

                    if($stock){
                        $stock->existencia += $insumo['cantidad'];
                        $stock->save();
                    }else{
                        $stock = Stock::create([
                            'almacen_id'    => $recepcion_actual->almacen_id,
                            'insumo_medico_id'  => $insumo['insumo_medico_id'],
                            'programa_id'   => $recepcion_actual->programa_id,
                            'marca_id'  => $insumo['marca_id'],
                            'lote'  => $insumo['lote'],
                            'fecha_caducidad'   => $insumo['fecha_caducidad'],
                            'codigo_barras' => $insumo['codigo_barras'],
                            'user_id' => $loggedUser->id,
                            'existencia' => $insumo['cantidad']
                        ]);
                    }

                    $recepcion_actual->listaInsumosMedicos()->create([
                        'stock_id' => $stock->id,
                        'insumo_medico_id' => $insumo['insumo_medico_id'],
                        'direccion_movimiento' => 'EN',
                        'modo_movimiento' => 'NRM',
                        'cantidad' => $insumo['cantidad'],
                        'user_id' => $loggedUser->id,
                    ]);
                }
                $recepcion_actual->estatus = 'RP-FI';
                $recepcion_actual->save();

                $pedido->load(['recepcionesAnteriores' => function($recepciones){
                    $recepciones->select('movimientos.*',DB::raw('COUNT(distinct movimientos_insumos.insumo_medico_id) as total_claves'),
                                            DB::raw('SUM(movimientos_insumos.cantidad) as total_insumos'))
                                ->leftjoin('movimientos_insumos','movimientos.id','=','movimientos_insumos.movimiento_id')
                                ->groupBy('rel_movimientos_pedidos.pedido_id');
                }]);
                $suma_recepciones = $pedido->recepcionesAnteriores;
                //
                if($pedido->avanceRecepcion){
                    //$porcentaje_claves  = round(((($pedido->avanceRecepcion->total_claves_recibidas + $parametros['avance']['total_claves'])/$pedido->total_claves)*100),2);
                    $porcentaje_insumos = round(((($pedido->avanceRecepcion->total_insumos_recibidos + $parametros['avance']['total_insumos'])/$pedido->total_insumos)*100),2);
                    $pedido->avanceRecepcion()->update([
                        'total_claves_recibidas'    =>'0',
                        'porcentaje_claves'         =>'0',
                        'total_insumos_recibidos'   =>$pedido->avanceRecepcion->total_insumos_recibidos + $parametros['avance']['total_insumos'],
                        'porcentaje_insumos'        =>$porcentaje_insumos,
                        'porcentaje_total'          =>'0',
                        'fecha_ultima_entrega'      =>$parametros['recepcion']['fecha_movimiento']
                    ]);
                }else{
                    //$porcentaje_claves = round((($parametros['avance']['total_claves'] / $pedido->total_claves) * 100),2);
                    $porcentaje_insumos = round((($parametros['avance']['total_insumos'] / $pedido->total_insumos) * 100),2);
                    $pedido->avanceRecepcion()->create([
                        'total_claves_recibidas'    =>'0',
                        'porcentaje_claves'         =>'0',
                        'total_insumos_recibidos'   =>$parametros['avance']['total_insumos'],
                        'porcentaje_insumos'        =>$porcentaje_insumos,
                        'porcentaje_total'          =>'0',
                        'fecha_primer_entrega'      =>$parametros['recepcion']['fecha_movimiento'],
                        'fecha_ultima_entrega'      =>$parametros['recepcion']['fecha_movimiento']
                    ]);
                }
            }
            
            DB::commit();

            //$pedido = Pedido::with(['listaInsumosMedicos','avanceRecepcion','recepcionActual.listaInsumosBorrador'])->find($id); 

            $pedido->load('avanceRecepcion','recepcionActual.listaInsumosBorrador');
            $return_data = [
                'data' => $pedido,
                'prueba' => $suma_recepciones
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
