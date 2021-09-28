<?php

namespace App\Http\Controllers\API\Modulos;

use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;

use App\Http\Controllers\Controller;

use App\Http\Requests;

use DB;

use App\Models\Pedido;
use App\Models\UnidadMedica;
use App\Models\TipoElementoPedido;
use App\Models\Programa;
use App\Models\BienServicio;


use Illuminate\Database\Eloquent\Builder;

class PedidoOrdinarioController extends Controller
{

    public function datosCatalogo(Request $request){
        try{
            $data = [];
            $parametros = $request->all();

            if(isset($parametros['grupo_pedidos']) && $parametros['grupo_pedidos']){
                $user_access_data = $this->getUserAccessData();
                $data['grupo_pedidos'] = $user_access_data->grupo_pedidos;
            }
            
            $data['catalogos'] = [];
            if(isset($parametros['tipos_pedido']) && $parametros['tipos_pedido']){
                $data['catalogos']['tipos_pedido'] = TipoElementoPedido::where('activo',1)->get();
            }

            if(isset($parametros['programas']) && $parametros['programas']){
                $data['catalogos']['programas'] = Programa::all();
            }

            return response()->json(['data'=>$data],HttpResponse::HTTP_OK);
        }catch(\Exception $e){
            return response()->json(['error'=>['message'=>$e->getMessage(),'line'=>$e->getLine()]], HttpResponse::HTTP_CONFLICT);
        }
    }

