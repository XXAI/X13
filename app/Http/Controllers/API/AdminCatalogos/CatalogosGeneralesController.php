<?php

namespace App\Http\Controllers\API\AdminCatalogos;

use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;

use App\Http\Controllers\Controller;

use App\Http\Requests;

use DB;

use App\Models\AreaServicio;
use App\Models\Distrito;
use App\Models\Empaque;
use App\Models\Marca;
use App\Models\SolicitudTipoUso;
use App\Models\TipoAlmacen;
use App\Models\TipoBienServicio;
use App\Models\TipoMovimiento;
use App\Models\TipoSolicitud;
use App\Models\UnidadMedida;
use Response, Validator;

class CatalogosGeneralesController extends Controller{

    public function obtenerCatalogos(Request $request){
        try{
            $loggedUser = auth()->userOrFail();
            $parametros = $request->all();

            $catalogos = [
                ['id'=>1,    'label'=>'Areas y Servicios',          'value'=>'catalogo_areas_servicios'], 
                ['id'=>1,    'label'=>'Distritos',                  'value'=>'catalogo_distritos'], 
                ['id'=>1,    'label'=>'Empaques',                   'value'=>'catalogo_empaques'], 
                ['id'=>1,    'label'=>'Marcas',                     'value'=>'catalogo_marcas'], 
                ['id'=>1,    'label'=>'Solicitudes: Tipos de Uso',  'value'=>'catalogo_solicitudes_tipos_uso'], 
                ['id'=>1,    'label'=>'Tipos: Almacén',             'value'=>'catalogo_tipos_almacen'], 
                ['id'=>1,    'label'=>'Tipos: Bienes y Servicios',  'value'=>'catalogo_tipos_bien_servicio'], 
                ['id'=>1,    'label'=>'Tipos: Movimientos',         'value'=>'catalogo_tipos_movimiento'], 
                ['id'=>1,    'label'=>'Tipos: Solicitudes',         'value'=>'catalogo_tipos_solicitud'], 
                ['id'=>1,    'label'=>'Unidades de Medida',         'value'=>'catalogo_unidades_medida'], 
            ];

            return response()->json(['data'=>$catalogos],HttpResponse::HTTP_OK);
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
            $loggedUser = auth()->userOrFail();
            $parametros = $request->all();

            /*if(!\Gate::denies('has-permission', 'vPZUt02ZCcGoNuxDlfOCETTjJAobvJvO')){
                $parametros['buscar_catalogo_completo'] = true;
            }*/

            $catalogos = [
                'catalogo_areas_servicios'         =>  AreaServicio::getModel(),
                'catalogo_distritos'               =>  Distrito::getModel(),
                'catalogo_empaques'                =>  Empaque::getModel(),
                'catalogo_marcas'                  =>  Marca::getModel(),
                'catalogo_solicitudes_tipos_uso'   =>  SolicitudTipoUso::getModel(),
                'catalogo_tipos_almacen'           =>  TipoAlmacen::getModel(),
                'catalogo_tipos_bien_servicio'     =>  TipoBienServicio::getModel(),
                'catalogo_tipos_movimiento'        =>  TipoMovimiento::getModel(),
                'catalogo_tipos_solicitud'         =>  TipoSolicitud::getModel(),
                'catalogo_unidades_medida'         =>  UnidadMedida::getModel(),
            ];
            $catalogo_registros = $catalogos[$parametros['catalogo']];

            $catalogo_registros = $catalogo_registros::select('*')->orderBy('updated_at','DESC');

            $resultado = $catalogo_registros->first();
            $columnas = array_keys(collect($resultado)->toArray());

            //Filtros, busquedas, ordenamiento
            /*if(isset($parametros['query']) && $parametros['query']){
                $catalogo_registros = $catalogo_registros->where(function($query)use($parametros){
                    return $query->where('catalogo_tipos_bien_servicio.descripcion','LIKE','%'.$parametros['query'].'%')
                                ->orWhere('familias.nombre','LIKE','%'.$parametros['query'].'%')
                                ->orWhere('bienes_servicios.clave_cubs','LIKE','%'.$parametros['query'].'%')
                                ->orWhere('bienes_servicios.clave_local','LIKE','%'.$parametros['query'].'%')
                                ->orWhere('bienes_servicios.articulo','LIKE','%'.$parametros['query'].'%')
                                ->orWhere('bienes_servicios.especificaciones','LIKE','%'.$parametros['query'].'%');
                });
            }*/

            if(isset($parametros['page'])){
                $resultadosPorPagina = isset($parametros["per_page"])? $parametros["per_page"] : 20;
                $catalogo_registros = $catalogo_registros->paginate($resultadosPorPagina);
            } else {
                $catalogo_registros = $catalogo_registros->get();
            }

            return response()->json(['data'=>$catalogo_registros,'columnas'=>$columnas],HttpResponse::HTTP_OK);
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
            $bien_servicio = BienServicio::select('bienes_servicios.*',DB::raw('COUNT(DISTINCT stocks.id) as existencias'))
                                        ->leftJoin('stocks',function($join){
                                            $join->on('stocks.bien_servicio_id','=','bienes_servicios.id')
                                                ->where(function($where){
                                                    $where->where('stocks.existencia','>',0)->orWhere('stocks.existencia_piezas','>',0);
                                                });
                                        })
                                        ->with(['familia','partidaEspecifica','unidadMedida',
                                                'empaqueDetalle'=>function($empaqueDetalle){
                                                    $empaqueDetalle->select('bienes_servicios_empaque_detalles.*',DB::raw('COUNT(DISTINCT stocks.id) as existencias'))
                                                                    ->leftJoin('stocks',function($join){
                                                                        $join->on('stocks.empaque_detalle_id','=','bienes_servicios_empaque_detalles.id')->where(function($where){
                                                                            $where->where('stocks.existencia','>',0)->orWhere('stocks.existencia_piezas','>',0);
                                                                        });
                                                                    })
                                                                    ->groupBy('bienes_servicios_empaque_detalles.id')
                                                                    ->with('unidadMedida','empaque');
                                                }])->find($id);
            //
            $lotes = Stock::select('catalogo_unidades_medicas.nombre as unidad_medica','bienes_servicios_empaque_detalles.descripcion as empaque_detalle',DB::raw('IF(COUNT(DISTINCT stocks.almacen_id) > 1,CONCAT(COUNT(DISTINCT stocks.almacen_id)," Almacen(es)"),almacenes.nombre) as almacen'),
                                    DB::raw('CONCAT(COUNT(DISTINCT stocks.lote)," Lote(s)") as lote'),'stocks.empaque_detalle_id')
                            ->leftJoin('catalogo_unidades_medicas','catalogo_unidades_medicas.id','=','stocks.unidad_medica_id')
                            ->leftJoin('almacenes','almacenes.id','=','stocks.almacen_id')
                            ->leftJoin('bienes_servicios_empaque_detalles','bienes_servicios_empaque_detalles.id','=','stocks.empaque_detalle_id')
                            ->groupBy('stocks.empaque_detalle_id')
                            ->groupBy('stocks.unidad_medica_id')
                            ->orderBy('stocks.unidad_medica_id')
                            ->where(function($where){$where->where('stocks.existencia','>',0)->orWhere('stocks.existencia_piezas','>',0);})
                            ->where('stocks.bien_servicio_id',$id)->get();
            //
            $return_data = [
                'articulo' => $bien_servicio,
                'lotes' => $lotes,
            ];
            return response()->json(['data'=>$return_data],HttpResponse::HTTP_OK);
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
        try {
            $reglas = [
                'clave_partida_especifica'  =>'required',
                'familia_id'                =>'required',
                'tipo_bien_servicio_id'     =>'required',
                'articulo'                  =>'required',
                'especificaciones'          =>'required',
            ];
            
            $mensajes = [
                'clave_partida_especifica.required'  =>'El campo clave_partida_especifica es obligatorio',
                'familia_id.required'                =>'El campo familia_id es obligatorio',
                'tipo_bien_servicio_id.required'     =>'El campo tipo_bien_servicio_id es obligatorio',
                'articulo.required'                  =>'El campo articulo es obligatorio',
                'especificaciones.required'          =>'El campo especificaciones es obligatorio',
            ];

            $loggedUser = auth()->userOrFail();
            $parametros = $request->all();

            $v = Validator::make($parametros, $reglas, $mensajes);
            
            if ($v->fails()) {
                return response()->json(['error'=>'Datos de formulario incorrectors','data'=>$v->errors()],HttpResponse::HTTP_OK);
            }

            if(isset($parametros['id']) && $parametros['id']){
                $articulo = BienServicio::find($parametros['id']);
                if(!$articulo){
                    return response()->json(['error'=>'No se encontro el registro guardado'],HttpResponse::HTTP_OK);
                }
            }

            if(isset($parametros['clave_local']) && $parametros['clave_local']){
                $encontrado = BienServicio::where('clave_local',$parametros['clave_local']);
                if(isset($parametros['id']) && $parametros['id']){
                    $encontrado = $encontrado->where('id','!=',$parametros['id']);
                }
                $encontrado = $encontrado->first();

                if($encontrado){
                    return response()->json(['error'=>'Esta clave ya se encuentra asignada a otro registro'],HttpResponse::HTTP_OK);
                }
            }

            if(isset($parametros['generar_clave_local']) && $parametros['generar_clave_local']){
                //generar clave local automatica
                $max_clave_local = BienServicio::where('clave_local','like','CL-%')->max('clave_local');
                $max_clave_local = intval(str_replace('CL-','',$max_clave_local)) + 1;
                $clave_local = 'CL-' . str_pad($max_clave_local,7,'0',STR_PAD_LEFT);
                $parametros['clave_local'] = $clave_local;
            }

            DB::beginTransaction();

            if(isset($articulo)){
                $articulo->update($parametros);
            }else{
                $articulo = BienServicio::create($parametros);
            }
            $articulo->load('empaqueDetalle');

            $detalles_guardados = [];
            $detalles_raw = $articulo->empaqueDetalle;
            $total_loop = count($detalles_raw);
            for($i = 0; $i < $total_loop; $i++){
                $detalles_guardados[$detalles_raw[$i]->id] = $detalles_raw[$i];
            }

            if(isset($parametros['detalles']) && $parametros['detalles'] && count($parametros['detalles'])){
                $total_loop = count($parametros['detalles']);
                for($i = 0; $i < $total_loop; $i ++){
                    $detalle = $parametros['detalles'][$i];
                    if($detalle['id']){
                        if(isset($detalles_guardados[$detalle['id']])){
                            $detalle_update = $detalles_guardados[$detalle['id']];
                            if(isset($detalle['eliminar']) && $detalle['eliminar']){
                                $lotes = Stock::where('empaque_detalle_id',$detalle_update->id)->get();
                                $total_lotes = count($lotes);
                                if($total_lotes){
                                    for($j = 0; $j < $total_lotes; $j++){
                                        $lote = $lotes[$j];
                                        if($lote->existencia_piezas < $detalle_update->piezas_x_empaque){
                                            $piezas_extra = $lote->existencia_piezas;
                                        }else{
                                            $piezas_extra = $lote->existencia_piezas - ( $lote->existencia * $detalle_update->piezas_x_empaque );
                                        }
                                        $lote->existencia_piezas = $lote->existencia + $piezas_extra;
                                        $lote->empaque_detalle_id = null;
                                        $lote->save();
                                    }
                                }
                                $detalle_update->delete();
                                $detalles_guardados[$detalle['id']] = null;
                            }else{
                                if($detalle_update->piezas_x_empaque != $detalle['piezas_x_empaque']){
                                    $lotes = Stock::where('empaque_detalle_id',$detalle_update->id)->where(function($where){$where->where('existencia','>',0)->orWhere('existencia_piezas','>',0);})->get();
                                    $total_lotes = count($lotes);
                                    if($total_lotes){
                                        for($j = 0; $j < $total_lotes; $j++){
                                            $lote = $lotes[$j];

                                            $suma_movimientos = MovimientoArticulo::select(DB::raw('SUM(movimientos_articulos.cantidad) as cantidad'), 'movimientos_articulos.modo_movimiento', 'movimientos_articulos.direccion_movimiento' )
                                                    ->leftJoin('movimientos','movimientos.id','=','movimientos_articulos.movimiento_id')
                                                    //->where('movimientos.estatus','FIN')
                                                    ->where(function($where){
                                                        $where->where('movimientos.estatus','!=','BOR')->where('movimientos.estatus','!=','CAN');
                                                    })
                                                    ->where('movimientos_articulos.stock_id',$lote->id)
                                                    ->groupBy('movimientos_articulos.stock_id')
                                                    ->groupBy('movimientos_articulos.direccion_movimiento')
                                                    ->groupBy('movimientos_articulos.modo_movimiento')
                                                    ->get();
                                            //
                                            $total_entradas_piezas = 0;
                                            $total_salidas_piezas = 0;

                                            for($k  = 0; $k < count($suma_movimientos); $k++){
                                                $suma = $suma_movimientos[$k];
                                                if($suma->direccion_movimiento == 'ENT'){
                                                    if($suma->modo_movimiento == 'UNI'){
                                                        $total_entradas_piezas += $suma->cantidad;
                                                    }else{
                                                        $total_entradas_piezas += ($suma->cantidad * $detalle['piezas_x_empaque']);
                                                    }
                                                }else if($suma->direccion_movimiento == 'SAL'){
                                                    if($suma->modo_movimiento == 'UNI'){
                                                        $total_salidas_piezas += $suma->cantidad;
                                                    }else{
                                                        $total_salidas_piezas += ($suma->cantidad * $detalle['piezas_x_empaque']);
                                                    }
                                                }
                                            }

                                            $existencias_piezas = $total_entradas_piezas - $total_salidas_piezas;
                                            $existencias = floor($existencias_piezas / $detalle['piezas_x_empaque']);
                                            
                                            $lote->existencia = $existencias;
                                            $lote->existencia_piezas = $existencias_piezas;
                                            $lote->save();
                                            
                                        }
                                    }
                                }
                                $detalle_update->update($detalle);
                            }
                        }else{
                            DB::rollback();
                            return response()->json(['error'=>'No se encontró el detalle del empaque'],HttpResponse::HTTP_OK);
                        }
                    }else{
                        $articulo->empaqueDetalle()->create($detalle);
                    }
                }
            }

            DB::commit();

            $articulo->load(['empaqueDetalle'=>function($empaqueDetalle){
                            $empaqueDetalle->select('bienes_servicios_empaque_detalles.*',DB::raw('COUNT(DISTINCT stocks.id) as existencias'))
                                            ->leftJoin('stocks',function($join){
                                                $join->on('stocks.empaque_detalle_id','=','bienes_servicios_empaque_detalles.id')->where(function($where){
                                                    $where->where('stocks.existencia','>',0)->orWhere('stocks.existencia_piezas','>',0);
                                                });
                                            })
                                            ->groupBy('bienes_servicios_empaque_detalles.id')
                                            ->with('unidadMedida','empaque');
                        }]);
            
            return response()->json(['data'=>$articulo],HttpResponse::HTTP_OK);
        } catch (\Exception $e) {
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
    public function destroy($id){
        //$this->authorize('has-permission',\Permissions::ELIMINAR_ROL);
        try{
            $articulo = BienServicio::find($id);
            
            $validar_stock = Stock::where('bien_servicio_id',$id)->where(function($where){
                                                                            $where->where('existencia','>',0)->orWhere('existencia_piezas','>',0);
                                                                        })->groupBy('bien_servicio_id')->first();
            if($validar_stock){
                return response()->json(['error'=>'Este articulo no puede eliminarse ya que cuenta con existencias activas'],HttpResponse::HTTP_OK);
            }

            $articulo->empaqueDetalle()->delete();
            $articulo->delete();

            return response()->json(['data'=>'Articulo eliminado'], HttpResponse::HTTP_OK);
        }catch(\Exception $e){
            return response()->json(['error'=>['message'=>$e->getMessage(),'line'=>$e->getLine()]], HttpResponse::HTTP_CONFLICT);
        }
    }
}
