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
                                                        ->orderBy('no_semana','DESC')->orderBy('fecha_fin','DESC')
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