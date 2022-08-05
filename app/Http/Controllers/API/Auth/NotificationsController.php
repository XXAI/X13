<?php

namespace App\Http\Controllers\API\Auth;

use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;

use App\Http\Controllers\Controller;

use App\Models\User;
use App\Models\Permission;
use App\Models\Movimiento;
use App\Models\MovimientoModificacion;
use App\Models\Almacen;
use App\Models\TipoMovimiento;
use App\Models\Stock;

use DB;

class NotificationsController extends Controller{

    /**
     * Get the token array structure.
     *
     * @param  string $token
     *
     * @return \Illuminate\Http\JsonResponse
     */
    protected function userNotifications(Request $request){
        try{
            $fecha_hoy = date("Y-m-d");
            $loggedUser = auth()->userOrFail();
            $nivel_alerta = 0;
            $alerts = [];
            $total_alertas = 0;
            $permiso_entradas = false;
            $permiso_salidas = false;
            $permiso_existencia = false;
            
            if($this->authorize('has-permission','snyR2BzbSqXJHVQCgjnWqgseP0pqLnhe')){
              $permiso_entradas = true;
            }

            if($this->authorize('has-permission','q6iwrTdBPOSA7ivxWzs21oiEqtWSUVXb')){
              $permiso_salidas = true;
            }

            if($this->authorize('has-permission','zFdj3x3UfqRsp5DeAGBVm5elqvkvnIr1')){
              $permiso_existencia = true;
            }

            if($loggedUser->is_superuser){
              $almacenes = Almacen::where('unidad_medica_id',$loggedUser->unidad_medica_asignada_id)->get()->pluck('id');
            }else{
              $almacenes = $loggedUser->almacenes()->pluck('almacen_id');
            }

            if($permiso_existencia){
              /*$caducados = Stock::select('stocks.id')->whereIn('almacen_id',$almacenes)->whereRaw('fecha_caducidad < current_date()')
                              ->groupBy('stocks.bien_servicio_id')->groupBy('stocks.lote')->groupBy('stocks.fecha_caducidad')->count();
              if($caducados > 0){
                $alerts[] = [
                  'titulo' => 'Articulos Caducados:',
                  'total' => $caducados,
                  'nivel_alerta' => 'high',
                  'accion' => '/almacen/existencias',
                  'filtros' => ['caducidades'=>'expired']
                ];
                $nivel_alerta = 3;
                $total_alertas += $caducados;
              }*/

              /*$por_caducar = Stock::select('stocks.id')->where('unidad_medica_id',$loggedUser->unidad_medica_asignada_id)->whereIn('almacen_id',$almacenes)
                                ->where(DB::raw('TIMESTAMPDIFF(DAY, current_date(), stocks.fecha_caducidad)'),'<',90)->where(DB::raw('IF(stocks.fecha_caducidad < current_date(),1,0)'),'=',0)
                                ->groupBy('stocks.bien_servicio_id')->groupBy('stocks.lote')->groupBy('stocks.fecha_caducidad')
                                ->count();
              if($por_caducar > 0){
                $alerts[] = [
                  'titulo' => 'Articulos Próximos a Caducar:',
                  'total' => $por_caducar,
                  'nivel_alerta' => 'medium',
                  'accion' => '/almacen/existencias',
                  'filtros' => ['caducidades'=>'coming-soon']
                ];
                $nivel_alerta = 3;
                $total_alertas += $por_caducar;
              }*/
            }

            if($permiso_entradas || $permiso_salidas){
              //Obtener los movimientos con conflictos
              $conflictos = Movimiento::select(DB::raw('SUM(IF(direccion_movimiento = "ENT",1,0)) AS entradas'),DB::raw('SUM(IF(direccion_movimiento = "SAL",1,0)) AS salidas'))
                          ->where('unidad_medica_id',$loggedUser->unidad_medica_asignada_id)->whereIn('almacen_id',$almacenes)->where('estatus','CONF')->first();
              //
              if($conflictos){
                if($permiso_entradas && $conflictos->entradas > 0){
                  $alerts[] = [
                    'titulo' => 'Conflictos en Entradas:',
                    'total' => $conflictos->entradas,
                    'nivel_alerta' => 'high',
                    'accion' => '/almacen/entradas',
                    'filtros' => ['estatus'=>'CONF']
                  ];
                  $nivel_alerta = 3;
                  $total_alertas += $conflictos->entradas;
                }

                if($permiso_salidas && $conflictos->salidas > 0){
                  $alerts[] = [
                    'titulo' => 'Conflictos en Salidas:',
                    'total' => $conflictos->salidas,
                    'nivel_alerta' => 'high',
                    'accion' => '/almacen/salidas',
                    'filtros' => ['estatus'=>'CONF']
                  ];
                  $nivel_alerta = 3;
                  $total_alertas += $conflictos->salidas;
                }
              }

              if($this->authorize('has-permission','zSERUIFH40to0ATuFyWeA7KJ86xoZMGW')){
                $peticion_modificaciones = MovimientoModificacion::select(DB::raw('SUM(IF(movimientos.direccion_movimiento = "ENT",1,0)) AS entradas'),DB::raw('SUM(IF(movimientos.direccion_movimiento = "SAL",1,0)) AS salidas'))
                                                      ->leftJoin('movimientos','movimientos.id','=','movimientos_modificaciones.movimiento_id')
                                                      ->where('movimientos_modificaciones.estatus','SOL')
                                                      ->where('movimientos.unidad_medica_id',$loggedUser->unidad_medica_asignada_id)->whereIn('movimientos.almacen_id',$almacenes)
                                                      ->first();
                //
                if($peticion_modificaciones){
                  if($permiso_entradas && $peticion_modificaciones->entradas > 0){
                    $alerts[] = [
                      'titulo' => 'Peticiones de Modificación en Entradas:',
                      'total' => $peticion_modificaciones->entradas,
                      'nivel_alerta' => 'medium',
                      'accion' => '/almacen/entradas',
                      'filtros' => ['estatus'=>'SOL']
                    ];
                    $nivel_alerta = ($nivel_alerta < 2)?2:$nivel_alerta;
                    $total_alertas += $peticion_modificaciones->entradas;
                  }

                  if($permiso_salidas && $peticion_modificaciones->salidas > 0){
                    $alerts[] = [
                      'titulo' => 'Peticiones de Modificación en Salidas:',
                      'total' => $peticion_modificaciones->salidas,
                      'nivel_alerta' => 'medium',
                      'accion' => '/almacen/salidas',
                      'filtros' => ['estatus'=>'SOL']
                    ];
                    $nivel_alerta = ($nivel_alerta < 2)?2:$nivel_alerta;
                    $total_alertas += $peticion_modificaciones->salidas;
                  }
                }
              }

              $modificaciones_aprobadas = MovimientoModificacion::select(DB::raw('SUM(IF(movimientos.direccion_movimiento = "ENT",1,0)) AS entradas'),DB::raw('SUM(IF(movimientos.direccion_movimiento = "SAL",1,0)) AS salidas'))
                                                    ->leftJoin('movimientos','movimientos.id','=','movimientos_modificaciones.movimiento_id')
                                                    ->where('movimientos_modificaciones.estatus','MOD')
                                                    ->where('solicitado_usuario_id',$loggedUser->id)
                                                    ->first();
              //
              if($modificaciones_aprobadas){
                if($permiso_entradas && $modificaciones_aprobadas->entradas > 0){
                  $alerts[] = [
                    'titulo' => 'Modificaciones Aprobadas en Entradas:',
                    'total' => $modificaciones_aprobadas->entradas,
                    'nivel_alerta' => 'medium',
                    'accion' => '/almacen/entradas',
                    'filtros' => ['estatus'=>'MOD']
                  ];
                  $nivel_alerta = ($nivel_alerta < 2)?2:$nivel_alerta;
                  $total_alertas += $modificaciones_aprobadas->entradas;
                }

                if($permiso_salidas && $modificaciones_aprobadas->salidas > 0){
                  $alerts[] = [
                    'titulo' => 'Modificaciones Aprobadas en Salidas:',
                    'total' => $modificaciones_aprobadas->salidas,
                    'nivel_alerta' => 'medium',
                    'accion' => '/almacen/salidas',
                    'filtros' => ['estatus'=>'MOD']
                  ];
                  $nivel_alerta = ($nivel_alerta < 2)?2:$nivel_alerta;
                  $total_alertas += $modificaciones_aprobadas->salidas;
                }
              }

              //Obtener Los movimientos en pendientes de recepción
              $pendientes = Movimiento::select(DB::raw('SUM(IF(direccion_movimiento = "ENT",1,0)) AS entradas'),DB::raw('SUM(IF(direccion_movimiento = "SAL",1,0)) AS salidas'))
                          ->where('unidad_medica_id',$loggedUser->unidad_medica_asignada_id)->whereIn('almacen_id',$almacenes)->where('estatus','PERE')->first();
              //
              if($pendientes){
                if($permiso_entradas && $pendientes->entradas > 0){
                  $alerts[] = [
                    'titulo' => 'Entradas pendientes de Recibir:',
                    'total' => $pendientes->entradas,
                    'nivel_alerta' => 'medium',
                    'accion' => '/almacen/entradas',
                    'filtros' => ['estatus'=>'PERE']
                  ];
                  $nivel_alerta = ($nivel_alerta < 2)?2:$nivel_alerta;
                  $total_alertas += $pendientes->entradas;
                }

                if($permiso_salidas && $pendientes->salidas > 0){
                  $alerts[] = [
                    'titulo' => 'Salidas pendientes de Recibir:',
                    'total' => $pendientes->salidas,
                    'nivel_alerta' => 'medium',
                    'accion' => '/almacen/salidas',
                    'filtros' => ['estatus'=>'PERE']
                  ];
                  $nivel_alerta = ($nivel_alerta < 2)?2:$nivel_alerta;
                  $total_alertas += $pendientes->salidas;
                }
              }

              //Obtener Los movimientos en pendientes de recepción
              $tipo_movimiento = TipoMovimiento::where('clave','LMCN')->where('movimiento','SAL')->first();
              $transferencias_inconclusas = Movimiento::select('movimientos.id')
                          ->leftJoin('movimientos as M',function($join){
                            $join->on('M.movimiento_padre_id','=','movimientos.id');
                          })
                          ->where('movimientos.unidad_medica_id',$loggedUser->unidad_medica_asignada_id)->whereIn('movimientos.almacen_id',$almacenes)->where('movimientos.tipo_movimiento_id',$tipo_movimiento->id)
                          ->whereRaw('movimientos.estatus != M.estatus')
                          ->count();
              //
              if($transferencias_inconclusas){
                if($permiso_salidas && $transferencias_inconclusas > 0){
                  $alerts[] = [
                    'titulo' => 'Transferencias Inconclusas:',
                    'total' => $transferencias_inconclusas,
                    'nivel_alerta' => 'medium',
                    'accion' => '/almacen/salidas',
                    'filtros' => ['especiales'=>['transferencias_inconclusas' => true]]
                  ];
                  $nivel_alerta = ($nivel_alerta < 2)?2:$nivel_alerta;
                  $total_alertas += $transferencias_inconclusas;
                }
              }

              
              //Obtener Los movimientos en borrador
              $en_borrador = Movimiento::select(DB::raw('SUM(IF(direccion_movimiento = "ENT",1,0)) AS entradas'),DB::raw('SUM(IF(direccion_movimiento = "SAL",1,0)) AS salidas'))
                                        ->where('unidad_medica_id',$loggedUser->unidad_medica_asignada_id)->whereIn('almacen_id',$almacenes)->where('estatus','BOR')->first();
              //
              if($en_borrador){
                if($permiso_entradas && $en_borrador->entradas > 0){
                  $alerts[] = [
                    'titulo' => 'Entradas en Borrador:',
                    'total' => $en_borrador->entradas,
                    'nivel_alerta' => 'low',
                    'accion' => '/almacen/entradas',
                    'filtros' => ['estatus'=>'BOR']
                  ];
                  $nivel_alerta = ($nivel_alerta < 1)?1:$nivel_alerta;
                  $total_alertas += $en_borrador->entradas;
                }

                if($permiso_salidas && $en_borrador->salidas > 0){
                  $alerts[] = [
                    'titulo' => 'Salidas en Borrador:',
                    'total' => $en_borrador->salidas,
                    'nivel_alerta' => 'low',
                    'accion' => '/almacen/salidas',
                    'filtros' => ['estatus'=>'BOR']
                  ];
                  $nivel_alerta = ($nivel_alerta < 1)?1:$nivel_alerta;
                  $total_alertas += $en_borrador->salidas;
                }
              }
            }
            
            $return_data = ['alerts'=>$alerts, 'nivel'=>$nivel_alerta,'total'=>$total_alertas];
            return response()->json($return_data);
        }catch(\Exception $e){
            return response()->json(['error'=>['message'=>$e->getMessage(),'line'=>$e->getLine()]], HttpResponse::HTTP_CONFLICT);
        }
    }
}
 