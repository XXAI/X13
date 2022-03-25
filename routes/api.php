<?php

use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/
Route::group([
    'middleware' => 'api',
    'prefix' => 'auth'
], function ($router) {
    Route::post('logout',   'API\Auth\AuthController@logout');
    Route::get('perfil',   'API\Auth\AuthController@me');
});

Route::post('signin',   'API\Auth\AuthController@login');
Route::post('refresh',  'API\Auth\AuthController@refresh');

/**
 *  Para envio de correos
 */
Route::get('enviar-recuperar-pass',             'API\Admin\MailerController@enviarRecuperarContrasena');

Route::group(['middleware'=>'auth'],function($router){
    Route::apiResource('user',          'API\Admin\UserController');
    Route::get('user-catalogs', 'API\Admin\UserController@getCatalogs');

    Route::apiResource('catalogos/grupos',    'API\Catalogos\GruposController');

    /* Busqueda de Bienes y servicios */
    Route::get('buscar-articulos', 'API\Catalogos\BienesServiciosController@index');

    Route::apiResource('permission',    'API\Admin\PermissionController');
    Route::apiResource('role',          'API\Admin\RoleController');
    Route::apiResource('profile',       'API\ProfileController')->only([ 'show', 'update']);

    //Modulos del Sistema
    /**
     *  Modulo de Configuración
     */
    Route::apiResource('configuracion/tipos-elementos-pedidos',   'API\Configuracion\TiposPedidosController');
    Route::get('configuracion/tipos-elementos-pedidos-catalogos', 'API\Configuracion\TiposPedidosController@getCatalogos');

    /**
     *  Modulo de Configuración de la Unidad
     */
    Route::apiResource('configuracion-unidad',                                  'API\ConfiguracionUnidad\ConfiguracionUnidadController')->only(['index']);
    Route::apiResource('configuracion-unidad/catalogo-articulos',               'API\ConfiguracionUnidad\CatalogoArticulosController');
    Route::apiResource('configuracion-unidad/admin-usuarios',                   'API\ConfiguracionUnidad\AdminUsuariosController')->only(['index','update']);
    
    Route::get('configuracion-unidad/catalogo-articulos-catalogos',             'API\ConfiguracionUnidad\CatalogoArticulosController@getCatalogos');
    Route::get('configuracion-unidad/catalogo-articulos-cerrar-captura/{id}',   'API\ConfiguracionUnidad\CatalogoArticulosController@cerrarCaptura');
    Route::get('configuracion-unidad/catalogo-articulos-exportar-excel/{id}',   'API\ConfiguracionUnidad\CatalogoArticulosController@exportExcel');

    /**
     *  Modulo de Reportes
     */
    Route::get('ejecutar-query',                    'API\Admin\DevReporterController@executeQuery');
    Route::get('exportar-query',                    'API\Admin\DevReporterController@exportExcel');

    Route::post('json-csv',                          'API\Admin\DevJsonFilesController@exportCSV');

    /**
     * Modulos Almacen
     */
    Route::get('almacen-buscar-stock',                  'API\Modulos\AlmacenMovimientosController@buscarStock');
    Route::get('almacen-movimientos-catalogos',         'API\Modulos\AlmacenMovimientosController@obtenerCatalogos');
    Route::apiResource('almacen-entradas',              'API\Modulos\AlmacenEntradaController');
    Route::put('almacen-entradas-cancelar/{id}',        'API\Modulos\AlmacenEntradaController@cancelarMovimiento');
    Route::apiResource('almacen-salidas',               'API\Modulos\AlmacenSalidaController');
    Route::put('almacen-salidas-cancelar/{id}',         'API\Modulos\AlmacenSalidaController@cancelarMovimiento');
    Route::get('almacen-existencias',                   'API\Modulos\AlmacenExistenciasController@index');
    Route::get('almacen-existencias/movimientos/{id}',  'API\Modulos\AlmacenExistenciasController@movimientos');
    Route::get('almacen-existencias/detalles/{id}',     'API\Modulos\AlmacenExistenciasController@detalles');
    Route::get('almacen-existencias/catalogos',         'API\Modulos\AlmacenExistenciasController@catalogosExistencias');
    Route::get('almacen-existencias/exportar-excel',    'API\Modulos\AlmacenExistenciasController@exportExcel');
    Route::get('partidas-bienes-servicios/',            'API\Modulos\PartidasController@partidas');
    Route::get('familias-bienes-servicios/',            'API\Modulos\FamiliasController@familias');
    Route::apiResource('catalogo-almacenes',            'API\ConfiguracionUnidad\AlmacenesController');

    /**
     * Modulos Pedidos
     */
    Route::get('datos-catalogo',                    'API\Modulos\PedidoOrdinarioController@datosCatalogo');
    Route::get('busqueda-elementos',                'API\Modulos\PedidoOrdinarioController@busquedaElementos');
    Route::apiResource('pedido-ordinario',           'API\Modulos\PedidoOrdinarioController');

    Route::apiResource('recepcion-pedidos',          'API\Modulos\RecepcionPedidosController')->except(['create','store']);
    Route::get('recepcion-pedidos-catalogos',        'API\Modulos\RecepcionPedidosController@datosCatalogo');
    Route::get('lista-articulos-recepcion/{id}',       'API\Modulos\RecepcionPedidosController@listaArticulosRecepcion');

    //Route::apiResource('estatus-avance-recepcion',   'API\Modulos\EstatusAvanceRecepcionPedidoController')->except(['create','store','update','destroy']);
    //Route::get('estatus-avance-recepcion-catalogos', 'API\Modulos\EstatusAvanceRecepcionPedidoController@datosCatalogo');
    /*
    *   Modulos Reporte Semanal
    */
    Route::get('get-data-cap-reporte-as',                       'API\Modulos\CapturaReporteAbastoSurtimientoController@getDataInfo');
    Route::get('excel-admin-reporte-abasto',                    'API\Modulos\CapturaReporteAbastoSurtimientoController@exportAdminExcel');
    Route::apiResource('cap-reporte-abasto-surtimiento',        'API\Modulos\CapturaReporteAbastoSurtimientoController');
    Route::apiResource('config-cap-abasto-surtimiento',         'API\Modulos\ConfigCapturaAbastoSurtimientoController');
    Route::put('config-cap-abasto-surtimiento-recalcular/{id}', 'API\Modulos\ConfigCapturaAbastoSurtimientoController@recalcularPorcentajes');
    Route::get('config-lista-unidades-catalogos',               'API\Modulos\ConfigCapturaAbastoSurtimientoController@getListaUnidadesMedicasCatalogos');
    Route::post('config-lista-unidades-catalogos-editar',       'API\Modulos\ConfigCapturaAbastoSurtimientoController@adminListaUnidadesMedicasCatalogos');

    /*
    *   Modulos generales
    */
    Route::apiResource('insumos-medicos',          'API\Modulos\InsumosMedicosController');
    Route::get('cargar-catalogos',                 'API\Modulos\CatalogosController@getCatalogos');
    Route::post('catalogos-generales',             'API\Catalogos\BusquedaCatalogosController@getCatalogs');
    //De forma temporal, mientras se trabaja modulo de subir archivos
    Route::post('subir-lista-meds-tmp',            'API\Modulos\CapturaReporteAbastoSurtimientoController@subirListaMedicamentos');
    Route::get('ver-lista-meds-tmp',               'API\Modulos\CapturaReporteAbastoSurtimientoController@descargarArchivo');

    /*
    * Módulos de importacion de insumos a existencias
    */
    //Route::post('importar-catalogos',                 'API\Modulos\ExcelImportInsumosController@catalogos');
    Route::post('importar-entradas-excel',                'API\Modulos\ExcelImportInsumosController@importarEntradasLayout');
    Route::post('importar-salidas-excel',                 'API\Modulos\ExcelImportInsumosController@importarSalidasLayout');
    Route::post('importar-existencias-excel',             'API\Modulos\ExcelImportInsumosController@importarExistenciasLayout');
    
});

Route::middleware('auth')->get('/avatar-images', function (Request $request) {
    $avatars_path = public_path() . config('ng-client.path') . '/assets/avatars';
    $image_files = glob( $avatars_path . '/*', GLOB_MARK );

    $root_path = public_path() . config('ng-client.path');

    $clean_path = function($value)use($root_path) {
        return str_replace($root_path,'',$value);
    };
    
    $avatars = array_map($clean_path, $image_files);

    return response()->json(['images'=>$avatars], HttpResponse::HTTP_OK);
});