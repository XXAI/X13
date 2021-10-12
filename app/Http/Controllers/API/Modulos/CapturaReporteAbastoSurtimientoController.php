<?php

namespace App\Http\Controllers\API\Modulos;

use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;

use App\Http\Controllers\Controller;

use Validator;
use DB;

use App\Exports\DevReportExport;

use Illuminate\Support\Facades\Storage;

use App\Models\ConfigCapturaAbastoSurtimiento;
use App\Models\CorteReporteAbastoSurtimiento;
use App\Models\ControlSubidaArchivos;
use App\Models\UnidadMedica;

class CapturaReporteAbastoSurtimientoController extends Controller
{
    public function getDataInfo(Request $request){
        try{
            $loggedUser = auth()->userOrFail();

            $data = [
                'unidad_medica' => UnidadMedica::find($loggedUser->unidad_medica_asignada_id),
                'archivo_subido' => ControlSubidaArchivos::where('usuario_id',$loggedUser->id)->where('clave_solicitud','LISTA-MEDS-ACTIVOS')->first(),
                'semana_activa' => ConfigCapturaAbastoSurtimiento::where('activo',true)->first()
            ];
            
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
    public function index(Request $request)
    {
        try{
            $parametros = $request->all();
            $loggedUser = auth()->userOrFail();

            //$registros = CorteReporteAbastoSurtimiento::getModel();

            if(isset($parametros['admin']) && $parametros['admin']){
                $loggedUser->load(['grupos'=>function($grupos){
                                        $grupos->whereRaw('clave_tipo_grupo = "ABYSU"');
                                    }]);
                
                $lista_unidades_id = [];
                foreach ($loggedUser->grupos as $grupo) {
                    $lista_unidades = $grupo->unidadesMedicas->pluck('id')->all();
                    
                    $lista_unidades_id = array_merge($lista_unidades_id,$lista_unidades);
                }
                
                if(count($lista_unidades_id)){
                    if(isset($parametros['fecha_inicio']) && $parametros['fecha_inicio']){
                        $max_fecha_subquery = DB::table('corte_reporte_abasto_surtimiento')->select('id', 'unidad_medica_id', 'fecha_fin')
                                                ->where(function ($where) use($parametros){
                                                    $where->where('corte_reporte_abasto_surtimiento.fecha_inicio',$parametros['fecha_inicio'])
                                                        ->where('corte_reporte_abasto_surtimiento.fecha_fin',$parametros['fecha_fin']);
                                                })
                                                ->whereNULL('deleted_at')->groupBy('unidad_medica_id');
                    }else{
                        $max_fecha_subquery = DB::table('corte_reporte_abasto_surtimiento')->select('id', 'unidad_medica_id', DB::raw('MAX(fecha_fin) as fecha_fin'))
                                                ->whereNULL('deleted_at')->groupBy('unidad_medica_id');
                    }

                    $registros = CorteReporteAbastoSurtimiento::select('catalogo_unidades_medicas.clues', 'catalogo_unidades_medicas.nombre as nombre_unidad','corte_reporte_abasto_surtimiento.*')
                                                                    ->joinSub($max_fecha_subquery,'b',function($join){
                                                                        $join->on('corte_reporte_abasto_surtimiento.unidad_medica_id','=','b.unidad_medica_id')->on('corte_reporte_abasto_surtimiento.fecha_fin','=','b.fecha_fin');
                                                                    })
                                                                    ->rightJoin('catalogo_unidades_medicas',function($join){
                                                                        $join->on('corte_reporte_abasto_surtimiento.unidad_medica_id','=','catalogo_unidades_medicas.id');
                                                                    })
                                                                    ->whereIn('catalogo_unidades_medicas.id',$lista_unidades_id)
                                                                    ->orderBy('corte_reporte_abasto_surtimiento.total_claves_porcentaje','DESC')
                                                                    ->groupBy('catalogo_unidades_medicas.id');
                }else{
                    throw new \Exception("El usuario debe tener un grupo asignado con unidades medicas", 1);
                }

                //$registros = $registros->select('*',DB::raw('MAX(fecha_fin) as max_fecha_fin'))->with('unidadMedica')->groupBy('unidad_medica_id');
            }else{
                $registros = CorteReporteAbastoSurtimiento::where('unidad_medica_id',$loggedUser->unidad_medica_asignada_id)->orderBy('fecha_fin','DESC');

                if(isset($parametros['fecha_inicio']) && $parametros['fecha_inicio']){
                    $registros = $registros->where(function ($where) use($parametros){
                                                        $where->where('corte_reporte_abasto_surtimiento.fecha_inicio',$parametros['fecha_inicio'])
                                                            ->where('corte_reporte_abasto_surtimiento.fecha_fin',$parametros['fecha_fin']);
                                                    });
                }
            }


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
    public function show($id)
    {
        try{
            $loggedUser = auth()->userOrFail();
            $registro = CorteReporteAbastoSurtimiento::find($id);

            if(!$registro){
                throw new \Exception("Registro no encontrado", 1);
            }

            if($loggedUser->unidad_medica_asignada_id && $loggedUser->unidad_medica_asignada_id != $registro->unidad_medica_id){
                throw new \Exception("El usuario no tiene acceso a este registro", 1);
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
                'config_captura_id'                     => 'required',
                //'fecha_inicio'                          => 'required',
                //'fecha_fin'                             => 'required',
                'claves_medicamentos_catalogo'          => 'required',
                'claves_medicamentos_existentes'        => 'required',
                'claves_material_curacion_catalogo'     => 'required',
                'claves_material_curacion_existentes'   => 'required',
                'recetas_recibidas'                     => 'required',
                'recetas_surtidas'                      => 'required',
                'colectivos_recibidos'                  => 'required',
                'colectivos_surtidos'                   => 'required',
                'caducidad_3_meses_total_claves'        => 'required',
                'caducidad_3_meses_total_piezas'        => 'required',
                'caducidad_4_6_meses_total_claves'      => 'required',
                'caducidad_4_6_meses_total_piezas'      => 'required',
            ];
        
            $validation_eror_messages = [
                'config_captura_id.required' => 'El campo es requerido',
                //'fecha_inicio.required' => 'El campo es requerido',
                //'fecha_fin.required' => 'El campo es requerido',
                'claves_medicamentos_catalogo.required' => 'El campo es requerido',
                'claves_medicamentos_existentes.required' => 'El campo es requerido',
                'claves_material_curacion_catalogo.required' => 'El campo es requerido',
                'claves_material_curacion_existentes.required' => 'El campo es requerido',
                'recetas_recibidas.required' => 'El campo es requerido',
                'recetas_surtidas.required' => 'El campo es requerido',
                'colectivos_recibidos.required' => 'El campo es requerido',
                'colectivos_surtidos.required' => 'El campo es requerido',
                'caducidad_3_meses_total_claves.required' => 'El campo es requerido',
                'caducidad_3_meses_total_piezas.required' => 'El campo es requerido',
                'caducidad_4_6_meses_total_claves.required' => 'El campo es requerido',
                'caducidad_4_6_meses_total_piezas.required' => 'El campo es requerido',
            ];

            $parametros = $request->all();
            //$parametros['fecha_inicio'] = $parametros['rango_fechas']['fecha_inicio'];
            //$parametros['fecha_fin'] = $parametros['rango_fechas']['fecha_fin'];
            
            $resultado = Validator::make($parametros,$validation_rules,$validation_eror_messages);

            if($resultado->passes()){
                DB::beginTransaction();
                
                $parametros['unidad_medica_id'] = $loggedUser->unidad_medica_asignada_id;

                $parametros['claves_medicamentos_porcentaje'] = round((($parametros['claves_medicamentos_existentes']/$parametros['claves_medicamentos_catalogo'])*100),2);

                $parametros['claves_material_curacion_porcentaje'] = round((($parametros['claves_material_curacion_existentes']/$parametros['claves_material_curacion_catalogo'])*100),2);

                $total_claves_catalogo = $parametros['claves_medicamentos_catalogo'] + $parametros['claves_material_curacion_catalogo'];
                $total_claves_existentes = $parametros['claves_medicamentos_existentes'] + $parametros['claves_material_curacion_existentes'];

                $parametros['total_claves_catalogo'] = $total_claves_catalogo;
                $parametros['total_claves_existentes'] = $total_claves_existentes;
                $parametros['total_claves_porcentaje'] = round((($total_claves_existentes/$total_claves_catalogo)*100),2);

                if($parametros['recetas_recibidas'] > 0){
                    $parametros['recetas_porcentaje'] = round((($parametros['recetas_surtidas']/$parametros['recetas_recibidas'])*100),2);
                }else{
                    $parametros['recetas_porcentaje'] = 0;
                }
                
                if($parametros['colectivos_recibidos'] > 0){
                    $parametros['colectivos_porcentaje'] = round((($parametros['colectivos_surtidos']/$parametros['colectivos_recibidos'])*100),2);
                }else{
                    $parametros['colectivos_porcentaje'] = 0;
                }
                
                $parametros['usuario_captura_id'] = $loggedUser->id;

                $config_captura = ConfigCapturaAbastoSurtimiento::find($parametros['config_captura_id']);

                if($config_captura){
                    $captura_anterior = CorteReporteAbastoSurtimiento::where('usuario_captura_id',$loggedUser->id)
                                                                    ->where('unidad_medica_id',$loggedUser->unidad_medica_asignada_id)
                                                                    ->where('config_captura_id',$config_captura->id)->first();

                    if($captura_anterior){
                        DB::rollback();
                        return response()->json(['message'=>'Ya existe un registro capturado para la semana seleccionada'], HttpResponse::HTTP_CONFLICT);
                    }

                    $parametros['fecha_inicio'] = $config_captura->fecha_inicio;
                    $parametros['fecha_fin'] = $config_captura->fecha_fin;
                    $registro = CorteReporteAbastoSurtimiento::create($parametros);
                }else{
                    DB::rollback();
                    return response()->json(['message'=>'Error en Control de Captura'], HttpResponse::HTTP_CONFLICT);
                }
                

                if($registro){
                    DB::commit();
                    return response()->json(['data'=>$registro], HttpResponse::HTTP_OK);
                }else{
                    DB::rollback();
                    return response()->json(['message'=>'No se pudo crear el Registro'], HttpResponse::HTTP_CONFLICT);
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
    public function update(Request $request, $id)
    {
        try{
            $loggedUser = auth()->userOrFail();

            $validation_rules = [
                'config_captura_id'                     => 'required',
                //'fecha_inicio'  => 'required',
                //'fecha_fin'  => 'required',
                'claves_medicamentos_catalogo'  => 'required',
                'claves_medicamentos_existentes'  => 'required',
                'claves_material_curacion_catalogo'  => 'required',
                'claves_material_curacion_existentes'  => 'required',
                'recetas_recibidas'  => 'required',
                'recetas_surtidas'  => 'required',
                'colectivos_recibidos'  => 'required',
                'colectivos_surtidos'  => 'required',
                'caducidad_3_meses_total_claves'  => 'required',
                'caducidad_3_meses_total_piezas'  => 'required',
                'caducidad_4_6_meses_total_claves'  => 'required',
                'caducidad_4_6_meses_total_piezas'  => 'required',
            ];
        
            $validation_eror_messages = [
                'config_captura_id.required' => 'El campo es requerido',
                //'fecha_inicio.required' => 'El campo es requerido',
                //'fecha_fin.required' => 'El campo es requerido',
                'claves_medicamentos_catalogo.required' => 'El campo es requerido',
                'claves_medicamentos_existentes.required' => 'El campo es requerido',
                'claves_material_curacion_catalogo.required' => 'El campo es requerido',
                'claves_material_curacion_existentes.required' => 'El campo es requerido',
                'recetas_recibidas.required' => 'El campo es requerido',
                'recetas_surtidas.required' => 'El campo es requerido',
                'colectivos_recibidos.required' => 'El campo es requerido',
                'colectivos_surtidos.required' => 'El campo es requerido',
                'caducidad_3_meses_total_claves.required' => 'El campo es requerido',
                'caducidad_3_meses_total_piezas.required' => 'El campo es requerido',
                'caducidad_4_6_meses_total_claves.required' => 'El campo es requerido',
                'caducidad_4_6_meses_total_piezas.required' => 'El campo es requerido',
            ];

            $parametros = $request->all();
            //$parametros['fecha_inicio'] = $parametros['rango_fechas']['fecha_inicio'];
            //$parametros['fecha_fin'] = $parametros['rango_fechas']['fecha_fin'];
            
            $resultado = Validator::make($parametros,$validation_rules,$validation_eror_messages);

            if($resultado->passes()){
                DB::beginTransaction();
                
                $parametros['unidad_medica_id'] = $loggedUser->unidad_medica_asignada_id;

                $parametros['claves_medicamentos_porcentaje'] = round((($parametros['claves_medicamentos_existentes']/$parametros['claves_medicamentos_catalogo'])*100),2);
                $parametros['claves_material_curacion_porcentaje'] = round((($parametros['claves_material_curacion_existentes']/$parametros['claves_material_curacion_catalogo'])*100),2);

                $total_claves_catalogo = $parametros['claves_medicamentos_catalogo'] + $parametros['claves_material_curacion_catalogo'];
                $total_claves_existentes = $parametros['claves_medicamentos_existentes'] + $parametros['claves_material_curacion_existentes'];

                $parametros['total_claves_catalogo'] = $total_claves_catalogo;
                $parametros['total_claves_existentes'] = $total_claves_existentes;
                $parametros['total_claves_porcentaje'] = round((($total_claves_existentes/$total_claves_catalogo)*100),2);

                if($parametros['recetas_recibidas'] > 0){
                    $parametros['recetas_porcentaje'] = round((($parametros['recetas_surtidas']/$parametros['recetas_recibidas'])*100),2);
                }else{
                    $parametros['recetas_porcentaje'] = 0;
                }
                
                if($parametros['colectivos_recibidos'] > 0){
                    $parametros['colectivos_porcentaje'] = round((($parametros['colectivos_surtidos']/$parametros['colectivos_recibidos'])*100),2);
                }else{
                    $parametros['colectivos_porcentaje'] = 0;
                }

                $parametros['usuario_captura_id'] = $loggedUser->id;

                $config_captura = ConfigCapturaAbastoSurtimiento::find($parametros['config_captura_id']);

                if(!$config_captura){
                    DB::rollback();
                    return response()->json(['message'=>'Control de captura no encontrado'], HttpResponse::HTTP_CONFLICT);
                }elseif(!$config_captura->activo){
                    DB::rollback();
                    return response()->json(['message'=>'Solo se pueden editar registros de semanas activas'], HttpResponse::HTTP_CONFLICT);
                }

                $registro = CorteReporteAbastoSurtimiento::find($id);

                if(!$registro){
                    throw new \Exception("Registro no encontrado", 1);
                }
    
                if($loggedUser->unidad_medica_asignada_id && $loggedUser->unidad_medica_asignada_id != $registro->unidad_medica_id){
                    throw new \Exception("El usuario no tiene acceso a este registro", 1);
                }

                $registro->update($parametros);

                if($registro->save()){
                    DB::commit();
                    return response()->json(['data'=>$registro], HttpResponse::HTTP_OK);
                }else{
                    DB::rollback();
                    return response()->json(['message'=>'No se pudo crear el Registro'], HttpResponse::HTTP_CONFLICT);
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
    public function destroy($id)
    {
        try{
            $loggedUser = auth()->userOrFail();
            $registro = CorteReporteAbastoSurtimiento::find($id);

            if(!$registro){
                throw new  \Exception("Registro no encontrado", 1);
            }

            if($loggedUser->unidad_medica_asignada_id && $loggedUser->unidad_medica_asignada_id != $registro->unidad_medica_id){
                throw new \Exception("El usuario no tiene acceso a este registro", 1);
            }

            $config_captura = ConfigCapturaAbastoSurtimiento::find($registro->config_captura_id);

            if(!$config_captura){
                return response()->json(['message'=>'Control de captura no encontrado'], HttpResponse::HTTP_CONFLICT);
            }elseif(!$config_captura->activo){
                return response()->json(['message'=>'Solo se pueden eliminar registros de semanas activas'], HttpResponse::HTTP_CONFLICT);
            }

            $registro->delete();

            return response()->json(['data'=>'Registro eliminado'],HttpResponse::HTTP_OK);
        }catch(\Exception $e){
            return response()->json(['error'=>['message'=>$e->getMessage(),'line'=>$e->getLine()]], HttpResponse::HTTP_CONFLICT);
        }
    }

    public function exportAdminExcel(Request $request){
        ini_set('memory_limit', '-1');

        try{
            $loggedUser = auth()->userOrFail();
            $parametros = $request->all();

            $loggedUser->load(['grupos'=>function($grupos){
                $grupos->whereRaw('clave_tipo_grupo = "ABYSU"');
            }]);

            $lista_unidades_id = [];
            foreach ($loggedUser->grupos as $grupo) {
                $lista_unidades = $grupo->unidadesMedicas->pluck('id')->all();
                $lista_unidades_id = array_merge($lista_unidades_id,$lista_unidades);
            }

            if(count($lista_unidades_id)){
                if(isset($parametros['fecha_inicio']) && $parametros['fecha_inicio']){
                    $max_fecha_subquery = DB::table('corte_reporte_abasto_surtimiento')->select('id', 'unidad_medica_id', 'fecha_fin')
                                            ->where(function ($where) use($parametros){
                                                $where->where('corte_reporte_abasto_surtimiento.fecha_inicio',$parametros['fecha_inicio'])
                                                    ->where('corte_reporte_abasto_surtimiento.fecha_fin',$parametros['fecha_fin']);
                                            })
                                            ->whereNULL('deleted_at')->groupBy('unidad_medica_id');
                }else{
                    $max_fecha_subquery = DB::table('corte_reporte_abasto_surtimiento')->select('id', 'unidad_medica_id', DB::raw('MAX(fecha_fin) as fecha_fin'))
                                            ->whereNULL('deleted_at')->groupBy('unidad_medica_id');
                }
                //$max_fecha_subquery = DB::table('corte_reporte_abasto_surtimiento')->select('id', 'unidad_medica_id', DB::raw('MAX(fecha_fin) as fecha_fin'))->whereNULL('deleted_at')->groupBy('unidad_medica_id');

                $registros = CorteReporteAbastoSurtimiento::select('catalogo_unidades_medicas.clues as CLUES', 'catalogo_unidades_medicas.nombre as Unidad Medica',
                                                            'corte_reporte_abasto_surtimiento.fecha_inicio as Fecha Inicio', 'corte_reporte_abasto_surtimiento.fecha_fin as Fecha Fin',
                                                            'corte_reporte_abasto_surtimiento.claves_medicamentos_catalogo as Medicamentos Catalogo','corte_reporte_abasto_surtimiento.claves_medicamentos_existentes as Medicamentos Existentes','corte_reporte_abasto_surtimiento.claves_medicamentos_porcentaje as Medicamentos Porcentaje',
                                                            'corte_reporte_abasto_surtimiento.claves_material_curacion_catalogo as Mat. Curacion Catalogo','corte_reporte_abasto_surtimiento.claves_material_curacion_existentes as Mat. Curacion Existentes','corte_reporte_abasto_surtimiento.claves_material_curacion_porcentaje as Mat. Curacion Porcentaje',
                                                            'corte_reporte_abasto_surtimiento.total_claves_catalogo as Total Claves Catalogo','corte_reporte_abasto_surtimiento.total_claves_existentes as Total Claves Existentes','corte_reporte_abasto_surtimiento.total_claves_porcentaje as Total Claves Porcentaje',
                                                            'corte_reporte_abasto_surtimiento.recetas_recibidas as Total Recetas Recibidas','corte_reporte_abasto_surtimiento.recetas_surtidas as Total Recetas Surtidas','corte_reporte_abasto_surtimiento.recetas_porcentaje as Recetas Porcentaje',
                                                            'corte_reporte_abasto_surtimiento.colectivos_recibidos as Total Colectivos Recibidos','corte_reporte_abasto_surtimiento.colectivos_surtidos as Total Colectivos Surtidos','corte_reporte_abasto_surtimiento.colectivos_porcentaje as Colectivos Porcentaje',
                                                            'corte_reporte_abasto_surtimiento.caducidad_3_meses_total_claves as Claves con Caducidad Menor a 3 Meses','corte_reporte_abasto_surtimiento.caducidad_3_meses_total_piezas as Piezas con Caducidad Menor a 3 Meses',
                                                            'corte_reporte_abasto_surtimiento.caducidad_4_6_meses_total_claves as Claves con Caducidad de 4 - 6 Meses','corte_reporte_abasto_surtimiento.caducidad_4_6_meses_total_piezas as Piezas con Caducidad de 4 - 6 Meses')
                                                        ->joinSub($max_fecha_subquery,'b',function($join){
                                                            $join->on('corte_reporte_abasto_surtimiento.unidad_medica_id','=','b.unidad_medica_id')->on('corte_reporte_abasto_surtimiento.fecha_fin','=','b.fecha_fin');
                                                        })
                                                        ->rightJoin('catalogo_unidades_medicas',function($join){
                                                            $join->on('corte_reporte_abasto_surtimiento.unidad_medica_id','=','catalogo_unidades_medicas.id');
                                                        })
                                                        ->whereIn('catalogo_unidades_medicas.id',$lista_unidades_id)
                                                        ->orderBy('corte_reporte_abasto_surtimiento.fecha_fin','DESC')
                                                        ->groupBy('catalogo_unidades_medicas.id')->get();

                $columnas = array_keys(collect($registros[0])->toArray());

                $filename = 'Reporte-Semanal-Abasto-Y-Surtimiento';
                
                return (new DevReportExport($registros,$columnas))->download($filename.'.xlsx'); //Excel::XLSX, ['Access-Control-Allow-Origin'=>'*','Access-Control-Allow-Methods'=>'GET']
            }else{
                throw new \Exception("El usuario debe tener un grupo asignado con unidades medicas", 1);
            }
            
        }catch(\Exception $e){
            return response()->json(['error' => $e->getMessage(),'line'=>$e->getLine()], HttpResponse::HTTP_CONFLICT);
        }
    }

    public function descargarArchivo(Request $request){
        try{
            $loggedUser = auth()->userOrFail();

            $control_archivo = ControlSubidaArchivos::where('usuario_id',$loggedUser->id)->where('clave_solicitud','LISTA-MEDS-ACTIVOS')->first();
            
            if($control_archivo){
                return Storage::download($control_archivo->ruta);
            }else{
                throw new \Exception("No hay registro de archivo", 1);
            }
        }catch(\Exception $e){
            return response()->json(['message' => $e->getMessage(),'line' => $e->getLine()],400);
        }
    }

    public function subirListaMedicamentos(Request $request){
        $input = $request->all();
        $loggedUser = auth()->userOrFail();

        $messages = [
            "required"=> "required",
            "numeric"=> "numeric",
            "file"=>"file"
        ];

        $rules = [
            'archivo' => 'required|file',
        ];

        $validator = Validator::make($input, $rules, $messages);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ],409);
        }
        
        if($request->hasFile('archivo')){
            if($request->file('archivo')->isValid()){
                try{
                    $unidad_medica = UnidadMedica::find($loggedUser->unidad_medica_asignada_id);

                    $clues = 'SINCLUES';
                    if($unidad_medica){
                        $clues = $unidad_medica->clues;
                    }

                    $file = $request->archivo;

                    $extension = $file->extension();
                    $nombre_archivo = 'LISTA-MEDICAMENTOS-'.$clues.'-U'.$loggedUser->id;
                    $path = $file->storeAs('archivos/lista-medicamentos-activos',$nombre_archivo.'.'.$extension);
                    
                    $control_archivo = ControlSubidaArchivos::where('usuario_id',$loggedUser->id)->where('clave_solicitud','LISTA-MEDS-ACTIVOS')->first();

                    if($control_archivo){
                        if($control_archivo->ruta != $path){
                            Storage::delete($control_archivo->ruta);
                        }
                        
                        $control_archivo->update([
                            'usuario_id' => $loggedUser->id,
                            'clave_solicitud' => 'LISTA-MEDS-ACTIVOS',
                            'nombre_archivo' => $nombre_archivo,
                            'extension' => $extension,
                            'conteo' => $control_archivo->conteo + 1,
                            'ruta' => $path
                        ]);
                    }else{
                        $control_archivo = ControlSubidaArchivos::create([
                            'usuario_id' => $loggedUser->id,
                            'clave_solicitud' => 'LISTA-MEDS-ACTIVOS',
                            'nombre_archivo' => $nombre_archivo,
                            'extension' => $extension,
                            'conteo' => 0,
                            'ruta' => $path
                        ]);
                    }
                    return response()->json(['message' => "Archivo subido con éxito",'data'=>$control_archivo],200);
                }catch(\Exception $e){
                    return response()->json(['message' => $e->getMessage(),'line' => $e->getLine()],400);
                }
            }
        }
    }
}