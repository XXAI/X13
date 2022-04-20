<?php

namespace App\Http\Controllers\API\Modulos;

use App\Http\Controllers\Controller;

use Illuminate\Support\Facades\Http;

use Illuminate\Http\Response as HttpResponse;
use Illuminate\Http\Request;
use Response;
use Validator;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;

use App\Exports\DevReportExport;

use App\EDocs\EDoc;

use App\Models\Stock;
use App\Models\Movimiento;
use App\Models\MovimientoArticulo;
use App\Models\Programa;
use App\Models\UnidadMedica;
use App\Models\UnidadMedicaCatalogoArticulo;
use App\Models\Solicitud;
use App\Models\Almacen;

class VisorAbastoSurtimientoController extends Controller
{
    /**
     * Create a new DocumentosController instance.
     *
     * @return void
     */

     /*
    public function __construct() {
        $this->middleware('auth:api');
    }*/

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function obtenerDatosVisor(Request $request){
        try{
            $loggedUser = auth()->userOrFail();
            $params = $request->input();
            $datos_return = [];
            $unidad_medica_id;

            if(isset($params['unidad_medica_id']) && $params['unidad_medica_id']){
                $unidad_medica_id = $params['unidad_medica_id'];
            }else{
                $unidad_medica_id = $loggedUser->unidad_medica_asignada_id;
            }

            $unidad_medica = UnidadMedica::with('distrito')->where('id',$unidad_medica_id)->first();
            $datos_return['unidad_medica'] = $unidad_medica;
            
            /* Total de existencias por Catalogo Normativo  */
            $porcentaje_abasto = UnidadMedicaCatalogoArticulo::select('catalogo_tipos_bien_servicio.descripcion as tipo',DB::raw('COUNT(DISTINCT bienes_servicios.id) as total_claves'), DB::raw('COUNT(DISTINCT stocks.bien_servicio_id) as total_claves_existencia'))
                                                                ->leftJoin('bienes_servicios','bienes_servicios.id','=','unidad_medica_catalogo_articulos.bien_servicio_id')
                                                                ->leftJoin('catalogo_tipos_bien_servicio','catalogo_tipos_bien_servicio.id','=','bienes_servicios.tipo_bien_servicio_id')
                                                                ->leftJoin('stocks',function($joinStocks){
                                                                    $joinStocks->on('stocks.bien_servicio_id','=','unidad_medica_catalogo_articulos.bien_servicio_id')
                                                                                ->on('stocks.unidad_medica_id','=','unidad_medica_catalogo_articulos.unidad_medica_id')
                                                                                ->where(function($where){
                                                                                    $where->where('stocks.existencia','>',0)->orWhere('stocks.existencia_unidades','>',0);
                                                                                })->whereNull('stocks.deleted_at');
                                                                })
                                                                ->where('unidad_medica_catalogo_articulos.unidad_medica_id',$unidad_medica_id)
                                                                ->where('unidad_medica_catalogo_articulos.es_normativo',1)
                                                                ->groupBy('bienes_servicios.tipo_bien_servicio_id')
                                                                ->orderBy('catalogo_tipos_bien_servicio.descripcion','DESC')
                                                                ->get();
            $datos_return['porcentaje_abasto'] = $porcentaje_abasto;

            /* Total de solicitudes surtidas(Recetas y Colectivos)  */
            $porcetaje_surtimiento = Solicitud::select('catalogo_tipos_solicitud.descripcion as solicitud','catalogo_solicitudes_tipos_uso.descripcion as tipo',DB::raw('COUNT(DISTINCT solicitudes.id) as total_solicitudes'),DB::raw('SUM(IF(solicitudes.porcentaje_articulos_surtidos = 100,1,0)) as total_completos'))
                                                ->leftJoin('catalogo_tipos_solicitud','catalogo_tipos_solicitud.id','=','solicitudes.tipo_solicitud_id')
                                                ->leftJoin('catalogo_solicitudes_tipos_uso','catalogo_solicitudes_tipos_uso.id','=','solicitudes.tipo_uso_id')
                                                ->where('solicitudes.unidad_medica_id',$unidad_medica_id)
                                                ->where('solicitudes.estatus','FIN')
                                                ->orderBy('catalogo_tipos_solicitud.descripcion')
                                                ->groupBy('solicitudes.tipo_solicitud_id')
                                                ->groupBy('solicitudes.tipo_uso_id')
                                                ->get();
            $datos_return['porcetaje_surtimiento'] = $porcetaje_surtimiento;

            /* Movimientos por almacen  */
            $movimientos = Movimiento::select('almacenes.nombre AS almacen', 'movimientos.direccion_movimiento', DB::raw('COUNT(DISTINCT movimientos.id) as total_movimientos'), DB::raw('SUM(IF(movimientos.estatus = "FIN",1,0)) as total_concluidos'), DB::raw('SUM(IF(movimientos.estatus = "BOR",1,0)) as total_borrador'), 
                                                DB::raw('SUM(IF(movimientos.estatus = "CAN",1,0)) as total_cancelados'), DB::raw('SUM(IF(movimientos.estatus = "PERE",1,0)) as total_pendiente_recepcion') )
                                        ->leftJoin('almacenes','almacenes.id','=','movimientos.almacen_id')
                                        ->where('movimientos.unidad_medica_id',$unidad_medica_id)
                                        ->groupBy('movimientos.almacen_id')
                                        ->groupBy('movimientos.direccion_movimiento')
                                        ->orderBy('movimientos.almacen_id')
                                        ->orderBy('movimientos.direccion_movimiento')
                                        ->get();
            $datos_return['movimientos'] = $movimientos;

            /* Lista de existencias para articulos normativos  */
            $catalogo_normativo = UnidadMedicaCatalogoArticulo::select('catalogo_tipos_bien_servicio.descripcion AS tipo','bienes_servicios.clave_local AS clave','bienes_servicios.articulo','bienes_servicios.especificaciones AS descripcion','unidad_medica_catalogo_articulos.es_normativo',
                                                                        DB::raw('SUM(stocks.existencia) AS existencia'), DB::raw('SUM(stocks.existencia_unidades) AS existencia_unidades')) #'unidad_medica_catalogo_articulos.id is not null as en_catalogo',
                                                                ->leftJoin('bienes_servicios','bienes_servicios.id','=','unidad_medica_catalogo_articulos.bien_servicio_id')
                                                                ->leftJoin('catalogo_tipos_bien_servicio','catalogo_tipos_bien_servicio.id','=','bienes_servicios.tipo_bien_servicio_id')
                                                                ->leftJoin('stocks',function($joinStocks){
                                                                    $joinStocks->on('stocks.bien_servicio_id','=','unidad_medica_catalogo_articulos.bien_servicio_id')
                                                                                ->on('stocks.unidad_medica_id','=','unidad_medica_catalogo_articulos.unidad_medica_id')
                                                                                ->where(function($where){
                                                                                    $where->where('stocks.existencia','>',0)->orWhere('stocks.existencia_unidades','>',0);
                                                                                })->whereNull('stocks.deleted_at');
                                                                })
                                                                ->where('unidad_medica_catalogo_articulos.unidad_medica_id',$unidad_medica_id)
                                                                ->where('unidad_medica_catalogo_articulos.es_normativo',1)
                                                                ->groupBy('unidad_medica_catalogo_articulos.bien_servicio_id')
                                                                ->orderBy('catalogo_tipos_bien_servicio.descripcion','DESC')
                                                                ->orderBy('bienes_servicios.especificaciones')
                                                                ->get();
            $datos_return['catalogo_normativo'] = $catalogo_normativo;

            return response()->json(['data'=>$datos_return],HttpResponse::HTTP_OK);
        }catch(\Exception $e){
            return response()->json(['error'=>['message'=>$e->getMessage(),'line'=>$e->getLine()]], HttpResponse::HTTP_CONFLICT);
        }
    }

