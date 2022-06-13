<?php

namespace App\Http\Controllers\API\AdminCatalogos;

use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;

use App\Http\Controllers\Controller;

use App\Http\Requests;

use DB;

use App\Models\Proveedor;
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
                ['id'=>1,    'label'=>'Proveedores',                'value'=>'proveedores'], 
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
                'proveedores'                      =>  Proveedor::getModel(),
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

            $formulario = [];
            switch ($parametros['catalogo']) {
                case 'proveedores':
                    $formulario = [ 'nombre'=>['type'=>'text', 'required'=>true], 
                                    'rfc'=>['type'=>'text', 'required'=>true]
                                ];
                    break;
                case 'catalogo_marcas':
                    $formulario = [ 'nombre'=>['type'=>'text', 'required'=>true]];
                    break;
                case 'catalogo_tipos_bien_servicio':
                    $formulario = [ 'clave'=>['type'=>'text', 'required'=>true], 
                                    'descripcion'=>['type'=>'text', 'required'=>true], 
                                    'clave_form'=>['type'=>'text', 'required'=>true]
                                ];
                    break;
                case 'catalogo_tipos_movimiento':
                    $formulario = [ 'clave'=>['type'=>'text', 'required'=>true], 
                                    'descripcion'=>['type'=>'text', 'required'=>true], 
                                    'movimiento'=>['type'=>'text', 'required'=>true], 
                                    'captura_independiente'=>['type'=>'boolean', 'required'=>false], 
                                    'acepta_ceros'=>['type'=>'boolean', 'required'=>false]
                                ];
                    break;
                case 'catalogo_unidades_medida':
                    $formulario = [ 'pieza'=>['type'=>'text', 'required'=>true], 
                                    'descripcion'=>['type'=>'text', 'required'=>true]
                                ];
                    break;
                case 'catalogo_distritos':
                case 'catalogo_solicitudes_tipos_uso':
                case 'catalogo_tipos_almacen':
                case 'catalogo_tipos_solicitud':
                    $formulario = [ 'clave'=>['type'=>'text', 'required'=>true], 
                                    'descripcion'=>['type'=>'text', 'required'=>true]
                                ];
                    break;
                default:
                    $formulario = [ 'descripcion'=>['type'=>'text', 'required'=>true]];
                    break;
            }
            //Filtros, busquedas, ordenamiento
            if(isset($parametros['query']) && $parametros['query']){
                $a_buscar = array_keys($formulario);
                $catalogo_registros = $catalogo_registros->where(function($query)use($parametros,$a_buscar){
                    $query = $query->where($a_buscar[0],'LIKE','%'.$parametros['query'].'%');
                    if(count($a_buscar) > 1){
                        for($i = 1; $i < count($a_buscar); $i++){
                            $query = $query->orWhere($a_buscar[$i],'LIKE','%'.$parametros['query'].'%');
                        }
                    }
                    return $query;
                });
            }

            if(isset($parametros['page'])){
                $resultadosPorPagina = isset($parametros["per_page"])? $parametros["per_page"] : 20;
                $catalogo_registros = $catalogo_registros->paginate($resultadosPorPagina);
            } else {
                $catalogo_registros = $catalogo_registros->get();
            }

            return response()->json(['data'=>$catalogo_registros,'columnas'=>$columnas,'formulario'=>$formulario],HttpResponse::HTTP_OK);
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
            $return_data = [];
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
            /*$reglas = [
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
            
            $v = Validator::make($parametros, $reglas, $mensajes);
            
            if ($v->fails()) {
                return response()->json(['error'=>'Datos de formulario incorrectors','data'=>$v->errors()],HttpResponse::HTTP_OK);
            }*/

            $catalogos = [
                'proveedores'                      =>  Proveedor::getModel(),
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

            $loggedUser = auth()->userOrFail();
            $parametros = $request->all();
            $formulario = $parametros['form_value'];

            $catalogo = $catalogos[$parametros['catalogo']];

            if(isset($formulario['id']) && $formulario['id']){
                $registro = $catalogo->find($formulario['id']);
                if(!$registro){
                    return response()->json(['error'=>'No se encontro el registro guardado'],HttpResponse::HTTP_OK);
                }
                $registro->update($formulario);
            }else{
                $registro = $catalogo->create($formulario);
            }
            
            return response()->json(['data'=>$registro],HttpResponse::HTTP_OK);
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
    public function destroy(Request $request,$id){
        //$this->authorize('has-permission',\Permissions::ELIMINAR_ROL);
        try{
            $catalogos = [
                'proveedores'                      =>  Proveedor::getModel(),
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

            $loggedUser = auth()->userOrFail();
            $parametros = $request->all();
            $catalogo = $catalogos[$parametros['catalogo']];

            $registro = $catalogo->find($id);
            $registro->delete();

            return response()->json(['data'=>'Registro eliminado'], HttpResponse::HTTP_OK);
        }catch(\Exception $e){
            return response()->json(['error'=>['message'=>$e->getMessage(),'line'=>$e->getLine()]], HttpResponse::HTTP_CONFLICT);
        }
    }
}
