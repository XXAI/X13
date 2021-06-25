<?php

namespace App\Http\Controllers\API\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use App\Http\Controllers\Controller;
use Maatwebsite\Excel\Facades\Excel;

use App\Exports\DevReportExport;

use Illuminate\Support\Facades\Input;

use \DB;

class DevJsonFilesController extends Controller
{
    public function exportCSV(Request $request){
        ini_set('memory_limit', '-1');

        try{
            //$params = $request->file('file');
            if($request->hasFile('archivoJSON')){
                $file = $request->file('archivoJSON');

                if ($file->isValid()) {
                    $path = $file->getRealPath();
                }else{
                    $path = 'nailas';
                }
            }else{
                $path = 'noras';
            }
            
            /*$resultado = DB::select($query);

            $columnas = array_keys(collect($resultado[0])->toArray());

            $filename = $request->get('nombre_archivo');
            if(!$filename){
                $filename = 'reporte';
            }*/
            
            //return (new DevReportExport($resultado,$columnas))->download($filename.'.xlsx'); //Excel::XLSX, ['Access-Control-Allow-Origin'=>'*','Access-Control-Allow-Methods'=>'GET']
            return response()->json(['error' => '$e->getMessage()','line'=>100, 'params'=>$path], HttpResponse::HTTP_CONFLICT);
        }catch(\Exception $e){
            return response()->json(['error' => $e->getMessage(),'line'=>$e->getLine()], HttpResponse::HTTP_CONFLICT);
        }
    }
}