    public function exportExcel(Request $request){
        ini_set('memory_limit', '-1');

        try{
            $loggedUser = auth()->userOrFail();
            $params = $request->all();

            if(isset($params['almacenes_ids']) && trim($params['almacenes_ids']) != ''){
                $almacenes = explode('|',$params['almacenes_ids']);
            }else{
                if($loggedUser->is_superuser){
                    $almacenes = Almacen::where('unidad_medica_id',$loggedUser->unidad_medica_asignada_id)->get()->pluck('id');
                }else{
                    $almacenes = $loggedUser->almacenes()->pluck('almacen_id');
                }
            }
            $unidad_medica_id = $loggedUser->unidad_medica_asignada_id;
            
            $stocks = Stock::select('almacenes.nombre as ALMACEN','programas.descripcion as PROGRAMA','catalogo_tipos_bien_servicio.descripcion as TIPO_ARTICULO',
                                'bienes_servicios.clave_local as CLAVE','bienes_servicios.especificaciones as DESCRIPCION','bienes_servicios.descontinuado as DESCONTINUADO',
                                'stocks.lote as LOTE','stocks.fecha_caducidad as FECHA_CADUCIDAD','stocks.existencia as EXISTENCIA',
                                'unidad_medica_catalogo_articulos.es_normativo as NORMATIVO')
                            ->leftJoin('bienes_servicios','bienes_servicios.id','=','stocks.bien_servicio_id')
                            ->leftJoin('catalogo_tipos_bien_servicio','catalogo_tipos_bien_servicio.id','=','bienes_servicios.tipo_bien_servicio_id')
                            ->leftjoin('almacenes','almacenes.id','=','stocks.almacen_id')
                            ->leftJoin('programas','programas.id','=','stocks.programa_id')
                            ->leftJoin('unidad_medica_catalogo_articulos',function($join)use($unidad_medica_id){
                                $join->on('unidad_medica_catalogo_articulos.bien_servicio_id','=','stocks.bien_servicio_id')
                                    ->where('unidad_medica_catalogo_articulos.unidad_medica_id',$unidad_medica_id)
                                    ->whereNull('unidad_medica_catalogo_articulos.deleted_at');
                            })
                            ->whereIn('stocks.almacen_id',$almacenes)
                            ->orderBy('almacenes.nombre','ASC')
                            ->orderBy('programas.descripcion','ASC')
                            ->orderBy('bienes_servicios.articulo','ASC')
                            ->orderBy('bienes_servicios.clave_local','ASC')
                            ->orderBy('stocks.fecha_caducidad','ASC');
            //
            if(isset($params['agrupar_por']) && trim($params['agrupar_por']) != ''){
                if($params['agrupar_por'] == 'articulo'){
                    $stocks = $stocks->select('catalogo_tipos_bien_servicio.descripcion as TIPO_ARTICULO','bienes_servicios.clave_local as CLAVE',
                                            'bienes_servicios.especificaciones as DESCRIPCION','bienes_servicios.descontinuado as DESCONTINUADO',
                                            DB::raw('count(stocks.lote) as NO_LOTES'),DB::raw('SUM(stocks.existencia) as EXISTENCIAS'),
                                            'unidad_medica_catalogo_articulos.es_normativo as NORMATIVO')
                                    ->groupBy('stocks.bien_servicio_id');
                }
            }
            $resultado = $stocks->get();
            $columnas = array_keys(collect($resultado[0])->toArray());

            $filename = 'Existencias Por Almacen';

            return (new DevReportExport($resultado,$columnas))->download($filename.'.xlsx'); //Excel::XLSX, ['Access-Control-Allow-Origin'=>'*','Access-Control-Allow-Methods'=>'GET']
        }catch(\Exception $e){
            return response()->json(['error' => $e->getMessage(),'line'=>$e->getLine()], HttpResponse::HTTP_CONFLICT);
        }
    }

}
