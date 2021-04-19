<?php

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', function () {
    View::addExtension('html','php');
    return View::make('index');
});

Route::get('images/tipo-elementos-pedido/{filename}', function ($filename)
{
    $file = \Illuminate\Support\Facades\Storage::disk('public')->get('tipo-elementos-pedido\\'.$filename);
    return response($file, 200)->header('Content-Type', 'image/svg+xml');
});