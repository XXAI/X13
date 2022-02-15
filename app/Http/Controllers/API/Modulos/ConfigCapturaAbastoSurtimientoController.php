<?php

namespace App\Http\Controllers\API\Modulos;

use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;

use App\Http\Controllers\Controller;

use Validator;
use DB;

use App\Exports\DevReportExport;

use App\Models\CorteReporteAbastoSurtimiento;
use App\Models\ConfigCapturaAbastoSurtimiento;
use App\Models\UnidadMedica;
use App\Models\UnidadMedicaCatalogo;
use App\Models\TipoBienServicio;
use App\Models\ConfigUnidadMedicaAbasto;

class ConfigCapturaAbastoSurtimientoController extends Controller{
    public function getDataInfo(Request $request){
        try{
            $loggedUser = auth()->userOrFail();

            $data = [
                'unidad_medica' => UnidadMedica::find($loggedUser->unidad_medica_asignada_id)
            ];
            
            return response()->json(['data'=>$data],HttpResponse::HTTP_OK);
        }catch(\Exception $e){
            return response()->json(['error'=>['message'=>$e->getMessage(),'line'=>$e->getLine()]], HttpResponse::HTTP_CONFLICT);
        }
    }

    public function getListaUnidadesMedicasCatalogos(Request $request){
        try{
            $loggedUser = auth()->userOrFail();

            $unidades = UnidadMedicaCatalogo::select('unidad_medica_catalogo.unidad_medica_id as id','catalogo_unidades_medicas.clues','catalogo_unidades_medicas.nombre',
                                            DB::raw('SUM(IF(unidad_medica_catalogo.tipo_bien_servicio_id = 1, unidad_medica_catalogo.total_articulos,0)) AS cantidad_medicamentos'),
                                            DB::raw('IF(unidad_medica_catalogo.tipo_bien_servicio_id = 1, unidad_medica_catalogo.puede_editar,0) AS puede_editar_medicamentos'),
                                            DB::raw('SUM(IF(unidad_medica_catalogo.tipo_bien_servicio_id = 2, unidad_medica_catalogo.total_articulos,0)) AS cantidad_material_curacion'),
                                            DB::raw('IF(unidad_medica_catalogo.tipo_bien_servicio_id = 2, unidad_medica_catalogo.puede_editar,0) AS puede_editar_material_curacion'))
                                            ->leftjoin('catalogo_unidades_medicas','catalogo_unidades_medicas.id','=','unidad_medica_catalogo.unidad_medica_id')
                                            ->groupBy('unidad_medica_id')
                                            ->orderBy('catalogo_unidades_medicas.nombre')
                                            ->get();
            
            return response()->json(['data'=>$unidades],HttpResponse::HTTP_OK);
        }catch(\Exception $e){
            return response()->json(['error'=>['message'=>$e->getMessage(),'line'=>$e->getLine()]], HttpResponse::HTTP_CONFLICT);
        }
    }

    public function adminListaUnidadesMedicasCatalogos(Request $request){
        try{
            $loggedUser = auth()->userOrFail();
            $parametros = $request->all();

            DB::beginTransaction();
            if(isset($parametros['unidades']) && count($parametros['unidades']) > 0){
                $catalogos_unidades_ids = UnidadMedicaCatalogo::select('id')->whereIn('unidad_medica_id',$parametros['unidades']);
                if($parametros['tipo_catalogo'] != '*'){
                    $tipo_bien = TipoBienServicio::where('clave',$parametros['tipo_catalogo'])->first();
                    $catalogos_unidades_ids = $catalogos_unidades_ids->where('tipo_bien_servicio_id',$tipo_bien->id);
                }
                $catalogos_unidades_ids = $catalogos_unidades_ids->get()->pluck('id');

                UnidadMedicaCatalogo::whereIn('id',$catalogos_unidades_ids)->update(['puede_editar'=>$parametros['puede_editar']]);

                /*
                if(!$parametros['puede_editar']){ DEFEAT !!!!!! DEFEAT !!!!!! DEFEAT !!!!!! DEFEAT !!!!!! DEFEAT !!!!!! DEFEAT !!!!!! DEFEAT !!!!!! DEFEAT !!!!!! DEFEAT !!!!!! DEFEAT !!!!!! DEFEAT !!!!!! DEFEAT
                    $catalogos_unidades_ids_query = implode(',',$catalogos_unidades_ids->toArray());

                    DB::statement("UPDATE unidad_medica_catalogo A, config_unidad_medica_abasto_surtimiento B set B.total_claves_medicamentos_catalogo = A.total_articulos
                                where A.unidad_medica_id = B.unidad_medica_id AND B.deleted_at IS NULL AND A.tipo_bien_servicio_id = ? 
                                AND A.id IN ?", 
                            [ 1, '('.$catalogos_unidades_ids_query.')']);
                    
                    DB::statement("UPDATE unidad_medica_catalogo A, config_unidad_medica_abasto_surtimiento B set B.total_claves_material_curacion_catalogo = A.total_articulos
                                where A.unidad_medica_id = B.unidad_medica_id AND B.deleted_at IS NULL AND A.tipo_bien_servicio_id = ? 
                                AND A.id IN ?", 
                            [ 2, '('.$catalogos_unidades_ids_query.')']);
                } !!!!!! DEFEAT !!!!!! DEFEAT !!!!!! DEFEAT !!!!!! DEFEAT !!!!!! DEFEAT !!!!!! DEFEAT !!!!!! DEFEAT !!!!!! DEFEAT !!!!!! DEFEAT !!!!!! DEFEAT !!!!!! DEFEAT !!!!!! DEFEAT !!!!!! DEFEAT !!!!!! DEFEAT
                */
            }

            DB::commit();
            
            return response()->json(['data'=>$parametros],HttpResponse::HTTP_OK);
        }catch(\Exception $e){
            DB::rollback();
            return response()->json(['error'=>['message'=>$e->getMessage(),'line'=>$e->getLine()]], HttpResponse::HTTP_CONFLICT);
        }
    }

