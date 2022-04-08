<?php

namespace App\Http\Controllers\API\Modulos;

use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;

use App\Http\Controllers\Controller;

use App\Http\Requests;

use DB;
use Hash;

use App\Models\Almacen;
use App\Models\Programa;
use App\Models\Proveedor;
use App\Models\TipoMovimiento;
use App\Models\UnidadMedica;
use App\Models\Stock;
use App\Models\Marca;
use App\Models\AreaServicio;
use App\Models\BienServicio;
use App\Models\UnidadMedicaTurno;
use App\Models\PersonalMedico;
use App\Models\Paciente;
use App\Models\TipoSolicitud;
use App\Models\SolicitudTipoUso;
use App\Models\Solicitud;
use App\Models\MovimientoModificacion;
use App\Models\Movimiento;
use App\Models\User;

class AlmacenMovimientosController extends Controller{
    
    public function obtenerCatalogos(Request $request){
        try{
            $loggedUser = auth()->userOrFail();
            $parametros = $request->all();

            if($loggedUser->is_superuser){
                $almacenes = Almacen::where('unidad_medica_id',$loggedUser->unidad_medica_asignada_id)->get()->pluck('id');
            }else{
                $almacenes = $loggedUser->almacenes()->pluck('almacen_id');
            }

            $config_catalogs = [
                'programas'         => Programa::getModel(),
                'almacenes'         => Almacen::where('unidad_medica_id',$loggedUser->unidad_medica_asignada_id)->whereIn('id',$almacenes),                                                                                                                               
                'almacenes_todos'   => Almacen::where('unidad_medica_id',$loggedUser->unidad_medica_asignada_id),
                'unidades_medicas'  => UnidadMedica::getModel(),
                'proveedores'       => Proveedor::getModel(),
                'tipos_movimiento'  => TipoMovimiento::getModel(),
                'recetas_tipos_uso' => SolicitudTipoUso::where('clave','RCTA'),
                'marcas'            => Marca::getModel(),
                'areas_servicios'   => AreaServicio::getModel(),
                'turnos'            => UnidadMedicaTurno::where('unidad_medica_id',$loggedUser->unidad_medica_asignada_id),
                'personal_medico'   => PersonalMedico::where('unidad_medica_id',$loggedUser->unidad_medica_asignada_id),
            ];

            if(isset($parametros['filtro_almacenes_movimiento']) && $parametros['filtro_almacenes_movimiento']){
                $config_catalogs['almacenes']->with(['tiposMovimiento' => function($tiposMovimiento)use($parametros){
                    $tiposMovimiento->where('movimiento',$parametros['filtro_almacenes_movimiento']);
                }]);
            }

            $catalogos = [];
            foreach ($parametros as $key => $value) {
                if(isset($config_catalogs[$key])){
                    $temp_cat = $config_catalogs[$key];

                    if($value == '*'){
                        $catalogos[$key] = $temp_cat->get();
                    }else{
                        $filters = explode('|',$value); 
                        foreach ($filters as $index => $filter) {
                            $condition = explode('.',$filter);
                            $temp_cat = $temp_cat->where($condition[0],$condition[1]);
                        }
                        $catalogos[$key] =  $temp_cat->get();
                    }
                }
            }

            if(isset($parametros['estatus_movimientos']) && $parametros['estatus_movimientos'] == '*'){
                $catalogos['estatus_movimientos'] = [
                    ['clave'=>'BOR','descripcion'=>'Borrador'],
                    ['clave'=>'FIN','descripcion'=>'Concluido'],
                    ['clave'=>'CAN','descripcion'=>'Cancelado'],
                    ['clave'=>'PERE','descripcion'=>'Pendiente de Recepción'],
                    ['clave'=>'SOL','descripcion'=>'Petición de Modificación'],
                    ['clave'=>'MOD','descripcion'=>'Modificación Activa'],
                ];
            }

            return response()->json(['data'=>$catalogos],HttpResponse::HTTP_OK);
        }catch(\Exception $e){
            return response()->json(['error'=>['message'=>$e->getMessage(),'line'=>$e->getLine()]], HttpResponse::HTTP_CONFLICT);
        }
    }

