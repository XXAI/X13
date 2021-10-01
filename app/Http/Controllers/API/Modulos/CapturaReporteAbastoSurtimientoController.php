<?php

namespace App\Http\Controllers\API\Modulos;

use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;

use App\Http\Controllers\Controller;

use Validator;
use DB;

use App\Exports\DevReportExport;

use App\Models\CorteReporteAbastoSurtimiento;
use App\Models\UnidadMedica;

class CapturaReporteAbastoSurtimientoController extends Controller
{
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
                    /*$registros = CorteReporteAbastoSurtimiento::select(DB::raw('MAX(fecha_fin) as max_fecha_fin'),'catalogo_unidades_medicas.clues','catalogo_unidades_medicas.nombre as nombre_unidad','corte_reporte_abasto_surtimiento.*')
                                                                ->leftjoin('catalogo_unidades_medicas',function($join)use($lista_unidades_id){
                                                                    $join->on('corte_reporte_abasto_surtimiento.unidad_medica_id','=','catalogo_unidades_medicas.id')
                                                                        ->whereIn('catalogo_unidades_medicas.id',$lista_unidades_id);
                                                                })
                                                                ->groupBy('corte_reporte_abasto_surtimiento.unidad_medica_id')
                                                                ->orderBy('corte_reporte_abasto_surtimiento.fecha_fin','DESC')
                                                                ->orderBy('catalogo_unidades_medicas.nombre');*/

                    $registros = UnidadMedica::select('catalogo_unidades_medicas.clues','catalogo_unidades_medicas.nombre as nombre_unidad','corte_reporte_abasto_surtimiento.*',DB::raw('MAX(fecha_fin) as max_fecha_fin'),DB::raw('count(corte_reporte_abasto_surtimiento.id) as conteo'))
                                                ->leftjoin('corte_reporte_abasto_surtimiento',function($join){
                                                    $join->on('corte_reporte_abasto_surtimiento.unidad_medica_id','=','catalogo_unidades_medicas.id')
                                                            ->whereNull('corte_reporte_abasto_surtimiento.deleted_at');
                                                })
                                                ->whereIn('catalogo_unidades_medicas.id',$lista_unidades_id)
                                                ->groupBy('catalogo_unidades_medicas.id')
                                                ->orderBy('corte_reporte_abasto_surtimiento.fecha_fin','DESC')
                                                ->orderBy('catalogo_unidades_medicas.nombre');
                }else{
                    throw new Exception("El usuario debe tener un grupo asignado con unidades medicas", 1);
                    
                }

                //$registros = $registros->select('*',DB::raw('MAX(fecha_fin) as max_fecha_fin'))->with('unidadMedica')->groupBy('unidad_medica_id');
            }else{
                $registros = CorteReporteAbastoSurtimiento::where('unidad_medica_id',$loggedUser->unidad_medica_asignada_id)->orderBy('fecha_inicio','DESC');
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
                throw new Exception("Registro no encontrado", 1);
            }

            if($loggedUser->unidad_medica_asignada_id && $loggedUser->unidad_medica_asignada_id != $registro->unidad_medica_id){
                throw new Exception("El usuario no tiene acceso a este registro", 1);
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
                'fecha_inicio.required' => 'El campo es requerido',
                'fecha_fin.required' => 'El campo es requerido',
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
            $parametros['fecha_inicio'] = $parametros['rango_fechas']['fecha_inicio'];
            $parametros['fecha_fin'] = $parametros['rango_fechas']['fecha_fin'];
            
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

                $registro = CorteReporteAbastoSurtimiento::create($parametros);

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
    public function update(Request $request, $id)
    {
        try{
            $loggedUser = auth()->userOrFail();

            $validation_rules = [
                'fecha_inicio'  => 'required',
                'fecha_fin'  => 'required',
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
                'fecha_inicio.required' => 'El campo es requerido',
                'fecha_fin.required' => 'El campo es requerido',
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
            $parametros['fecha_inicio'] = $parametros['rango_fechas']['fecha_inicio'];
            $parametros['fecha_fin'] = $parametros['rango_fechas']['fecha_fin'];
            
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

                $registro = CorteReporteAbastoSurtimiento::find($id);

                if(!$registro){
                    throw new Exception("Registro no encontrado", 1);
                }
    
                if($loggedUser->unidad_medica_asignada_id && $loggedUser->unidad_medica_asignada_id != $registro->unidad_medica_id){
                    throw new Exception("El usuario no tiene acceso a este registro", 1);
                }

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
    public function destroy($id)
    {
        try{
            $loggedUser = auth()->userOrFail();
            $registro = CorteReporteAbastoSurtimiento::find($id);

            if(!$registro){
                throw new Exception("Registro no encontrado", 1);
            }

            if($loggedUser->unidad_medica_asignada_id && $loggedUser->unidad_medica_asignada_id != $registro->unidad_medica_id){
                throw new Exception("El usuario no tiene acceso a este registro", 1);
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
            $registros = CorteReporteAbastoSurtimiento::select('catalogo_unidades_medicas.nombre as Unidad Medica','fecha_inicio as Fecha Inicio',DB::raw('MAX(fecha_fin) as "Fecha Fin"'),
                                                            'claves_medicamentos_catalogo as Medicamentos Catalogo','claves_medicamentos_existentes as Medicamentos Existentes','claves_medicamentos_porcentaje as Medicamentos Porcentaje',
                                                            'claves_material_curacion_catalogo as Mat. Curacion Catalogo','claves_material_curacion_existentes as Mat. Curacion Existentes','claves_material_curacion_porcentaje as Mat. Curacion Porcentaje',
                                                            'total_claves_catalogo as Total Claves Catalogo','total_claves_existentes as Total Claves Existentes','total_claves_porcentaje as Total Claves Porcentaje',
                                                            'recetas_recibidas as Total Recetas Recibidas','recetas_surtidas as Total Recetas Surtidas','recetas_porcentaje as Recetas Porcentaje',
                                                            'colectivos_recibidos as Total Colectivos Recibidos','colectivos_surtidos as Total Colectivos Surtidos','colectivos_porcentaje as Colectivos Porcentaje',
                                                            'caducidad_3_meses_total_claves as Claves con Caducidad Menor a 3 Meses','caducidad_3_meses_total_piezas as Piezas con Caducidad Menor a 3 Meses',
                                                            'caducidad_4_6_meses_total_claves as Claves con Caducidad de 4 - 6 Meses','caducidad_4_6_meses_total_piezas as Piezas con Caducidad de 4 - 6 Meses')
                                                        ->leftjoin('catalogo_unidades_medicas','catalogo_unidades_medicas.id','=','corte_reporte_abasto_surtimiento.unidad_medica_id')
                                                        ->orderBy('catalogo_unidades_medicas.nombre')
                                                        ->groupBy('corte_reporte_abasto_surtimiento.unidad_medica_id')->get();

            $columnas = array_keys(collect($registros[0])->toArray());

            $filename = 'Reporte-Semanal-Abasto-Y-Surtimiento';
            
            return (new DevReportExport($registros,$columnas))->download($filename.'.xlsx'); //Excel::XLSX, ['Access-Control-Allow-Origin'=>'*','Access-Control-Allow-Methods'=>'GET']
        }catch(\Exception $e){
            return response()->json(['error' => $e->getMessage(),'line'=>$e->getLine()], HttpResponse::HTTP_CONFLICT);
        }
    }
}