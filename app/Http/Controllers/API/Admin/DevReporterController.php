<?php

namespace App\Http\Controllers\API\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use App\Http\Controllers\Controller;
use Maatwebsite\Excel\Facades\Excel;

use App\Exports\DevReportExport;

use Illuminate\Support\Facades\Input;

use \DB;

class DevReporterController extends Controller
{
    public function executeQuery(Request $request){
        ini_set('memory_limit', '-1');

        try{
            //$nombre_archivo = $request->get('nombre_archivo');
            DB::enableQueryLog();

            $query = $request->get('query');

            if (preg_match('/(DELETE|DROP|TRUNCATE|ALTER|UPDATE)/',strtoupper($query)) != 0){
                return response()->json(['error' => 'Solo se permiten SELECTs'], HttpResponse::HTTP_CONFLICT);
            }

            $limit = $request->get('limit');
            if(!$limit){
                $limit = 100;
            }

            $query .= ' limit '.$limit;

            $resultado = DB::select($query);

            $columnas = array_keys(collect($resultado[0])->toArray());

            $query_log = DB::getQueryLog();

            return response()->json(['data'=>$resultado, 'columns'=>$columnas, 'exec_time'=>$query_log[0]['time']],HttpResponse::HTTP_OK);
        }catch(\Exception $e){
            return response()->json(['error' => $e->getMessage(),'line'=>$e->getLine()], HttpResponse::HTTP_CONFLICT);
        }
    }

    public function exportExcel(Request $request){
        ini_set('memory_limit', '-1');

        try{
            $query = $request->get('query');

            if (preg_match('/(DELETE|DROP|TRUNCATE|ALTER|UPDATE)/',strtoupper($query)) != 0){
                return response()->json(['error' => 'Solo se permiten SELECTs'], HttpResponse::HTTP_CONFLICT);
            }

            $resultado = DB::select($query);

            $columnas = array_keys(collect($resultado[0])->toArray());

            $filename = $request->get('nombre_archivo');
            if(!$filename){
                $filename = 'reporte';
            }
            
            return (new DevReportExport($resultado,$columnas))->download($filename.'.xlsx'); //Excel::XLSX, ['Access-Control-Allow-Origin'=>'*','Access-Control-Allow-Methods'=>'GET']
        }catch(\Exception $e){
            return response()->json(['error' => $e->getMessage(),'line'=>$e->getLine()], HttpResponse::HTTP_CONFLICT);
        }
    }
}
