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

class EstatusAvanceRecepcionPedidoController extends Controller{

    public function datosCatalogo(Request $request){
        try{
            $data = [];
            $parametros = $request->all();

            if(isset($parametros['pedido_id']) && $parametros['pedido_id']){
                $pedido = Pedido::with('unidadMedica.almacenes')->find($parametros['pedido_id']);
                if($pedido){
                    $data['almacenes'] = $pedido->unidadMedica->almacenes;
                }
            }

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
    public function index(Request $request){
        try{
            $parametros = $request->all();
            $access_data = $this->getUserAccessData();

            $pedidos = Pedido::where('estatus','PUB');

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
    public function show($id){
        try{
            $pedido = Pedido::with(['tipoElementoPedido','unidadMedica','programa','avanceRecepcion',
                                    'listaArticulos'=>function($articulos){
                                        $articulos->with(['articulo'=>function($articulo){
                                                                        $articulo->leftJoin('familias','familias.id','=','bienes_servicios.familia_id')
                                                                                ->select('bienes_servicios.*','familias.nombre as nombre_familia');
                                                                    },'articulo.partidaEspecifica'])
                                                ->select('pedidos_lista_articulos.*',DB::raw('sum(movimientos_insumos.cantidad) as cantidad_recibida'))
                                                ->leftjoin('rel_movimientos_pedidos','rel_movimientos_pedidos.pedido_id','=','pedidos_lista_articulos.pedido_id')
                                                ->leftjoin('movimientos_insumos',function($join){
                                                    $join->on('movimientos_insumos.movimiento_id','=','rel_movimientos_pedidos.movimiento_id')
                                                            ->whereNull('movimientos_insumos.deleted_at')
                                                            ->on('movimientos_insumos.bienes_servicios_id','=','pedidos_lista_articulos.bien_servicio_id');
                                                })
                                                ->groupBy('pedidos_lista_articulos.bien_servicio_id')
                                                ->orderBy('pedidos_lista_articulos.id');
                                    },'listaUnidadesMedicas.unidadMedica'])->find($id);

            $return_data = ['data'=>$pedido];

            return response()->json($return_data,HttpResponse::HTTP_OK);
        }catch(\Exception $e){
            return response()->json(['error'=>['message'=>$e->getMessage(),'line'=>$e->getLine()]], HttpResponse::HTTP_CONFLICT);
        }
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
        $accessData->grupo_pedidos = $loggedUser->grupos[0];
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