    public function recalcularPorcentajes(Request $request,$id){
        try{
            $loggedUser = auth()->userOrFail();
            
            DB::beginTransaction();

            $registros = CorteReporteAbastoSurtimiento::where('config_captura_id',$id)->get();
            $total_registros = count($registros);

            if($total_registros){
                $lista_unidades_ids = $registros->pluck('unidad_medica_id');
                $catalogos_unidades_raw = ConfigUnidadMedicaAbasto::whereIn('unidad_medica_id',$lista_unidades_ids)->get();
                $catalogos_unidades = [];
                for ($i=0; $i < count($catalogos_unidades_raw); $i++) { 
                    $catalogos_unidades[$catalogos_unidades_raw[$i]->unidad_medica_id] = $catalogos_unidades_raw[$i];
                }

                for ($i=0; $i < $total_registros; $i++) { 
                    $registro = $registros[$i];

                    $catalogo_medicamentos = $catalogos_unidades[$registro->unidad_medica_id]->total_claves_medicamentos_catalogo;
                    $catalogo_mat_curacion = $catalogos_unidades[$registro->unidad_medica_id]->total_claves_material_curacion_catalogo;

                    $total_claves_catalogo = $catalogo_medicamentos + $catalogo_mat_curacion;
                    $total_claves_existentes = $registro->claves_medicamentos_existentes + $registro->claves_material_curacion_existentes;

                    $registro->claves_medicamentos_catalogo = $catalogo_medicamentos;
                    $registro->claves_medicamentos_porcentaje = round((($registro->claves_medicamentos_existentes/$catalogo_medicamentos)*100),2);
                    $registro->claves_material_curacion_catalogo = $catalogo_mat_curacion;
                    $registro->claves_material_curacion_porcentaje = round((($registro->claves_material_curacion_existentes/$catalogo_mat_curacion)*100),2);
                    $registro->total_claves_catalogo = $total_claves_catalogo;
                    $registro->total_claves_porcentaje = round((($total_claves_existentes/$total_claves_catalogo)*100),2);

                    $registro->save();
                }
            }

            DB::commit();
            
            return response()->json(['data'=>$catalogos_unidades],HttpResponse::HTTP_OK);
        }catch(\Exception $e){
            DB::rollback();
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
            //$parametros = $request->all();
            //$loggedUser = auth()->userOrFail();

            $registros = ConfigCapturaAbastoSurtimiento::select('config_captura_abasto_surtimiento.*',DB::raw('COUNT(distinct corte.unidad_medica_id) as total_registros'))
                                                        ->leftJoin('corte_reporte_abasto_surtimiento as corte',function($join){
                                                            $join->on('corte.config_captura_id','=','config_captura_abasto_surtimiento.id')->whereNull('corte.deleted_at');
                                                        })
                                                        ->orderBy('ejercicio','DESC')
                                                        ->orderBy('no_semana','DESC')
                                                        ->orderBy('fecha_fin','DESC')
                                                        ->groupBy('config_captura_abasto_surtimiento.id');

            //Filtros, busquedas, ordenamiento
            /*if(isset($parametros['query']) && $parametros['query']){
                $registros = $registros->where(function($query)use($parametros){
                    return $query->whereRaw('CONCAT_WS(" ",personas.apellido_paterno, personas.apellido_materno, personas.nombre) like "%'.$parametros['query'].'%"' )
                                ->orWhere('formularios.descripcion','LIKE','%'.$parametros['query'].'%');
                });
            }*/
            
            if(isset($parametros['page'])){
                $resultadosPorPagina = isset($parametros["per_page"])? $parametros["per_page"] : 20;
                $registros = $registros->paginate($resultadosPorPagina);
            } else {
                $registros = $registros->get();
            }

            return response()->json(['data'=>$registros],HttpResponse::HTTP_OK);
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
            //$loggedUser = auth()->userOrFail();
            $registro = ConfigCapturaAbastoSurtimiento::find($id);

            if(!$registro){
                throw new \Exception("Registro no encontrado", 1);
            }

            return response()->json(['data'=>$registro],HttpResponse::HTTP_OK);
        }catch(\Exception $e){
            return response()->json(['error'=>['message'=>$e->getMessage(),'line'=>$e->getLine()]], HttpResponse::HTTP_CONFLICT);
        }
    }

