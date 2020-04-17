<?php

namespace App\Classes;

Class Encryption{

    static function decrypt($string) {
        $result = '';
        $key = "%%pGCrTPUthfUV_s7y=4gEE";
        $string = base64_decode($string);
        $string = str_replace("(", "/", $string);
        for($i=0; $i<strlen($string); $i++) {
           $char = substr($string, $i, 1);
           $keychar = substr($key, ($i % strlen($key))-1, 1);
           $char = chr(ord($char)-ord($keychar));
           $result.=$char;
        }
        return $result;
     }
    
     
     static function encrypt($string) {
        $key = '%%pGCrTPUthfUV_s7y=4gEE';
        $result = '';
        for($i=0; $i<strlen($string); $i++) {
           $char = substr($string, $i, 1);
           $keychar = substr($key, ($i % strlen($key))-1, 1);
           $char = chr(ord($char)+ord($keychar));
           $result.=$char;
        }
        $obj = base64_encode($result);
        return str_replace("/", "(", $obj);
     }
}