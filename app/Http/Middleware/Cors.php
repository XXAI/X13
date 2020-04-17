<?php

namespace App\Http\Middleware;

use Closure;

class Cors
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle($request, Closure $next)
    {   
        return $next($request);
        /*
        return $next($request)
                ->header('Access-Control-Allow-Origin','*')
                ->header('Access-Control-Allow-Methods','GET, PUT, POST, DELETE, HEAD, OPTIONS')
                ->header('Access-Control-Expose-Headers','Content-Disposition')
                ->header('Access-Control-Allow-Headers','Authorization, Content-Type, Accept, Content-Disposition, Application');
                */
                
                
                /*
                $response = $next($request);
                //$response->headers->set('Access-Control-Allow-Credentials', 'true');
                //$response->headers->set('Access-Control-Max-Age', '86400');
                $response->headers->set('Access-Control-Allow-Origin' , '*');
                $response->headers->set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, PUT, DELETE, HEAD');
                $response->headers->set('Access-Control-Expose-Headers', 'Content-Disposition');
                $response->headers->set('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization, X-Requested-With, Application');
                return $response;
                */
                
    }
}
