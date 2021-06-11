<?php

namespace App\Http\Controllers\API\Modulos;

use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;

use App\Http\Controllers\Controller;

use App\Models\UnidadMedica;

class CatalogosController extends Controller
{
    public function getCatalogos(Request $request)
    {
        try{
            $params = $request->all();
            $catalogos = [];
            foreach ($params as $catalogo => $values) {
                switch ($catalogo) {
                    case 'unidades_medicas':
                        $datos = UnidadMedica::getModel();
                        break;
                    default:
                        $datos = false;
                        break;
                }

                if(!$datos){ break; }

                if($values){
                    if(isset($values['ordenar']) && $values['ordenar']){
                        $datos = $datos->orderBy($values['ordenar']);
                    }

                    if(isset($values['ordenar_desc']) && $values['ordenar_desc']){
                        $datos = $datos->orderBy($values['ordenar_desc'],'DESC');
                    }
                }

                $catalogos[$catalogo] = $datos->get();
            }

            return response()->json(['data'=>$catalogos],HttpResponse::HTTP_OK);
        }catch(\Exception $e){
            return response()->json(['error'=>['message'=>$e->getMessage(),'line'=>$e->getLine()]], HttpResponse::HTTP_CONFLICT);
        }
    }
}
