<?php

namespace App\Http\Controllers\API\Modulos;

use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;

use App\Http\Requests;

use App\Http\Controllers\Controller;



use App\Exceptions\DataException;
use Validator;
use Excel;

use App\Imports\EntradasInsumosImport;
use App\Imports\SalidasInsumosImport;
use App\Imports\ExistenciasInsumosImport;

use App\Models\Pedido;


class ExcelImportInsumosController extends Controller
{
    
    public function importarEntradasLayout(Request $request)
    {
        
        $input = $request->all();
        $messages = [
            "required"=> "required",
            "numeric"=> "numeric",
            "file"=>"file"
        ];

        $rules = [
            'almacen_id' => 'required|numeric',
            'layout' => 'required|file',
        ];

        $validator = Validator::make($input, $rules, $messages);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ],409);
        }
        
        if($request->hasFile('layout'))
        {
            if($request->file('layout')->isValid())
            $file = $request->layout;

            $path = $file->store('entradas');
            try
            {
                $pedido_id = null; //Harima:: Se agrego parametro opcional pedido_id
                if(isset($input['pedido_id']) && $input['pedido_id']){
                    $pedido_id = $input['pedido_id'];
                }

                Excel::import(new EntradasInsumosImport($input["almacen_id"],$pedido_id), $path);
                
                return response()->json([
                    'message' => "Importación de entradas realizada correctamente"
                ],200);
            }
            catch(DataException $e)
            {
                return response()->json([
                    'message' => "Hay uno o mas errores en el layout",
                    'line' => $e->getLine(),
                    "data" =>$e->getData()
                ],400);
            }
           

            //return $path;
        }
        //return Excel::download(new ImportarEntradasLayoutExport, 'ImportarEntradasLayout.xlsx');
    }

    public function importarSalidasLayout(Request $request)
    {
        
        $input = $request->all();
        $messages = [
            "required"=> "required",
            "numeric"=> "numeric",
            "file"=>"file"
        ];

        $rules = [
            'almacen_id' => 'required|numeric',
            'layout' => 'required|file',
        ];

        $validator = Validator::make($input, $rules, $messages);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ],409);
        }
        
       

        if($request->hasFile('layout'))
        {
            if($request->file('layout')->isValid())
            $file = $request->layout;

            $path = $file->store('salidas');
            try
            {
                Excel::import(new SalidasInsumosImport($input["almacen_id"]), $path);
                return response()->json([
                    'message' => "Importación de salidas realizada correctamente"
                ],200);
            }
            catch(DataException $e)
            {
                return response()->json([
                    'message' => "Hay uno o mas errores en el layout",
                    "data" =>$e->getData()
                ],400);
            }          

            //return $path;
        }
    }


    public function importarExistenciasLayout(Request $request)
    {
        
        $input = $request->all();
        $messages = [
            "required"=> "required",
            "numeric"=> "numeric",
            "file"=>"file"
        ];

        $rules = [
            'almacen_id' => 'required|numeric',
            'programa_id' => 'required|numeric',
            'layout' => 'required|file',
        ];

        $validator = Validator::make($input, $rules, $messages);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ],409);
        }
        
        if($request->hasFile('layout'))
        {
            if($request->file('layout')->isValid())
            $file = $request->layout;

            $path = $file->store('existencias');
            try
            {
                Excel::import(new ExistenciasInsumosImport($input["almacen_id"],$input["programa_id"]), $path);
                return response()->json([
                    'message' => "Importación de existencias realizada correctamente"
                ],200);
            }
            catch(DataException $e)
            {
                return response()->json([
                    'message' => "Hay uno o mas errores en el layout",
                    "data" =>$e->getData()
                ],400);
            }          

            //return $path;
        }
    }
}