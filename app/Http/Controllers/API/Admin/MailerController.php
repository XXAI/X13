<?php

namespace App\Http\Controllers\API\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Mail;
use App\Mail\RecoverPassword;

class MailerController extends Controller{

    public function enviarRecuperarContrasena(Request $request){
        //ini_set('memory_limit', '-1');
        
        try{
            Mail::to('maca.15c@gmail.com')->send(new RecoverPassword());
        }catch(\Exception $e){
            return response()->json(['error' => $e->getMessage(),'line'=>$e->getLine()], HttpResponse::HTTP_CONFLICT);
        }
    }
}
