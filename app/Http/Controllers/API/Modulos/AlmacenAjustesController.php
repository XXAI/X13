<?php

namespace App\Http\Controllers\API\Modulos;

use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;

use App\Http\Controllers\Controller;

use App\Http\Requests;

use DB;

use App\Models\BienServicio;
use App\Models\Familia;
use App\Models\PartidaEspecifica;
use App\Models\TipoBienServicio;
use App\Models\Empaque;
use App\Models\UnidadMedida;
use App\Models\UnidadMedica;
use App\Models\Almacen;
use App\Models\Stock;
use Response, Validator;

class AlmacenAjustesController extends Controller{

    public function articuloLotes(Request $request, $id){
        try{
            $loggedUser = auth()->userOrFail();
            $parametros = $request->all();

            $lotes = Stock::select('stocks.*','catalogo_unidades_medicas.nombre as unidad_medica','almacenes.nombre as almacen',
                                    DB::raw('COUNT(DISTINCT movimientos_articulos.id) as movimientos'))
                            ->leftJoin('catalogo_unidades_medicas','catalogo_unidades_medicas.id','=','stocks.unidad_medica_id')
                            ->leftJoin('almacenes','almacenes.id','=','stocks.almacen_id')
                            ->leftJoin('movimientos_articulos','movimientos_articulos.stock_id','=','stocks.id')
                            ->groupBy('stocks.id')
                            ->where(function($where){
                                $where->where('stocks.existencia','>',0)->orWhere('stocks.existencia_unidades','>',0);
                            })
                            ->where('stocks.bien_servicio_id',$id)->get();
            $unidades_medicas_ids = $lotes->pluck('unidad_medica_id');
            $almacenes_ids = $lotes->pluck('almacen_id');

            $return_data = [
                'unidades_medicas' => UnidadMedica::whereIn('id',$unidades_medicas_ids)->get(),
                'almacenes' => Almacen::whereIn('id',$almacenes_ids)->get(),
                'lotes' => $lotes,
            ];

            return response()->json(['data'=>$return_data],HttpResponse::HTTP_OK);
        }catch(\Exception $e){
            return response()->json(['error'=>['message'=>$e->getMessage(),'line'=>$e->getLine()]], HttpResponse::HTTP_CONFLICT);
        }
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function listaArticulos(Request $request){
        try{
            $loggedUser = auth()->userOrFail();
            $parametros = $request->all();

            /*if(!\Gate::denies('has-permission', 'vPZUt02ZCcGoNuxDlfOCETTjJAobvJvO')){
                $parametros['buscar_catalogo_completo'] = true;
            }*/

            if($loggedUser->is_superuser){
                $almacenes_ids = Almacen::where('unidad_medica_id',$loggedUser->unidad_medica_asignada_id)->get()->pluck('id');
            }else{
                $almacenes_ids = $loggedUser->almacenes()->pluck('almacen_id');
            }

            $lista_articulos = Stock::select(DB::raw("IF(COUNT(DISTINCT stocks.almacen_id) = 1,almacenes.nombre,CONCAT('En ',COUNT(DISTINCT stocks.almacen_id),' Almacen(es)')) as almacen"),
                                            DB::raw("CONCAT('En ',COUNT(DISTINCT stocks.programa_id),' Programa(s)') as programa"),"stocks.bien_servicio_id as id",'catalogo_tipos_bien_servicio.descripcion AS tipo_bien_servicio', 
                                            DB::raw("IF(bienes_servicios.clave_local is not null,bienes_servicios.clave_local,bienes_servicios.clave_cubs) as clave"),
                                            "bienes_servicios.articulo as articulo","bienes_servicios.especificaciones as especificaciones","bienes_servicios.puede_surtir_unidades",
                                            DB::raw("COUNT(DISTINCT stocks.id) as existencias"))
                                    ->leftJoin("bienes_servicios", "bienes_servicios.id","=","stocks.bien_servicio_id")
                                    ->leftJoin('catalogo_tipos_bien_servicio','catalogo_tipos_bien_servicio.id','bienes_servicios.tipo_bien_servicio_id')
                                    ->leftJoin("almacenes","almacenes.id","=","stocks.almacen_id")
                                    ->leftJoin("programas","programas.id","=","stocks.programa_id")
                                    ->leftJoin("familias","familias.id","=","bienes_servicios.familia_id")
                                    ->where('stocks.unidad_medica_id',$loggedUser->unidad_medica_asignada_id)
                                    ->whereIn('stocks.almacen_id',$almacenes_ids)
                                    ->groupBy('stocks.bien_servicio_id')
                                    ->groupBy('stocks.almacen_id');
            
            if(isset($params['incluir_existencias_cero']) && $params['incluir_existencias_cero']){
                $lista_articulos = $lista_articulos->where(function($where){
                    $where->where('stocks.existencia','>=',0);
                });
            }else{
                $lista_articulos = $lista_articulos->where(function($where){
                    $where->where('stocks.existencia','>',0)->orWhere('existencia_unidades','>',0);
                });
            }

            //Filtros, busquedas, ordenamiento
            if(isset($parametros['query']) && $parametros['query']){
                $lista_articulos = $lista_articulos->where(function($query)use($parametros){
                    return $query->where('stocks.lote','LIKE','%'.$parametros['query'].'%')
                                ->orWhere('catalogo_tipos_bien_servicio.descripcion','LIKE','%'.$parametros['query'].'%')
                                ->orWhere('bienes_servicios.clave_cubs','LIKE','%'.$parametros['query'].'%')
                                ->orWhere('bienes_servicios.clave_local','LIKE','%'.$parametros['query'].'%')
                                ->orWhere('bienes_servicios.articulo','LIKE','%'.$parametros['query'].'%')
                                ->orWhere('bienes_servicios.especificaciones','LIKE','%'.$parametros['query'].'%');
                });
            }

            if(isset($parametros['page'])){
                $resultadosPorPagina = isset($parametros["per_page"])? $parametros["per_page"] : 20;
                $lista_articulos = $lista_articulos->paginate($resultadosPorPagina);
            } else {
                $lista_articulos = $lista_articulos->get();
            }

            return response()->json(['data'=>$lista_articulos],HttpResponse::HTTP_OK);
        }catch(\Exception $e){
            return response()->json(['error'=>['message'=>$e->getMessage(),'line'=>$e->getLine()]], HttpResponse::HTTP_CONFLICT);
        }
    }
}