     /**
     * sTORE the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request){
        try{
            $loggedUser = auth()->userOrFail();

            $validation_rules = [
                'fecha_inicio'  => 'required',
                'fecha_fin'  => 'required',
                'no_semana'  => 'required',
            ];
        
            $validation_eror_messages = [
                'fecha_inicio.required' => 'El campo es requerido',
                'fecha_fin.required' => 'El campo es requerido',
                'no_semana.required' => 'El campo es requerido',
            ];

            $parametros = $request->all();
            
            $resultado = Validator::make($parametros,$validation_rules,$validation_eror_messages);

            if($resultado->passes()){
                DB::beginTransaction();
                
                if(!isset($parametros['activo']) || !$parametros['activo']){
                    $parametros['activo'] = false;
                }

                if($parametros['activo']){
                    ConfigCapturaAbastoSurtimiento::where('activo',true)->update(['activo'=>false]);
                }

                $parametros['ejercicio'] = substr($parametros['fecha_fin'],0,4);
                
                $registro = ConfigCapturaAbastoSurtimiento::create($parametros);

                if($registro){
                    DB::commit();
                    return response()->json(['data'=>$registro], HttpResponse::HTTP_OK);
                }else{
                    DB::rollback();
                    return response()->json(['error'=>'No se pudo crear el Registro'], HttpResponse::HTTP_CONFLICT);
                }
            }else{
                return response()->json(['mensaje' => 'Error en los datos del formulario', 'validacion'=>$resultado->passes(), 'errores'=>$resultado->errors()], HttpResponse::HTTP_CONFLICT);
            }
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
    public function update(Request $request, $id){
        try{
            $loggedUser = auth()->userOrFail();

            $validation_rules = [
                'fecha_inicio'  => 'required',
                'fecha_fin'  => 'required',
                'no_semana'  => 'required',
            ];
        
            $validation_eror_messages = [
                'fecha_inicio.required' => 'El campo es requerido',
                'fecha_fin.required' => 'El campo es requerido',
                'no_semana.required' => 'El campo es requerido',
            ];

            $parametros = $request->all();
            
            $resultado = Validator::make($parametros,$validation_rules,$validation_eror_messages);

            if($resultado->passes()){
                DB::beginTransaction();

                if(!isset($parametros['activo']) || !$parametros['activo']){
                    $parametros['activo'] = false;
                }

                if($parametros['activo']){
                    ConfigCapturaAbastoSurtimiento::where('activo',true)->update(['activo'=>false]);
                }
                
                $registro = ConfigCapturaAbastoSurtimiento::find($id);

                if(!$registro){
                    throw new \Exception("Registro no encontrado", 1);
                }

                $parametros['ejercicio'] = substr($parametros['fecha_fin'],0,4);

                $registro->update($parametros);

                if($registro->save()){
                    DB::commit();
                    return response()->json(['data'=>$registro], HttpResponse::HTTP_OK);
                }else{
                    DB::rollback();
                    return response()->json(['error'=>'No se pudo crear el Registro'], HttpResponse::HTTP_CONFLICT);
                }
            }else{
                return response()->json(['mensaje' => 'Error en los datos del formulario', 'validacion'=>$resultado->passes(), 'errores'=>$resultado->errors()], HttpResponse::HTTP_CONFLICT);
            }
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
    public function destroy(Request $request, $id){
        try{
            //$loggedUser = auth()->userOrFail();
            $parametros = $request->all();
            $registro = ConfigCapturaAbastoSurtimiento::find($id);

            if(!$registro){
                throw new  \Exception("Registro no encontrado", 1);
            }

            if(isset($parametros['borrar_solo_registros']) && $parametros['borrar_solo_registros']){
                CorteReporteAbastoSurtimiento::where('config_captura_id',$id)->delete();
            }else{
                CorteReporteAbastoSurtimiento::where('config_captura_id',$id)->delete();
                $registro->delete();
            }
            

            return response()->json(['data'=>'Registro eliminado'],HttpResponse::HTTP_OK);
        }catch(\Exception $e){
            return response()->json(['error'=>['message'=>$e->getMessage(),'line'=>$e->getLine()]], HttpResponse::HTTP_CONFLICT);
        }
    }
}