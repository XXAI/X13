<?php

namespace App\Http\Controllers\API\Modulos;

use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;

use App\Http\Controllers\Controller;

use Validator;
use DB;

use App\Models\CorteReporteAbastoSurtimiento;

class CapturaReporteAbastoSurtimientoController extends Controller
{
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

            $registros = CorteReporteAbastoSurtimiento::getModel();

            if($loggedUser->unidad_medica_asignada_id){
                $registros = $registros->where('unidad_medica_id',$loggedUser->unidad_medica_asignada_id);
            }

            //Filtros, busquedas, ordenamiento
            /*if(isset($parametros['query']) && $parametros['query']){
                $entradas = $entradas->where(function($query)use($parametros){
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

                $arametros['total_claves_catalogo'] = $total_claves_catalogo;
                $arametros['total_claves_existentes'] = $total_claves_existentes;
                $arametros['total_claves_porcentaje'] = round((($total_claves_existentes/$total_claves_catalogo)*100),2);

                $parametros['recetas_porcentaje'] = round((($parametros['recetas_surtidas']/$parametros['recetas_recibidas'])*100),2);
                $parametros['colectivos_porcentaje'] = round((($parametros['colectivos_surtidos']/$parametros['colectivos_recibidos'])*100),2);

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
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        //
    }
}
