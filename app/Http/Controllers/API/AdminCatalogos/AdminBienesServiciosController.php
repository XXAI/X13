<?php

namespace App\Http\Controllers\API\AdminCatalogos;

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

class AdminBienesServiciosController extends Controller{

    public function obtenerCatalogos(Request $request){
        try{
            $loggedUser = auth()->userOrFail();
            $parametros = $request->all();

            $catalogos = [
                'familias'              => Familia::get(),
                'partidas_especificas'  => PartidaEspecifica::get(),
                'tipos_bien_servicio'   => TipoBienServicio::get(),
                'empaques'              => Empaque::get(),
                'unidades_medida'       => UnidadMedida::get(),
            ];

            return response()->json(['data'=>$catalogos],HttpResponse::HTTP_OK);
        }catch(\Exception $e){
            return response()->json(['error'=>['message'=>$e->getMessage(),'line'=>$e->getLine()]], HttpResponse::HTTP_CONFLICT);
        }
    }

    public function obtenerLotes(Request $request, $id){
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
    public function index(Request $request){
        try{
            $loggedUser = auth()->userOrFail();
            $parametros = $request->all();

            /*if(!\Gate::denies('has-permission', 'vPZUt02ZCcGoNuxDlfOCETTjJAobvJvO')){
                $parametros['buscar_catalogo_completo'] = true;
            }*/

            $catalogo_articulos = BienServicio::select('bienes_servicios.*','familias.nombre AS familia','catalogo_tipos_bien_servicio.descripcion AS tipo_bien_servicio',DB::raw('COUNT(DISTINCT stocks.id) as existencias'))
                                                ->leftJoin('familias','familias.id','=','bienes_servicios.familia_id')
                                                ->leftJoin('catalogo_tipos_bien_servicio','catalogo_tipos_bien_servicio.id','bienes_servicios.tipo_bien_servicio_id')
                                                ->leftJoin('stocks',function($join){
                                                    $join->on('stocks.bien_servicio_id','=','bienes_servicios.id')
                                                            ->where(function($where){
                                                                $where->where('stocks.existencia','>',0)->orWhere('stocks.existencia_unidades','>',0);
                                                            });
                                                })
                                                ->groupBy('bienes_servicios.id')
                                                ->orderBy('bienes_servicios.updated_at','desc');

            //Filtros, busquedas, ordenamiento
            if(isset($parametros['query']) && $parametros['query']){
                $catalogo_articulos = $catalogo_articulos->where(function($query)use($parametros){
                    return $query->where('catalogo_tipos_bien_servicio.descripcion','LIKE','%'.$parametros['query'].'%')
                                ->orWhere('familias.nombre','LIKE','%'.$parametros['query'].'%')
                                ->orWhere('bienes_servicios.clave_cubs','LIKE','%'.$parametros['query'].'%')
                                ->orWhere('bienes_servicios.clave_local','LIKE','%'.$parametros['query'].'%')
                                ->orWhere('bienes_servicios.articulo','LIKE','%'.$parametros['query'].'%')
                                ->orWhere('bienes_servicios.especificaciones','LIKE','%'.$parametros['query'].'%');
                });
            }

            if(isset($parametros['tipo_bien_servicio_id']) && $parametros['tipo_bien_servicio_id']){
                $catalogo_articulos = $catalogo_articulos->where('bienes_servicios.tipo_bien_servicio_id',$parametros['tipo_bien_servicio_id']);
            }

            if(isset($parametros['familia_id']) && $parametros['familia_id']){
                $catalogo_articulos = $catalogo_articulos->where('bienes_servicios.familia_id',$parametros['familia_id']);
            }

            if(isset($parametros['clave_partida']) && $parametros['clave_partida']){
                $catalogo_articulos = $catalogo_articulos->where('bienes_servicios.clave_partida_especifica',$parametros['clave_partida']);
            }

            if(isset($parametros['con_caducidad']) && $parametros['con_caducidad']){
                $catalogo_articulos = $catalogo_articulos->where('bienes_servicios.tiene_fecha_caducidad',1);
            }

            if(isset($parametros['sin_caducidad']) && $parametros['sin_caducidad']){
                $catalogo_articulos = $catalogo_articulos->where('bienes_servicios.tiene_fecha_caducidad','!=',1);
            }

            if(isset($parametros['descontinuados']) && $parametros['descontinuados']){
                $catalogo_articulos = $catalogo_articulos->where('bienes_servicios.descontinuado',1);
            }

            if(isset($parametros['no_descontinuados']) && $parametros['no_descontinuados']){
                $catalogo_articulos = $catalogo_articulos->where('bienes_servicios.descontinuado','!=',1);
            }

            if(isset($parametros['page'])){
                $resultadosPorPagina = isset($parametros["per_page"])? $parametros["per_page"] : 20;
                $catalogo_articulos = $catalogo_articulos->paginate($resultadosPorPagina);
            } else {
                $catalogo_articulos = $catalogo_articulos->get();
            }

            return response()->json(['data'=>$catalogo_articulos],HttpResponse::HTTP_OK);
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
                                                    $where->where('stocks.existencia','>',0)->orWhere('stocks.existencia_unidades','>',0);
                                                });
                                        })
                                        ->with(['familia','partidaEspecifica',
                                                'empaqueDetalle'=>function($empaqueDetalle){
                                                    $empaqueDetalle->select('bienes_servicios_empaque_detalles.*',DB::raw('COUNT(DISTINCT stocks.id) as existencias'))
                                                                    ->leftJoin('stocks',function($join){
                                                                        $join->on('stocks.empaque_detalle_id','=','bienes_servicios_empaque_detalles.id')->where(function($where){
                                                                            $where->where('stocks.existencia','>',0)->orWhere('stocks.existencia_unidades','>',0);
                                                                        });
                                                                    })
                                                                    ->groupBy('bienes_servicios_empaque_detalles.id')
                                                                    ->with('unidadMedida','empaque');
                                                }])->find($id);
            return response()->json(['data'=>$bien_servicio],HttpResponse::HTTP_OK);
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

            if(isset($parametros['detalles']) && $parametros['detalles'] && count($parametros['detalles'])){
                $nuevos_detalles = [];
                $editar_detalles = [];

                $detalles_raw = $articulo->empaqueDetalle;
                $total_loop = count($detalles_raw);
                for($i = 0; $i < $total_loop; $i++){
                    $editar_detalles[$detalles_raw[$i]->id] = $detalles_raw[$i];
                }

                $total_loop = count($parametros['detalles']);
                for($i = 0; $i < $total_loop; $i ++){
                    $detalle = $parametros['detalles'][$i];
                    if($detalle['id']){
                        if(isset($editar_detalles[$detalle['id']])){
                            $detalle_update = $editar_detalles[$detalle['id']];
                            if(isset($detalle['eliminar']) && $detalle['eliminar']){
                                $detalle_update->delete();
                                Stock::where('empaque_detalle_id',$detalle_update->id)->update(['empaque_detalle_id'=>null]);
                            }else if(isset($detalle['editado']) && $detalle['editado']){
                                if($detalle_update->piezas_x_empaque != $detalle['piezas_x_empaque']){
                                    $lotes = Stock::where('empaque_detalle_id',$detalle_update->id)->get();
                                    if(count($lotes)){
                                        //
                                    }
                                }
                                $detalle_update->update($detalle);
                            }
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
                                                    $where->where('stocks.existencia','>',0)->orWhere('stocks.existencia_unidades','>',0);
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
}