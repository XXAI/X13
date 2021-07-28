<?php

namespace App\Http\Controllers\API\Configuracion;

use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;

use Illuminate\Support\Facades\Hash;

use Validator;
use Illuminate\Validation\Rule;

use App\Http\Controllers\Controller;

use App\Models\TipoElementoPedido;
use App\Models\BienServicio;
use DB;

class TiposPedidosController extends Controller
{
    public function getCatalogos(Request $request){
        try{
            $cubs = BienServicio::select('cog_partidas_especificas.clave','cog_partidas_especificas.descripcion as partida_especifica','familias.nombre as familia','familias.id as familia_id')
                                    ->leftjoin('cog_partidas_especificas','cog_partidas_especificas.clave','=','bienes_servicios.clave_partida_especifica')
                                    ->leftjoin('familias','familias.id','=','bienes_servicios.familia_id')
                                    ->groupBy('bienes_servicios.clave_partida_especifica')
                                    ->groupBy('bienes_servicios.familia_id')
                                    ->get();
            //
            /*$agrupado = $cubs->mapToGroups(function ($item, $key) {
                return [$item['clave'] => $item];
            });*/
            $agrupado = [];
            foreach ($cubs as $item) {
                if(!isset($agrupado[$item->clave])){
                    $agrupado[$item->clave] = [
                        'clave' => $item->clave,
                        'descripcion' => $item->partida_especifica,
                        'familias' => []
                    ];
                }
                $agrupado[$item->clave]['familias'][] = ['clave'=>$item->clave,'id'=>$item->familia_id, 'nombre'=>$item->familia];
            }

            return response()->json(['data'=>array_values($agrupado)],HttpResponse::HTTP_OK);
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
        /*if (\Gate::denies('has-permission', \Permissions::VER_ROL) && \Gate::denies('has-permission', \Permissions::SELECCIONAR_ROL)){
            return response()->json(['message'=>'No esta autorizado para ver este contenido'],HttpResponse::HTTP_FORBIDDEN);
        }*/
        
        try{
            $parametros = $request->all();
            $tipos_pedidos = TipoElementoPedido::getModel();
            //Filtros, busquedas, ordenamiento
            if(isset($parametros['query']) && $parametros['query']){
                $tipos_pedidos = $tipos_pedidos->where(function($query)use($parametros){
                    return $query->where('descripcion','LIKE','%'.$parametros['query'].'%');
                });
            }

            if(isset($parametros['page'])){
                $resultadosPorPagina = isset($parametros["per_page"])? $parametros["per_page"] : 20;
    
                $tipos_pedidos = $tipos_pedidos->paginate($resultadosPorPagina);
            } else {
                $tipos_pedidos = $tipos_pedidos->get();
            }

            return response()->json(['data'=>$tipos_pedidos],HttpResponse::HTTP_OK);
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
        //$this->authorize('has-permission',\Permissions::CREAR_ROL);
        try{
            $validation_rules = [
                'clave'             => 'required|unique:App\Models\TipoElementoPedido,clave,NULL,id,deleted_at,NULL',
                'descripcion'       => 'required|unique:App\Models\TipoElementoPedido,descripcion,NULL,id,deleted_at,NULL',
                'archivo_fuente'    => 'required',
                'filtro_familias'   => 'required',
            ];
        
            $validation_eror_messages = [
                'required'  => 'Este campo es requerido',
                'unique'    => 'Este campo debe ser único'
            ];

            $parametros = $request->all();

            $resultado = Validator::make($parametros,$validation_rules,$validation_eror_messages);

            if($resultado->passes()){
                DB::beginTransaction();

                //Creando la imagen
                $image = $parametros['archivo_fuente'];  // your base64 encoded
                $image = str_replace('data:image/svg+xml;base64,', '', $image);
                $image = str_replace(' ', '+', $image);
                $image_name = $parametros['clave'].'-ICON.svg';
                \File::put(storage_path(). '/app/public/tipo-elementos-pedido/' . $image_name, base64_decode($image));

                $parametros['icon_image'] = 'tipo-elementos-pedido/'.$image_name;
                $parametros['llave_tabla_detalles'] = 'sin-detalles';
                $parametros['filtro_detalles'] = json_encode(array_values($parametros['filtro_familias']));

                $tipo_pedido = TipoElementoPedido::create($parametros);

                if($tipo_pedido->save()){
                    DB::commit();
                    return response()->json(['data'=>$tipo_pedido], HttpResponse::HTTP_OK);
                }else{
                    DB::rollback();
                    return response()->json(['error'=>'No se pudo crear el Tipo de Pedido'], HttpResponse::HTTP_CONFLICT);
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
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id){
        //$this->authorize('has-permission',\Permissions::VER_ROL);
        try{
            $tipo_pedido = TipoElementoPedido::find($id);
            
            return response()->json(['data'=>$tipo_pedido],HttpResponse::HTTP_OK);
        }catch(\Exception $e){
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
        //$this->authorize('has-permission',\Permissions::EDITAR_ROL);
        try{
            $tipo_elementos = TipoElementoPedido::find($id);

            $validation_rules = [
                'clave'             => ['required',Rule::unique('tipos_elementos_pedidos','clave')->ignore($tipo_elementos->id)->where(function($query){ return $query->whereNull('deleted_at'); })],
                'descripcion'       => ['required',Rule::unique('tipos_elementos_pedidos','descripcion')->ignore($tipo_elementos->id)->where(function($query){ return $query->whereNull('deleted_at'); })],
                //'archivo_fuente'    => 'required',
                'filtro_familias'   => 'required',
            ];
        
            $validation_eror_messages = [
                'required'  => 'Este campo es requerido',
                'unique'    => 'Este campo debe ser único',
            ];
            
            $parametros = $request->all();

            $resultado = Validator::make($parametros,$validation_rules,$validation_eror_messages);

            if($resultado->passes()){
                DB::beginTransaction();

                if($parametros['archivo_fuente']){
                    $image = $parametros['archivo_fuente'];  // your base64 encoded
                    $image = str_replace('data:image/svg+xml;base64,', '', $image);
                    $image = str_replace(' ', '+', $image);
                    $image_name = $parametros['clave'].'-ICON.svg';
                    \File::put(storage_path(). '/app/public/tipo-elementos-pedido/' . $image_name, base64_decode($image));

                    $parametros['icon_image'] = 'tipo-elementos-pedido/'.$image_name;
                }

                $parametros['llave_tabla_detalles'] = 'sin-detalles';
                $parametros['filtro_detalles'] = json_encode(array_values($parametros['filtro_familias']));
                
                if($tipo_elementos->icon_image != $parametros['icon_image']){
                    //Delete old image
                    \File::delete(storage_path(). '/app/public/' . $tipo_elementos->icon_image);
                }

                if($tipo_elementos->update($parametros)){
                    DB::commit();
                    return response()->json(['data'=>$tipo_elementos], HttpResponse::HTTP_OK);
                }else{
                    DB::rollback();
                    return response()->json(['error'=>'No se pudo guardar el Tipo de Pedido'], HttpResponse::HTTP_CONFLICT);
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
    public function destroy($id){
        //$this->authorize('has-permission',\Permissions::ELIMINAR_ROL);
        try{
            $tipo_elementos = TipoElementoPedido::find($id);
            $tipo_elementos->delete();

            return response()->json(['data'=>'Tipo de Pedido eliminado'], HttpResponse::HTTP_OK);
        }catch(\Exception $e){
            return response()->json(['error'=>['message'=>$e->getMessage(),'line'=>$e->getLine()]], HttpResponse::HTTP_CONFLICT);
        }
    }
}
