<?php

namespace App\Http\Controllers\API\Auth;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Permission;

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

            $response = [
                ['titulo'=>''],
                /*{
                    titulo: 'Movimientos en Borrador:',
                    total: 4,
                    nivel_alerta:'low',
                    accion: 'ver - Entradas | Salidas'
                  },
                  {
                    titulo: 'Peticiones de Modificación:',
                    total: 6,
                    nivel_alerta:'medium',
                    accion: 'ver - Entradas | Salidas'
                  },
                  {
                    titulo: 'Conflictos en Recepciones:',
                    total: 3,
                    nivel_alerta:'medium',
                    accion: 'ver - Entradas con Conflicto'
                  },
                  {
                    titulo: 'Claves a Caducar:',
                    total: 3,
                    nivel_alerta:'high',
                    accion: 'ver - Entradas con Conflicto'
                  },
                  {
                    titulo: 'Claves Caducadas:',
                    total: 5,
                    nivel_alerta:'high',
                    accion: 'ver - Entradas con Conflicto'
                  }*/
            ];
            return response()->json($response);
        }catch(\Exception $e){
            return response()->json(['error'=>['message'=>$e->getMessage(),'line'=>$e->getLine()]], HttpResponse::HTTP_CONFLICT);
        }
    }
}
