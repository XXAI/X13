<?php

namespace App\Http\Controllers\API\Modulos;

use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;

use App\Http\Controllers\Controller;

use App\Models\Clues;
use App\Models\Codigo;
use App\Models\Cr;
use App\Models\Fuente;
use App\Models\Profesion;
use App\Models\Programa;
use App\Models\Rama;
use App\Models\TipoNomina;
use App\Models\TipoProfesion;
use App\Models\NivelAcademico;
use App\Models\Sindicato;
use App\Models\Turno;
use App\Models\TipoBaja;
use App\Models\UR;
use App\Models\FuenteFinanciamiento;
use App\Models\TipoTrabajador;

class CatalogosController extends Controller
{
    public function index(Request $request)
    {
        try{
            $params = $request->all();
            //$clues = Clues::all();
            //$codigo = Codigo::orderBy("descripcion")->get();
            //$cr = Cr::orderBy("descripcion")->get();
            $fuente = Fuente::orderBy("descripcion")->get();
            //$tipoProfesion = TipoProfesion::orderBy("id")->get();
            $nivelAcademico = NivelAcademico::orderBy('nivel')->get();
            $sindicatos = Sindicato::all();

            /*if($params['profesion_id'] && $params['profesion_id'] != 'null'){
                $consultaprofesion = Profesion::where("id", "=", $params['profesion_id'])->select("tipo_profesion_id")->first();
                $profesion = Profesion::where("tipo_profesion_id", "=", $consultaprofesion->tipo_profesion_id)->orderBy("descripcion")->get();

                $tipo_profesion_id = $consultaprofesion->tipo_profesion_id;
            }else{
                $tipo_profesion_id = null;
                $profesion = [];
            }*/
            
            $programa = Programa::orderBy("descripcion")->get();
            $rama = Rama::orderBy("descripcion")->get();
            $tipoTrabajador = TipoTrabajador::orderBy("descripcion")->get();
            $turno = Turno::all();
            $fuente_finan = FuenteFinanciamiento::orderBy("descripcion")->get();
            $ur = UR::all();
            
            $catalogos = [
                "fuente_financiamiento" => $fuente_finan,
                "programa" => $programa, 
                "rama" => $rama, 
                "tipo_trabajador" => $tipoTrabajador, 
                "nivel_academico" => $nivelAcademico, 
                "sindicatos" => $sindicatos,
                "turno" => $turno,
                "ur" => $ur
            ];

            return response()->json($catalogos,HttpResponse::HTTP_OK);
        }catch(\Exception $e){
            return response()->json(['error'=>['message'=>$e->getMessage(),'line'=>$e->getLine()]], HttpResponse::HTTP_CONFLICT);
        }
    }

    public function catalogoTipoBaja(){
        try{
            $tipos_baja = TipoBaja::all();
            
            return response()->json(['data'=>$tipos_baja], HttpResponse::HTTP_OK);
        }catch(\Exception $e){
            return response()->json(['error'=>['message'=>$e->getMessage(),'line'=>$e->getLine()]], HttpResponse::HTTP_CONFLICT);
        }
    }
}