    public function buscarStock(Request $request){
        try{
            $loggedUser = auth()->userOrFail();
            $parametros = $request->all();

            if(!\Gate::denies('has-permission', 'vPZUt02ZCcGoNuxDlfOCETTjJAobvJvO')){
                $parametros['buscar_catalogo_completo'] = true;
            }

            $unidad_medica_id = $loggedUser->unidad_medica_asignada_id;

            $stock_existencias = BienServicio::select('stocks.*','bienes_servicios.id AS articulo_id','bienes_servicios.clave_partida_especifica','bienes_servicios.familia_id','bienes_servicios.clave_cubs',
                                                    'bienes_servicios.clave_local','bienes_servicios.articulo','bienes_servicios.especificaciones','bienes_servicios.descontinuado','bienes_servicios.puede_surtir_unidades',
                                                    'bienes_servicios.tiene_fecha_caducidad','cog_partidas_especificas.descripcion AS partida_especifica','familias.nombre AS familia',
                                                    'programas.descripcion AS programa','almacenes.nombre AS almacen','unidad_medica_catalogo_articulos.es_normativo','catalogo_marcas.nombre AS marca',
                                                    'unidad_medica_catalogo_articulos.cantidad_minima','unidad_medica_catalogo_articulos.cantidad_maxima','unidad_medica_catalogo_articulos.id AS en_catalogo_unidad',
                                                    'bienes_servicios.tipo_bien_servicio_id','catalogo_tipos_bien_servicio.descripcion AS tipo_bien_servicio','catalogo_tipos_bien_servicio.clave_form')
                                                //Relaciones de filtrado
                                                ->leftjoin('stocks',function($join)use($unidad_medica_id,$parametros){
                                                    $join = $join->on('stocks.bien_servicio_id','=','bienes_servicios.id')
                                                                ->where('stocks.unidad_medica_id',$unidad_medica_id)
                                                                ->where(function($where){
                                                                    $where->where('stocks.existencia','>',0)->orWhere('stocks.existencia_unidades','>',0);
                                                                })
                                                                ->where('stocks.almacen_id',$parametros['almacen_id'])
                                                                ->whereNull('stocks.deleted_at');
                                                    if(isset($parametros['programa_id']) && $parametros['programa_id']){
                                                        $join = $join->where('stocks.programa_id',$parametros['programa_id']);
                                                    }
                                                    return $join;
                                                })
                                                ->leftJoin('unidad_medica_catalogo_articulos',function($join)use($unidad_medica_id){
                                                    return $join->on('unidad_medica_catalogo_articulos.bien_servicio_id','=','bienes_servicios.id')
                                                        ->where('unidad_medica_catalogo_articulos.unidad_medica_id',$unidad_medica_id)
                                                        ->whereNull('unidad_medica_catalogo_articulos.deleted_at');
                                                })
                                                //Catalogos informativos
                                                ->leftjoin('catalogo_tipos_bien_servicio','catalogo_tipos_bien_servicio.id','=','bienes_servicios.tipo_bien_servicio_id')
                                                ->leftjoin('cog_partidas_especificas','cog_partidas_especificas.clave','=','bienes_servicios.clave_partida_especifica')
                                                ->leftjoin('familias','familias.id','=','bienes_servicios.familia_id')
                                                ->leftjoin('programas','programas.id','=','stocks.programa_id')
                                                ->leftjoin('almacenes','almacenes.id','=','stocks.almacen_id')
                                                ->leftjoin('catalogo_marcas','catalogo_marcas.id','=','stocks.marca_id')
                                                ->leftjoin('bienes_servicios_empaque_detalles','bienes_servicios_empaque_detalles.id','=','stocks.empaque_detalle_id')
                                                //Ordenamiento
                                                ->orderBy('stocks.unidad_medica_id','DESC')
                                                ->orderBy('stocks.fecha_caducidad','ASC')
                                                ->orderBy('stocks.existencia','DESC')
                                                ->orderBy('unidad_medica_catalogo_articulos.id','DESC')
                                                ->orderBy('bienes_servicios.especificaciones')
                                                ;

            if(isset($parametros['buscar_solo_stock']) && $parametros['buscar_solo_stock']){
                $stock_existencias = $stock_existencias->whereNotNull('stocks.id');
            }

            if(isset($parametros['buscar_solo_catalogo']) && $parametros['buscar_solo_catalogo']){
                $stock_existencias = $stock_existencias->whereNotNull('unidad_medica_catalogo_articulos.id');
            }

            if(!(isset($parametros['buscar_catalogo_completo']) && $parametros['buscar_catalogo_completo'])){
                $stock_existencias = $stock_existencias->where(function($where){ $where->whereNotNull('stocks.id')->orWhereNotNull('unidad_medica_catalogo_articulos.id'); });
            }

            //Filtros, busquedas, ordenamiento
            if(isset($parametros['query']) && $parametros['query']){
                $stock_existencias = $stock_existencias->where(function($query)use($parametros){
                    return $query->where('cog_partidas_especificas.descripcion','LIKE','%'.$parametros['query'].'%')
                                ->orWhere('familias.nombre','LIKE','%'.$parametros['query'].'%')
                                ->orWhere('bienes_servicios.clave_cubs','LIKE','%'.$parametros['query'].'%')
                                ->orWhere('bienes_servicios.clave_local','LIKE','%'.$parametros['query'].'%')
                                ->orWhere('bienes_servicios.articulo','LIKE','%'.$parametros['query'].'%')
                                ->orWhere('bienes_servicios.especificaciones','LIKE','%'.$parametros['query'].'%')
                                ->orWhere('stocks.lote','LIKE','%'.$parametros['query'].'%')
                                ->orWhere('stocks.codigo_barras','LIKE','%'.$parametros['query'].'%');
                });
            }

            /*if(isset($parametros['programa_id']) && $parametros['programa_id'] != null){
                $stock_existencias = $stock_existencias->where('stocks.programa_id',$parametros['programa_id']);
            }*/

            /*
            if(isset($parametros['almacen_id']) && $parametros['almacen_id']){
                $stock_existencias = $stock_existencias->where('stocks.almacen_id',$parametros['almacen_id']);
            }
            */

            if(isset($parametros['familia_id']) && $parametros['familia_id']){
                $stock_existencias = $stock_existencias->where('bienes_servicios.familia_id',$parametros['familia_id']);
            }

            if(isset($parametros['clave_partida']) && $parametros['clave_partida']){
                $stock_existencias = $stock_existencias->where('bienes_servicios.clave_partida_especifica',$parametros['clave_partida']);
            }

            if(isset($parametros['con_caducidad']) && $parametros['con_caducidad']){
                $stock_existencias = $stock_existencias->where('bienes_servicios.tiene_fecha_caducidad',1);
            }

            if(isset($parametros['sin_caducidad']) && $parametros['sin_caducidad']){
                $stock_existencias = $stock_existencias->where('bienes_servicios.tiene_fecha_caducidad','!=',1);
            }

            if(isset($parametros['descontinuados']) && $parametros['descontinuados']){
                $stock_existencias = $stock_existencias->where('bienes_servicios.descontinuado',1);
            }

            if(isset($parametros['no_descontinuados']) && $parametros['no_descontinuados']){
                $stock_existencias = $stock_existencias->where('bienes_servicios.descontinuado','!=',1);
            }

            if(isset($parametros['normativos']) && $parametros['normativos']){
                $stock_existencias = $stock_existencias->where('unidad_medica_catalogo_articulos.es_normativo',1);
            }

            if(isset($parametros['no_normativos']) && $parametros['no_normativos']){
                $stock_existencias = $stock_existencias->where('unidad_medica_catalogo_articulos.es_normativo','!=',1);
            }

            if(isset($parametros['page'])){
                $resultadosPorPagina = isset($parametros["per_page"])? $parametros["per_page"] : 20;
                $stock_existencias = $stock_existencias->paginate($resultadosPorPagina);
            } else {
                $stock_existencias = $stock_existencias->get();
            }

            $resultado_stock = [];
            $control_articulos = [];
            $index_articulo;
            foreach ($stock_existencias as $key => $value) {
                if(!isset($control_articulos[$value->articulo_id])){
                    $control_articulos[$value->articulo_id] = count($resultado_stock);
                    $resultado_stock[] = [
                        'id' => $value->articulo_id,
                        'clave_partida_especifica' => $value->clave_partida_especifica,
                        'familia_id' => $value->familia_id,
                        'clave_cubs' => $value->clave_cubs,
                        'clave_local' => $value->clave_local,
                        'articulo' => $value->articulo,
                        'especificaciones' => $value->especificaciones,
                        'descontinuado' => $value->descontinuado,
                        'tiene_fecha_caducidad' => $value->tiene_fecha_caducidad,
                        'puede_surtir_unidades' => $value->puede_surtir_unidades,
                        'tipo_bien_servicio' => $value->tipo_bien_servicio,
                        'clave_form' => $value->clave_form,
                        'partida_especifica'=>$value->partida_especifica,
                        'familia' => $value->familia,
                        'es_normativo' => $value->es_normativo,
                        'cantidad_minima' => $value->cantidad_minima,
                        'cantidad_maxima' => $value->cantidad_maxima,
                        'en_catalogo_unidad' => $value->en_catalogo_unidad,
                        'total_lotes' => 0,
                        'existencias' => 0,
                        'existencias_empaque' => 0,
                        'existencias_unidades' => 0,
                    ];
                }
                $index_articulo = $control_articulos[$value->articulo_id];

                if($value->id){
                    if(isset($parametros['dividir_programa']) && $parametros['dividir_programa']){
                        if(!isset($resultado_stock[$index_articulo]['programa_lotes'])){
                            $resultado_stock[$index_articulo]['programa_lotes'] = [];
                        }
    
                        $programa_id = ($value->programa_id)?$value->programa_id:'S/P';
                        if(!isset($resultado_stock[$index_articulo]['programa_lotes'][$programa_id])){
                            $resultado_stock[$index_articulo]['programa_lotes'][$programa_id] = [
                                'id' => $programa_id,
                                'nombre' => ($value->programa_id)?$value->programa:'Sin Programa',
                                'lotes' => []
                            ];
                        }
    
                        $resultado_stock[$index_articulo]['programa_lotes'][$programa_id]['lotes'][] = [
                            'id'                    => $value->id,
                            'lote'                  => $value->lote,
                            'fecha_caducidad'       => $value->fecha_caducidad,
                            'codigo_barras'         => $value->codigo_barras,
                            'no_serie'              => $value->no_serie,
                            'modelo'                => $value->modelo,
                            'marca_id'              => $value->marca_id,
                            'marca'                 => $value->marca,
                            'existencia'            => $value->existencia,
                            'existencia_empaque'    => $value->existencia,
                            'existencia_unidades'   => $value->existencia_unidades,
                        ];
                    }else{
                        if(!isset($resultado_stock[$index_articulo]['lotes'])){
                            $resultado_stock[$index_articulo]['lotes'] = [];
                        }
    
                        $resultado_stock[$index_articulo]['lotes'][] = [
                            'id'                    => $value->id,
                            'programa_id'           => $value->programa_id,
                            'programa'              => ($value->programa_id)?$value->programa:'Sin Programa Asignado',
                            'lote'                  => $value->lote,
                            'fecha_caducidad'       => $value->fecha_caducidad,
                            'codigo_barras'         => $value->codigo_barras,
                            'no_serie'              => $value->no_serie,
                            'modelo'                => $value->modelo,
                            'marca_id'              => $value->marca_id,
                            'marca'                 => $value->marca,
                            'existencia'            => $value->existencia,
                            'existencia_empaque'    => $value->existencia,
                            'existencia_unidades'   => $value->existencia_unidades,
                        ];
                    }
                    $resultado_stock[$index_articulo]['total_lotes']++;
                    $resultado_stock[$index_articulo]['existencias'] += $value->existencia;
                    $resultado_stock[$index_articulo]['existencias_empaque'] += $value->existencia;
                    $resultado_stock[$index_articulo]['existencias_unidades'] += $value->existencia_unidades;
                }
            }

            if(isset($parametros['dividir_programa']) && $parametros['dividir_programa']){
                foreach ($resultado_stock as $key => $value) {
                    $resultado_stock[$key]['programa_lotes'] = array_values($resultado_stock[$key]['programa_lotes']);
                }
            }
            
            return response()->json(['data'=>$resultado_stock],HttpResponse::HTTP_OK);
        }catch(\Exception $e){
            return response()->json(['error'=>['message'=>$e->getMessage(),'line'=>$e->getLine()]], HttpResponse::HTTP_CONFLICT);
        }
    }

    public function buscarPaciente(Request $request, $expediente){
        try{
            $loggedUser = auth()->userOrFail();
            $paciente = Paciente::where('expediente_clinico',$expediente)->first();
            return response()->json(['data'=>$paciente],HttpResponse::HTTP_OK);
        }catch(\Exception $e){
            return response()->json(['error'=>['message'=>$e->getMessage(),'line'=>$e->getLine()]], HttpResponse::HTTP_CONFLICT);
        }
    }
    
    public function buscarReceta(Request $request, $folio){
        try{
            $loggedUser = auth()->userOrFail();

            $tipoSolicitud = TipoSolicitud::where('clave','RCTA')->first();
            if(!$tipoSolicitud){
                throw new \Exception("Tipo de solicitud no encontrado", 1);
            }

            $receta = Solicitud::where('tipo_solicitud_id',$tipoSolicitud->id)->where('folio',$folio)->first();
            return response()->json(['data'=>$receta],HttpResponse::HTTP_OK);
        }catch(\Exception $e){
            return response()->json(['error'=>['message'=>$e->getMessage(),'line'=>$e->getLine()]], HttpResponse::HTTP_CONFLICT);
        }
    }
}