    public function busquedaElementos(Request $request)
    {
        try{
            $parametros = $request->all();
            $elementos = [];
            $tipo_elemento;

            if(isset($parametros['tipo_elemento']) && $parametros['tipo_elemento']){
                $tipo_elemento = TipoElementoPedido::where('clave',$parametros['tipo_elemento'])->first();
                $filtro = json_decode($tipo_elemento->filtro_detalles, true);

                $elementos = BienServicio::with('partidaEspecifica')
                                        ->leftJoin('familias','familias.id','=','bienes_servicios.familia_id')
                                        ->select('bienes_servicios.*','familias.nombre as nombre_familia');

                foreach ($filtro as $item) {
                    $elementos = $elementos->orWhere(function($query)use($item){
                        $query->where('clave_partida_especifica',$item['clave'])
                                ->whereIn('familia_id',$item['familia_id']);
                    });
                }

                if($tipo_elemento->origen_articulo == 1){
                    $elementos = $elementos->whereNotNull('clave_cubs');
                }else if($tipo_elemento->origen_articulo == 2){
                    $elementos = $elementos->whereNotNull('clave_local');
                }
            }
            
            //Filtros, busquedas, ordenamiento
            if(isset($parametros['query']) && $parametros['query']){
                $elementos = $elementos->where(function($query)use($parametros){
                    return $query->where('clave_cubs','LIKE','%'.$parametros['query'].'%')
                                ->orWhere('clave_local','LIKE','%'.$parametros['query'].'%')
                                ->orWhere('articulo','LIKE','%'.$parametros['query'].'%')
                                ->orWhere('especificaciones','LIKE','%'.$parametros['query'].'%')
                                ->orWhere('familias.nombre','LIKE','%'.$parametros['query'].'%');
                });
            }

            if(isset($parametros['page'])){
                $resultadosPorPagina = isset($parametros["per_page"])? $parametros["per_page"] : 20;
                $elementos = $elementos->paginate($resultadosPorPagina);
            } else {
                $elementos = $elementos->get();
            }

            return response()->json(['data'=>$elementos],HttpResponse::HTTP_OK);
        }catch(\Exception $e){
            return response()->json(['error'=>['message'=>$e->getMessage(),'line'=>$e->getLine()]], HttpResponse::HTTP_CONFLICT);
        }
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        try{
            $parametros = $request->all();
            $access_data = $this->getUserAccessData();

            $pedidos = Pedido::getModel();

            if(!$access_data->is_superuser){
                $pedidos = $pedidos->whereIn('unidad_medica_id',$access_data->lista_unidades_ids);
            }
            
            //Filtros, busquedas, ordenamiento
            if(isset($parametros['query']) && $parametros['query']){
                $pedidos = $pedidos->where(function($query)use($parametros){
                    return $query->where('folio','LIKE','%'.$parametros['query'].'%')
                                ->orWhere('descripcion','LIKE','%'.$parametros['query'].'%')
                                ->orWhere('observaciones','LIKE','%'.$parametros['query'].'%');
                });
            }

            //para ordenar
            $pedidos = $pedidos->orderBy('updated_at','desc');

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
    public function show(Request $request, $id)
    {
        try{
            $parametros = $request->all();
            if(isset($parametros['reporte_pdf']) && $parametros['reporte_pdf']){
                $pedido = Pedido::with(['tipoElementoPedido','unidadMedica','listaArticulos.articulo','programa'])->find($id);
                $return_data = ['data'=>$pedido];
            }else{
                $pedido = Pedido::with(['tipoElementoPedido','programa',
                                    'listaArticulos'=>function($articulos){ //Agrega la Familia
                                        $articulos->with(['articulo'=>function($articulo){
                                            $articulo->leftJoin('familias','familias.id','=','bienes_servicios.familia_id')
                                                    ->select('bienes_servicios.*','familias.nombre as nombre_familia');
                                        },'articulo.partidaEspecifica','listaArticulosUnidades']);
                                    },'listaUnidadesMedicas.unidadMedica'])->find($id);
                $return_data = ['data'=>$pedido];
            }
            
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
            $parametros = $request->all();

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

            $listado_articulos = [];
            $total_articulos = 0;
            $total_claves = 0;
            foreach ($parametros['articulos_pedido'] as $articulo) {
                $listado_articulos[] = [
                    'bien_servicio_id'=>$articulo['id'],
                    'cantidad_original'=>$articulo['cantidad'],
                    'cantidad'=>$articulo['cantidad']
                ];
                $total_articulos += $articulo['cantidad'];
                $total_claves++;
            }
            $pedido->listaArticulos()->createMany($listado_articulos);

            if(isset($parametros['unidades_pedido']) && count($parametros['unidades_pedido'])){
                $articulos_pedido = $pedido->listaArticulos()->pluck('id','bien_servicio_id');
                $listado_articulos_unidades = [];
                foreach ($parametros['articulos_pedido'] as $articulo) {
                    if(isset($articulo['cuadro_distribucion']) && count($articulo['cuadro_distribucion'])){
                        foreach ($articulo['cuadro_distribucion'] as $unidad) {
                            $listado_articulos_unidades[] = ['unidad_medica_id'=>$unidad['id'], 'cantidad_original'=>$unidad['cantidad'], 'cantidad'=>$unidad['cantidad'], 'pedido_articulo_id'=>$articulos_pedido[$articulo['id']]];
                        }
                    }
                }
                $pedido->listaArticulosUnidades()->createMany($listado_articulos_unidades);
            }

            $pedido->total_claves = $total_claves;
            $pedido->total_articulos = $total_articulos;
            $pedido->save();

            DB::commit();

            $pedido->load('listaArticulos');

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

            $parametros = $request->all();

            $pedido = Pedido::with([
                    'listaArticulos'=>function($articulos){ $articulos->withTrashed(); },
                    'listaUnidadesMedicas'=>function($unidades){ $unidades->withTrashed(); },
                ])->find($id); 

            $datos_pedido = $parametros['pedido'];
            $datos_pedido['estatus'] = ($parametros['concluir'])?'CON':'BOR';
            $datos_pedido['tipo_pedido'] = 'ORD';
            //$diferencia_claves = 0;
            $total_articulos = 0;
            $total_claves = 0;

            $listado_articulos = $parametros['articulos_pedido'];
            $articulos_editados = [];
            $articulos_eliminados = [];
            $articulos_agregados = [];
            $articulos_pedido = [];

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

            $pedido_articulos_unidades = [];
            $articulos_pedido_raw = $pedido->listaArticulos;
            foreach ($articulos_pedido_raw as $articulo) {
                $articulos_pedido[$articulo->id] = $articulo;
            }

            foreach ($listado_articulos as $articulo) {
                if(!isset($articulo['pedido_articulo_id'])){
                    $articulos_agregados[] = ['bien_servicio_id' => $articulo['id'], 'cantidad_original' => $articulo['cantidad'], 'cantidad' => $articulo['cantidad'], 'monto' => $articulo['monto'] ];
                    $total_articulos += $articulo['cantidad'];
                    $total_claves++;
                }elseif(isset($articulos_pedido[$articulo['pedido_articulo_id']])){
                    $articulo_pedido = $articulos_pedido[$articulo['pedido_articulo_id']];
                    if($articulo_pedido->bien_servicio_id !=  $articulo['id'] || $articulo_pedido->cantidad !=  $articulo['cantidad'] || $articulo_pedido->monto !=  $articulo['monto'] ){
                        $articulo_pedido->bien_servicio_id = $articulo['id'];
                        $articulo_pedido->cantidad_original =  $articulo['cantidad'];
                        $articulo_pedido->cantidad =  $articulo['cantidad'];
                        $articulo_pedido->monto =  $articulo['monto'];
                        //
                        $articulos_editados[] = $articulo_pedido;
                    }
                    $total_articulos += $articulo['cantidad'];
                    $total_claves++;
                    $articulos_pedido[$articulo['pedido_articulo_id']] = NULL;
                }
                
                if(isset($articulo['cuadro_distribucion']) && count($articulo['cuadro_distribucion']) > 0){
                    foreach ($articulo['cuadro_distribucion'] as $unidad) {
                        $pedido_articulos_unidades[] = ['bien_servicio_id'=>$articulo['id'], 'cantidad'=>$unidad['cantidad'], 'unidad_medica_id'=>$unidad['id']];
                    }
                }
            }

            foreach ($articulos_pedido as $pedido_articulo_id => $pedido_articulo) {
                if($pedido_articulo){
                    if(count($articulos_agregados) > 0){
                        $pedido_articulo->bien_servicio_id = $articulos_agregados[0]['bien_servicio_id'];
                        $pedido_articulo->cantidad_original =  $articulos_agregados[0]['cantidad'];
                        $pedido_articulo->cantidad =  $articulos_agregados[0]['cantidad'];
                        $pedido_articulo->monto =  $articulos_agregados[0]['monto'];
                        $pedido_articulo->deleted_at = null;
                        $articulos_editados[] = $pedido_articulo;
                        array_splice($articulos_agregados,0,1);
                    }else{
                        $articulos_eliminados[] = $pedido_articulo_id;
                    }
                }
            }

            //$diferencia_claves = (count($articulos_agregados) - count($articulos_eliminados));
            //$datos_pedido['total_claves'] = $pedido->total_claves + $diferencia_claves;
            $datos_pedido['total_claves'] = $total_claves;
            $datos_pedido['total_articulos'] = $total_articulos;

            if(count($articulos_agregados)){
                $pedido->listaArticulos()->createMany($articulos_agregados);
            }
            if(count($articulos_editados)){
                $pedido->listaArticulos()->saveMany($articulos_editados);
            }
            if(count($articulos_eliminados)){
                $pedido->listaArticulos()->whereIn('id',$articulos_eliminados)->delete();
                $pedido->listaArticulosUnidades()->whereIn('pedido_articulo_id',$articulos_eliminados)->delete();
            }

            $pedido->update($datos_pedido);

            if(count($pedido_articulos_unidades) > 0){
                $pedido->load(['listaArticulos'=>function($articulos){
                    $articulos->with(['listaArticulosUnidades'=>function($unidades){
                        $unidades->withTrashed();
                    }])->withTrashed();
                }])->withTrashed();

                $pedido_articulos_unidades_guardar = [];
                $pedido_articulos_unidades_editados = [];
                $pedido_articulos_unidades_eliminados = [];

                $articulos_unidades_raw = $pedido->listaArticulos;
                $articulos_unidades = [];

                foreach ($articulos_unidades_raw as $articulo_unidad) {
                    $articulos_unidades[$articulo_unidad->bien_servicio_id] = [
                        'pedido_articulo_id' => $articulo_unidad->id,
                        'lista_unidades' => []
                    ];
                    foreach ($articulo_unidad->listaArticulosUnidades as $unidad) {
                        $articulos_unidades[$articulo_unidad->bien_servicio_id]['lista_unidades'][$unidad->unidad_medica_id] = $unidad;
                    }
                }

                foreach ($pedido_articulos_unidades as $articulo_unidad) {
                    $pedido_articulo = $articulos_unidades[$articulo_unidad['articulo_id']];
                    if(isset($pedido_articulo['lista_unidades'][$articulo_unidad['unidad_medica_id']])){
                        $pedido_articulo_unidad = $pedido_articulo['lista_unidades'][$articulo_unidad['unidad_medica_id']];
                        if($pedido_articulo_unidad->cantidad != $articulo_unidad['cantidad']){
                            $pedido_articulo_unidad->cantidad_original = $articulo_unidad['cantidad'];
                            $pedido_articulo_unidad->cantidad = $articulo_unidad['cantidad'];
                            $pedido_articulo_unidad->deleted_at = NULL;
                            $pedido_articulos_unidades_editados[] = $pedido_articulo_unidad;
                        }
                        $articulos_unidades[$articulo_unidad['bien_servicio_id']]['lista_unidades'][$articulo_unidad['unidad_medica_id']] = NULL;
                    }else{
                        $pedido_articulo_unidad = [
                            'pedido_articulo_id' => $pedido_articulo['pedido_articulo_id'],
                            'unidad_medica_id' => $articulo_unidad['unidad_medica_id'],
                            'cantidad_original' => $articulo_unidad['cantidad'],
                            'cantidad' => $articulo_unidad['cantidad']
                        ];
                        $pedido_articulos_unidades_guardar[] = $pedido_articulo_unidad;
                    }
                }

                foreach ($articulos_unidades as $articulo_pedido) {
                    foreach ($articulo_pedido['lista_unidades'] as $articulo_unidad) {
                        if($articulo_unidad){
                            if(count($pedido_articulos_unidades_guardar) > 0){
                                $articulo_unidad->pedido_articulo_id = $pedido_articulos_unidades_guardar[0]['pedido_articulo_id'];
                                $articulo_unidad->unidad_medica_id = $pedido_articulos_unidades_guardar[0]['unidad_medica_id'];
                                $articulo_unidad->cantidad_original = $pedido_articulos_unidades_guardar[0]['cantidad'];
                                $articulo_unidad->cantidad = $pedido_articulos_unidades_guardar[0]['cantidad'];
                                $articulo_unidad->deleted_at = NULL;
                                $pedido_articulos_unidades_editados[] = $articulo_unidad;
                                array_splice($pedido_articulos_unidades_guardar,0,1);
                            }else{
                                $pedido_articulos_unidades_eliminados[] = $articulo_unidad->id;
                            }
                        }
                    }
                }

                if(count($pedido_articulos_unidades_guardar)){
                    $pedido->listaArticulosUnidades()->createMany($pedido_articulos_unidades_guardar);
                }
                if(count($pedido_articulos_unidades_editados)){
                    $pedido->listaArticulosUnidades()->saveMany($pedido_articulos_unidades_editados);
                }
                if(count($pedido_articulos_unidades_eliminados)){
                    $pedido->listaArticulosUnidades()->whereIn('id',$pedido_articulos_unidades_eliminados)->delete();
                }
            }

            if(isset($parametros['generar_folio']) && $parametros['generar_folio']){
                if(!$pedido->folio){
                    $max_consecutivo = Pedido::where('anio',$pedido->anio)
                                            ->where('tipo_pedido',$pedido->tipo_pedido)
                                            ->where('unidad_medica_id',$pedido->unidad_medica_id)
                                            ->where('tipo_elemento_pedido_id',$pedido->tipo_elemento_pedido_id)
                                            ->max('folio_consecutivo');

                    if(!$max_consecutivo){
                        $max_consecutivo = 1;
                    }else{
                        $max_consecutivo++;
                    }

                    $unidad_medica = UnidadMedica::find($pedido->unidad_medica_id);
                    $tipo_elemento = TipoElementoPedido::find($pedido->tipo_elemento_pedido_id);

                    $pedido->folio_consecutivo = $max_consecutivo;
                    $pedido->folio = $unidad_medica->clues . '-' . $tipo_elemento->clave . '-' . $pedido->tipo_pedido . '-' . $pedido->anio . '-' . (str_pad($max_consecutivo, 3, "0", STR_PAD_LEFT));
                }
                $pedido->estatus = 'PUB';
                $pedido->save();
            }

            DB::commit();

            $pedido->load('listaArticulos.listaArticulosUnidades');
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
        
        $lista_unidades_id = [];
        foreach ($loggedUser->grupos as $grupo) {
            $lista_unidades = $grupo->unidadesMedicas->pluck('id')->all();
            
            $lista_unidades_id = array_merge($lista_unidades_id,$lista_unidades);
        }
        //$accessData->lista_clues = $lista_clues;

        $accessData = (object)[];
        $accessData->grupo_pedidos = (count($loggedUser->grupos))?$loggedUser->grupos[0]:[];
        $accessData->lista_unidades_ids = $lista_unidades_id;
        $accessData->is_superuser = $loggedUser->is_superuser;

        /*if (\Gate::allows('has-permission', \Permissions::ADMIN_PERSONAL_ACTIVO)){
            $accessData->is_admin = true;
        }else{
            $accessData->is_admin = false;
        }*/

        return $accessData;
    }
}
