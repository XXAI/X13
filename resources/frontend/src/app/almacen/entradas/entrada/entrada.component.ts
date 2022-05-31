import { Component, OnInit, SimpleChange, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AlmacenService } from '../../almacen.service';
import { EntradasService } from '../entradas.service';
import { SharedService } from '../../../shared/shared.service';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatDrawer } from '@angular/material/sidenav';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmActionDialogComponent } from '../../../utils/confirm-action-dialog/confirm-action-dialog.component';
import { DatePipe } from '@angular/common';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { MatSort } from '@angular/material/sort';
import {animate, state, style, transition, trigger} from '@angular/animations';
import { ReportWorker } from 'src/app/web-workers/report-worker';
import * as FileSaver from 'file-saver';
import { DialogoCancelarResultadoComponent } from '../dialogo-cancelar-resultado/dialogo-cancelar-resultado.component';
import { DialogoCancelarMovimientoComponent } from '../../tools/dialogo-cancelar-movimiento/dialogo-cancelar-movimiento.component';
import { MovimientoData } from '../../tools/entrada';
import { User } from 'src/app/auth/models/user';
import { AuthService } from 'src/app/auth/auth.service';
import { DialogoModificarMovimientoComponent } from '../../tools/dialogo-modificar-movimiento/dialogo-modificar-movimiento.component';
import { Location } from '@angular/common';
import { MovimientosLocalStorageService } from '../../tools/movimientos-local-storage.service';
import { AlertPanelComponent } from 'src/app/shared/components/alert-panel/alert-panel.component';

@Component({
  selector: 'app-entrada',
  templateUrl: './entrada.component.html',
  styleUrls: ['./entrada.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed, void', style({ height: '0px' })), 
      state('expanded', style({ height: '*' })), 
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')), 
      transition('expanded <=> void', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)'))
    ]),
  ],
})
export class EntradaComponent implements OnInit {
  @ViewChild(MatPaginator) articulosPaginator: MatPaginator;
  @ViewChild(MatTable) articulosTable: MatTable<any>;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(AlertPanelComponent) alertPanel:AlertPanelComponent;
  
  constructor(
    private datepipe: DatePipe,
    private formBuilder: FormBuilder, 
    private authService: AuthService,
    private almacenService: AlmacenService, 
    private entradasService: EntradasService, 
    private sharedService: SharedService, 
    private dialog: MatDialog, 
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private localStorageService: MovimientosLocalStorageService,
  ) { }

  authUser:User;

  estatusStorageIcon:string;

  formMovimiento:FormGroup;
  catalogos:any;

  idArticuloSeleccionado:number;

  movimientoPadre:any;

  controlArticulosAgregados:any;
  controlArticulosModificados:any;
  listadoArticulosEliminados:any[];

  filtroArticulos:string;
  filtroAplicado:boolean;

  filteredProveedores: Observable<any[]>;
  filteredProgramas: Observable<any[]>;
  filteredUnidadesMedicas: Observable<any[]>;

  totalesRecibidos: any;
  tieneSolicitado: boolean;

  pageEvent: PageEvent;
  resultsLength: number = 0;
  currentPage: number = 0;
  pageSize: number = 10;
  pageSizeOptions: number[] = [10, 20, 30, 50];
  dataSourceArticulos: MatTableDataSource<any>;

  displayedColumns: string[]; //= ['estatus','clave','nombre','no_lotes','total_piezas','total_monto','actions'];
  
  puedeEditarDatosEncabezado: boolean;
  puedeEditarListaArticulos:  boolean;

  //editable: boolean;
  //puedeEditarElementos: boolean;

  datosForm:any;
  datosEntrada:MovimientoData;
  modoRecepcion:boolean;

  verBoton: any;
  isLoading: boolean;
  isSaving: boolean;
  estatusMovimiento: string;
  maxFechaMovimiento: Date;
  listadoEstatusUsuarios: any[];
  verListadoUsuarios: boolean;

  listaEstatusIconos: any = { 'NV':'save_as', 'BOR':'content_paste',  'FIN':'assignment_turned_in',   'CAN':'cancel',     'PERE':'pending_actions',       'SOL':'edit_notifications',        'MOD':'note_alt'};
  listaEstatusClaves: any = { 'NV':'nuevo',   'BOR':'borrador',       'FIN':'concluido',              'CAN':'cancelado',  'PERE':'pendiente-recepcion',   'SOL':'peticion-modificacion',     'MOD':'modificacion-aprobada'};
  listaEstatusLabels: any = { 'NV':'Nuevo',   'BOR':'Borrador',       'FIN':'Concluido',              'CAN':'Cancelado',  'PERE':'Pendiente de Recepción','SOL':'Petición de Modificación',  'MOD':'Modificación Activa'};
  
  estatusArticulosColores = {1:'verde', 2:'ambar', 3:'rojo'};
  estatusArticulosIconos = {1:'check_circle_outline', 2:'notification_important', 3:'warning'};
  
  ngOnInit() {
    this.authUser = this.authService.getUserData();
    this.localStorageService.tipoMovimiento = 'entradas';

    this.isLoading = true;
    this.puedeEditarDatosEncabezado = false;
    this.puedeEditarListaArticulos = false;

    this.listadoEstatusUsuarios = [];
    this.verListadoUsuarios = false;

    this.displayedColumns = [];
    this.datosForm = {};
    //this.datosEntrada = {};

    this.listadoArticulosEliminados = [];
    this.controlArticulosAgregados = {};
    this.controlArticulosModificados = {};

    this.totalesRecibidos = {
      claves: 0,
      lotes: 0,
      articulos: 0,
      monto: parseFloat('0'),
      por_caducar: {
        claves: 0,
        lotes: 0,
        articulos: 0,
        monto: parseFloat('0'),
      },
      caducados:{
        claves: 0,
        lotes: 0,
        articulos: 0,
        monto: parseFloat('0'),
      }
    };
    
    this.catalogos = {
      'almacenes':[],
      'programas':[],
      'proveedores':[],
      'tipos_movimiento':[],
      'unidades_medicas':[],
      'turnos':[],
      'marcas':[],
    };

    this.maxFechaMovimiento = new Date();
    this.formMovimiento = this.formBuilder.group({});

    this.verBoton = {
      agregar_articulos:false,
      guardar:false,
      concluir:false,
      concluir_modificacion:false,
      duplicar:false,
      crear_salida:false,
      eliminar:false,
      cancelar:false,
      modificar_entrada:false,
      descartar_cambios:false,
    };

    let lista_catalogos:any = {almacenes:'*',programas:'*',proveedores:'*',marcas:'*',turnos:'*',unidades_medicas:'*',filtro_almacenes_movimiento:'ENT'};

    this.almacenService.obtenerMovimientoCatalogos(lista_catalogos).subscribe(
      response =>{
        if(response.error) {
          let errorMessage = response.error.message;
          //this.sharedService.showSnackBar(errorMessage, null, 3000);
          this.alertPanel.mostrarError('Error: '+errorMessage);
        } else {
          this.catalogos['almacenes'] = response.data.almacenes;
          this.catalogos['programas'] = response.data.programas;
          this.catalogos['proveedores'] = response.data.proveedores;
          this.catalogos['unidades_medicas'] = response.data.unidades_medicas;
          this.catalogos['marcas'] = response.data.marcas;
          this.catalogos['turnos'] = response.data.turnos;

          this.cargarDatosMovimiento();
        }
        this.isLoading = false;
      },
      errorResponse =>{
        var errorMessage = "Ocurrió un error.";
        if(errorResponse.status == 409){
          errorMessage = errorResponse.error.error.message;
        }
        //this.sharedService.showSnackBar(errorMessage, null, 3000);
        this.alertPanel.mostrarError('Error: '+errorMessage);
        this.isLoading = false;
      }
    );
  }

  checarAlmacenSeleccionado(){
    let almacen_id;
    if(this.formMovimiento.get('almacen_id')){
      almacen_id = this.formMovimiento.get('almacen_id').value;
    }else{
      almacen_id = this.datosEntrada.almacen_id;
    }

    let almacen = this.catalogos['almacenes'].find(item => item.id == almacen_id);

    if(this.formMovimiento.get('tipo_movimiento_id')){
      this.catalogos['tipos_movimiento'] = almacen.tipos_movimiento;
      if(this.catalogos['tipos_movimiento'].length == 1){
        this.formMovimiento.get('tipo_movimiento_id').patchValue(this.catalogos['tipos_movimiento'][0].id);
      }else{
        this.formMovimiento.get('tipo_movimiento_id').reset();
      }
      this.checarTipoRecepcion(this.formMovimiento.get('tipo_movimiento_id').value);
    }
  }

  cargarDatosMovimiento(){
    this.modoRecepcion = false;
    this.route.paramMap.subscribe(params => {
      if(params.get('id')){
        this.entradasService.verEntrada(params.get('id')).subscribe(
          response =>{
            if(response.error) {
              let errorMessage = response.error.message;
              //this.sharedService.showSnackBar(errorMessage, null, 3000);
              this.alertPanel.mostrarError('Error: '+errorMessage);
            } else {
              response.data.fecha_movimiento = new Date(response.data.fecha_movimiento+'T12:00:00');
              if(response.data.referencia_fecha){
                response.data.referencia_fecha = new Date(response.data.referencia_fecha+'T12:00:00');
              }

              this.estatusMovimiento = response.data.estatus;

              if(response.data.movimiento_padre){
                this.movimientoPadre = response.data.movimiento_padre;
              }

              if(response.data.estatus == 'BOR'){
                this.puedeEditarDatosEncabezado = true;
                this.puedeEditarListaArticulos = true;

                this.verBoton.concluir = true;
                this.verBoton.guardar = true;
                this.verBoton.eliminar = true;
                this.verBoton.agregar_articulos = true;

                this.reconfigurarFormulario();
              }else if(response.data.estatus == 'PERE'){
                this.puedeEditarDatosEncabezado = true;
                this.puedeEditarListaArticulos = true;
                
                this.verBoton.concluir = true;
                this.verBoton.guardar = true;
                this.verBoton.cancelar = true;
                this.verBoton.agregar_articulos = false;
                
                this.reconfigurarFormulario(['id','fecha_movimiento','turno_id','observaciones']);
                this.modoRecepcion = true;
                this.totalesRecibidos.recibidos = 0;
              }else if(response.data.estatus == 'CAN'){
                this.verBoton.duplicar = true;
              }else{
                this.verBoton.duplicar = true;
                this.verBoton.crear_salida = true;
                this.verBoton.modificar_entrada = true;
                this.verBoton.cancelar = true;
              }

              /*if(response.data.tipo_movimiento && response.data.tipo_movimiento.clave == 'RCPCN'){
                //TODO: Creo que esta de mas, habra que validarlo
                this.modoRecepcion = true;
                this.totalesRecibidos.recibidos = 0;
              }*/

              this.datosEntrada = response.data;

              if(this.datosEntrada.modificacion_activa){
                this.cargarDatosModificacion(this.datosEntrada.modificacion_activa);
                this.formMovimiento.patchValue(this.datosEntrada);
              }else{
                this.formMovimiento.patchValue(response.data);
              }
              
              //if(response.data.estatus == 'BOR'){
              if(this.puedeEditarDatosEncabezado){
                this.checarAlmacenSeleccionado();
                if(this.formMovimiento.get('tipo_movimiento_id')){
                  this.formMovimiento.get('tipo_movimiento_id').patchValue(response.data.tipo_movimiento_id);
                  this.checarTipoMovimientoSeleccinado();
                  if(this.formMovimiento.get('unidad_medica_movimiento')){
                    this.formMovimiento.get('unidad_medica_movimiento').patchValue(response.data.unidad_medica_movimiento);
                    this.formMovimiento.get('unidad_medica_movimiento_id').patchValue(response.data.unidad_medica_movimiento_id);
                  }
                }
              }
              
              if(response.data.solicitud){
                this.tieneSolicitado = true;
              }
              this.cargarColumnasArticulos();

              let articulos_temp = [];
              let lista_articulos;

              if(this.estatusMovimiento == 'PERE'){
                lista_articulos = response.data.lista_articulos_recepcion;
              }else if(this.estatusMovimiento == 'BOR'){
                lista_articulos = response.data.lista_articulos_borrador;
              }else{
                lista_articulos = response.data.lista_articulos;
              }

              articulos_temp = this.cargarListaArticulos(lista_articulos,this.datosEntrada.tipo_movimiento.clave,this.datosEntrada.estatus);

              this.dataSourceArticulos = new MatTableDataSource<any>(articulos_temp);
              this.dataSourceArticulos.paginator = this.articulosPaginator;
              this.dataSourceArticulos.sort = this.sort;

              this.cargarDatosUsuarios(response.data);

              
              let identificador = this.localStorageService.getDatosID();
              if(identificador && identificador.id == response.data.id){
                if(this.estatusMovimiento != 'BOR' && this.estatusMovimiento != 'PERE' ){
                  this.localStorageService.deleteDatos();
                }else{
                  let fecha_datos = this.datepipe.transform(identificador.actualizado, 'medium');
                  const dialogRef = this.dialog.open(ConfirmActionDialogComponent, {
                    width: '500px',
                    disableClose: true,
                    data:{dialogTitle:'Recuperación de datos no guardados:',dialogMessage:'Se han encontado datos locales del movimiento actual, estos datos fueron capturados con fecha: '+fecha_datos+', pero no fueron guardados. ¿desea cargar los datos encontrados?',btnColor:'accent',btnText:'Cargar Datos'}
                  });
              
                  dialogRef.afterClosed().subscribe(valid => {
                    if(valid){
                      this.estatusStorageIcon = 'edit_note';
                      this.verBoton.descartar_cambios = true;
                      let datos_guardados = this.localStorageService.getDatos();

                      if(datos_guardados.lista_articulos){
                        this.dataSourceArticulos = new MatTableDataSource<any>(datos_guardados.lista_articulos);
                        this.dataSourceArticulos.paginator = this.articulosPaginator;
                        this.dataSourceArticulos.sort = this.sort;
                      }

                      if(datos_guardados.generales){
                        this.totalesRecibidos = datos_guardados.generales;
                      }

                      if(datos_guardados.formulario){
                        this.formMovimiento.patchValue(datos_guardados.formulario);
                      }
                    }
                    this.configurarDatosTemporales();
                  });
                }
              }else{
                this.configurarDatosTemporales();
              }
            }
            this.isLoading = false;
          },
          errorResponse =>{
            var errorMessage = "Ocurrió un error.";
            if(errorResponse.status == 409){
              errorMessage = errorResponse.error.error.message;
            }
            //this.sharedService.showSnackBar(errorMessage, null, 3000);
            this.alertPanel.mostrarError('Error: '+errorMessage);
            this.isLoading = false;
          }
        );
      }else{
        let datos_recibidos = history.state.data;
        this.estatusMovimiento = 'NV';
        
        //Si recibimos datos, es por que estamos copiando una salida o el movimiento se esta generando en base a una entrada
        if(datos_recibidos && datos_recibidos.movimiento_id){
          this.isLoading = true;
          this.entradasService.verEntrada(datos_recibidos.movimiento_id).subscribe(
            response =>{
              console.log('Respuesta Movimiento a Duplicar:',response);
              this.modoRecepcion = false;
              let lista_articulos = this.cargarListaArticulos(response.data.lista_articulos,'ALM','NV');

              this.dataSourceArticulos = new MatTableDataSource<any>(lista_articulos);
              this.dataSourceArticulos.paginator = this.articulosPaginator;
              this.dataSourceArticulos.sort = this.sort;

              this.configurarDatosTemporales();

              this.isLoading = false;
            },
            errorResponse =>{
              var errorMessage = "Ocurrió un error.";
              if(errorResponse.status == 409){
                errorMessage = errorResponse.error.error.message;
              }
              //this.sharedService.showSnackBar(errorMessage, null, 3000);
              this.alertPanel.mostrarError('Error: '+errorMessage);
              this.isLoading = false;
            }
          );
        }else{
          this.dataSourceArticulos = new MatTableDataSource<any>([]);
          this.dataSourceArticulos.paginator = this.articulosPaginator;
          this.dataSourceArticulos.sort = this.sort;
        }

        this.puedeEditarDatosEncabezado = true;
        this.puedeEditarListaArticulos = true;

        this.verBoton.concluir = true;
        this.verBoton.guardar = true;
        this.verBoton.eliminar = true;
        this.verBoton.agregar_articulos = true;

        this.reconfigurarFormulario();
        this.cargarColumnasArticulos();

        if(datos_recibidos && datos_recibidos.recuperacion){
          let identificador = this.localStorageService.getDatosID();
          if(identificador && identificador.id == 'NV'){
            this.estatusStorageIcon = 'edit_note';
            this.verBoton.descartar_cambios = true;
            let datos_guardados = this.localStorageService.getDatos();

            if(datos_guardados.lista_articulos){
              this.dataSourceArticulos = new MatTableDataSource<any>(datos_guardados.lista_articulos);
              this.dataSourceArticulos.paginator = this.articulosPaginator;
              this.dataSourceArticulos.sort = this.sort;
            }

            if(datos_guardados.generales){
              this.totalesRecibidos = datos_guardados.generales;
            }

            if(datos_guardados.formulario){
              if(this.formMovimiento.get('almacen_id')){
                this.formMovimiento.get('almacen_id').patchValue(datos_guardados.formulario.almacen_id);
                this.checarAlmacenSeleccionado();
              }
              this.formMovimiento.patchValue(datos_guardados.formulario);
            }
          }
          this.configurarDatosTemporales();
        }else{
          this.configurarDatosTemporales();
        }
      }
    });
  }

  cargarListaArticulos(lista_articulos:any[], tipo_movimiento_clave:string, estatus:string):any[]{
    let listado_articulos:any = [];
    this.controlArticulosAgregados = {};
    this.totalesRecibidos = {
      claves: 0,
      lotes: 0,
      articulos: 0,
      monto: parseFloat('0'),
      por_caducar: {
        claves: 0,
        lotes: 0,
        articulos: 0,
        monto: parseFloat('0'),
      },
      caducados:{
        claves: 0,
        lotes: 0,
        articulos: 0,
        monto: parseFloat('0'),
      }
    };

    for(let i in lista_articulos){
      lista_articulos[i].total_monto = parseFloat(lista_articulos[i].total_monto||0);
      let articulo:any;

      if(!this.controlArticulosAgregados[lista_articulos[i].articulo.id]){
        articulo = {
          id:                     lista_articulos[i].articulo.id,
          estatus:                1,
          clave:                  (lista_articulos[i].articulo.clave_cubs)?lista_articulos[i].articulo.clave_cubs:lista_articulos[i].articulo.clave_local,
          nombre:                 lista_articulos[i].articulo.articulo,
          descripcion:            lista_articulos[i].articulo.especificaciones,
          partida_clave:          lista_articulos[i].articulo.clave_partida_especifica,
          partida_descripcion:    lista_articulos[i].articulo.partida_especifica,
          familia:                lista_articulos[i].articulo.familia,
          empaque_detalle:        lista_articulos[i].articulo.empaque_detalle,
          tiene_fecha_caducidad:  (lista_articulos[i].articulo.tiene_fecha_caducidad)?true:false,
          tipo_articulo:          lista_articulos[i].articulo.tipo_bien_servicio,
          tipo_formulario:        lista_articulos[i].articulo.clave_form,
          en_catalogo:            (lista_articulos[i].articulo.en_catalogo_unidad)?true:false,
          normativo:              (lista_articulos[i].articulo.es_normativo)?true:false,
          descontinuado:          (lista_articulos[i].articulo.descontinuado)?true:false,
          cantidad_solicitada:    lista_articulos[i].cantidad_solicitada,
          total_monto: 0,
          no_lotes: 0,
          total_piezas: 0,
          total_recibido: 0,
          lotes: [],
        };
        
        listado_articulos.push(articulo);

        this.controlArticulosAgregados[articulo.id] = true;
        this.totalesRecibidos.claves += 1;
      }else{
        let index = listado_articulos.findIndex(x => x.id == lista_articulos[i].articulo.id);
        articulo = listado_articulos[index];                  
      }

      if(lista_articulos[i].cantidad > 0 || lista_articulos[i].cantidad_anterior > 0){
        articulo.no_lotes += 1;
        articulo.total_monto += lista_articulos[i].total_monto;

        let lote:any = {
          modo_movimiento:    lista_articulos[i].modo_movimiento,
          lote:               (lista_articulos[i].stock)?lista_articulos[i].stock.lote:lista_articulos[i].lote,
          fecha_caducidad:    (lista_articulos[i].stock)?lista_articulos[i].stock.fecha_caducidad:lista_articulos[i].fecha_caducidad,
          codigo_barras:      (lista_articulos[i].stock)?lista_articulos[i].stock.codigo_barras:lista_articulos[i].codigo_barras,
          no_serie:           (lista_articulos[i].stock)?lista_articulos[i].stock.no_serie:lista_articulos[i].no_serie,
          modelo:             (lista_articulos[i].stock)?lista_articulos[i].stock.modelo:lista_articulos[i].modelo,
          marca_id:           (lista_articulos[i].stock)?lista_articulos[i].stock.marca_id:lista_articulos[i].marca_id,
          marca:              (lista_articulos[i].stock && lista_articulos[i].stock.marca_id)?lista_articulos[i].stock.marca:(lista_articulos[i].marca_id)?lista_articulos[i].marca:'',
          empaque_detalle_id: (lista_articulos[i].stock)?lista_articulos[i].stock.empaque_detalle_id:lista_articulos[i].empaque_detalle_id,
          empaque_detalle:    (lista_articulos[i].stock)?lista_articulos[i].stock.empaque_detalle:null,
          precio_unitario:    lista_articulos[i].precio_unitario,
          iva:                lista_articulos[i].iva,
          total_monto:        lista_articulos[i].total_monto,
          memo_folio:         (lista_articulos[i].carta_canje)?lista_articulos[i].carta_canje.memo_folio:lista_articulos[i].memo_folio,
          memo_fecha:         (lista_articulos[i].carta_canje)?lista_articulos[i].carta_canje.memo_fecha:lista_articulos[i].memo_fecha,
          vigencia_meses:     (lista_articulos[i].carta_canje)?lista_articulos[i].carta_canje.vigencia_meses:lista_articulos[i].vigencia_meses,
        };
        
        if(lote.empaque_detalle_id && articulo.empaque_detalle){
          lote.empaque_detalle = articulo.empaque_detalle.find(x => x.id == lote.empaque_detalle_id);
        }

        if(tipo_movimiento_clave == 'RCPCN' && estatus == 'PERE'){
          lote.stock_id = (lista_articulos[i].stock)?lista_articulos[i].stock.id:undefined;
          lote.cantidad = (lista_articulos[i].cantidad_recibida === null)?lista_articulos[i].cantidad:lista_articulos[i].cantidad_recibida;
          lote.cantidad_enviada = lista_articulos[i].cantidad;
          lote.cantidad_recibida_anterior = lote.cantidad_enviada - lote.cantidad;
          articulo.total_recibido += lote.cantidad;
          articulo.total_piezas += lote.cantidad_enviada;
        }else if(tipo_movimiento_clave == 'RCPCN'){
          lote.cantidad = lista_articulos[i].cantidad;
          lote.cantidad_enviada = lista_articulos[i].cantidad_anterior;
          articulo.total_recibido += lote.cantidad;
          articulo.total_piezas += lote.cantidad_enviada;
        }else{
          articulo.total_piezas += lista_articulos[i].cantidad;
          lote.cantidad = lista_articulos[i].cantidad;
        }

        articulo.lotes.push(lote);

        if(this.modoRecepcion){
          this.totalesRecibidos.recibidos += lote.cantidad;
          this.totalesRecibidos.articulos += lote.cantidad_enviada;
        }else{
          this.totalesRecibidos.articulos += lote.cantidad;//lista_articulos[i].cantidad;
        }
        this.totalesRecibidos.monto += lista_articulos[i].total_monto;
      }
    }

    return listado_articulos;
  }

  cerrarListaUsuarios(event){
    if(event.code == 'Escape'){
      this.verListadoUsuarios = false;
    }
  }

  cargarDatosUsuarios(datos_movimiento){
    this.listadoEstatusUsuarios = [];
    if(datos_movimiento.cancelado_por){
      this.listadoEstatusUsuarios.push({
        'etiqueta': 'Cancelado por',
        'nombre': datos_movimiento.cancelado_por.name,
        'fecha': new Date(datos_movimiento.fecha_cancelacion+'T12:00:00'),
      });
    }

    if(datos_movimiento.concluido_por){
      this.listadoEstatusUsuarios.push({
        'etiqueta': 'Concluido por',
        'nombre': datos_movimiento.concluido_por.name,
        'fecha': new Date(datos_movimiento.updated_at),
      });
    }else if(datos_movimiento.modificado_por){
      this.listadoEstatusUsuarios.push({
        'etiqueta': 'Modificado por',
        'nombre': datos_movimiento.modificado_por.name,
        'fecha': new Date(datos_movimiento.updated_at),
      });
    }

    if(datos_movimiento.creado_por){
      this.listadoEstatusUsuarios.push({
        'etiqueta': 'Creado por',
        'nombre': datos_movimiento.creado_por.name,
        'fecha': new Date(datos_movimiento.created_at),
      });
    }
  }

  cargarColumnasArticulos(){
    if(this.modoRecepcion){
      if(this.tieneSolicitado){
        this.displayedColumns = ['estatus','clave','nombre','cantidad_solicitada','total_piezas','total_recibido','actions'];
      }else{
        this.displayedColumns = ['estatus','clave','nombre','no_lotes','total_piezas','total_recibido','actions'];
      }
      
    }else{
      this.displayedColumns = ['estatus','clave','nombre','no_lotes','total_piezas','total_monto','actions'];
    }
  }

  reconfigurarFormulario(mostrar_campos?:string[]){
    let grupoFields:any = {
      id: [''],
      tipo_movimiento_id: ['',Validators.required],
      turno_id: ['',Validators.required],
      fecha_movimiento: [new Date(),Validators.required], //Por default la fecha actual
      almacen_id: ['',Validators.required],
      documento_folio: new FormControl('',{ updateOn: 'blur' }), //[''],
      programa: ['',Validators.required],
      programa_id: [''],
      proveedor: [''],
      proveedor_id: [''],
      referencia_folio: new FormControl('',{ updateOn: 'blur' }), //[''],
      referencia_fecha: [''],
      observaciones: new FormControl('',{ updateOn: 'blur' }), //[''],
    };

    if(!mostrar_campos){
      this.datosForm = {
        id:true,
        tipo_movimiento_id:true,
        turno_id:true,
        fecha_movimiento:true,
        almacen_id: true,
        documento_folio:true,
        programa: true,
        programa_id: true,
        proveedor:true,
        proveedor_id: true,
        referencia_folio:true,
        referencia_fecha:true,
        observaciones: true,
      };
      this.formMovimiento = this.formBuilder.group(grupoFields);
    }else{
      this.datosForm = {};
      let nuevoGrupo:any = {};
      mostrar_campos.forEach(item =>{
        this.datosForm[item] = true;
        nuevoGrupo[item] = grupoFields[item];
      });
      this.formMovimiento = this.formBuilder.group(nuevoGrupo);
    }

    if(this.formMovimiento.get('almacen_id') && this.catalogos['almacenes'].length == 1){
      this.formMovimiento.get('almacen_id').patchValue(this.catalogos['almacenes'][0].id);
      this.checarAlmacenSeleccionado();
    }

    if(this.formMovimiento.get('proveedor')){
      this.filteredProveedores = this.formMovimiento.get('proveedor').valueChanges.pipe( startWith(''), map(value => typeof value === 'string' ? value : (value)?value.nombre:''),
                            map(nombre => nombre ? this._filter('proveedores',nombre,'nombre') : this.catalogos['proveedores'].slice())
                          );
    }

    if(this.formMovimiento.get('programa')){
      this.filteredProgramas = this.formMovimiento.get('programa').valueChanges.pipe( startWith(''), map(value => typeof value === 'string' ? value : (value)?value.descripcion:''),
                          map(descripcion => descripcion ? this._filter('programas',descripcion,'descripcion') : this.catalogos['programas'].slice())
                        );
    }
  }

  configurarDatosTemporales(){
    this.formMovimiento.valueChanges.subscribe(
      changes => {
        //this.estatusStorageIcon = 'difference';
        //this.verBoton.descartar_cambios = true;
        //this.localStorageService.setDatosFormulario(changes);
        this.guardarDatosTemporales('formulario');//,changes
      }
    );
  }

  guardarDatosTemporales(tipo:string){
    if(this.estatusStorageIcon != 'edit_note'){
      this.localStorageService.deleteDatos();
      this.estatusStorageIcon = 'edit_note';
      this.verBoton.descartar_cambios = true;
    }
    if(tipo == 'formulario'){
      this.localStorageService.setDatosFormulario(this.formMovimiento.value);
    }else if(tipo == 'lista_articulos'){
      let local_storage_id = (this.datosEntrada)?this.datosEntrada.id:'NV';
      this.localStorageService.setDatosListaArticulos(local_storage_id,this.dataSourceArticulos.data);
      this.localStorageService.setDatosGenerales(local_storage_id,this.totalesRecibidos);
    }
  }

  checarTipoMovimientoSeleccinado(){
    if(this.formMovimiento.get('tipo_movimiento_id') && this.formMovimiento.get('tipo_movimiento_id').value){
      this.checarTipoRecepcion(this.formMovimiento.get('tipo_movimiento_id').value);
    }
  }

  checarTipoRecepcion(tipo_movimiento_id:any){
    let tipo_movimiento = this.catalogos['tipos_movimiento'].find(x => x.id == tipo_movimiento_id);
    if(tipo_movimiento && tipo_movimiento.clave == 'RUMD'){
      if(!this.formMovimiento.get('unidad_medica_movimiento')){
        this.formMovimiento.addControl('unidad_medica_movimiento',new FormControl('',Validators.required));
        this.formMovimiento.addControl('unidad_medica_movimiento_id',new FormControl('',Validators.required));
        this.filteredUnidadesMedicas = this.formMovimiento.get('unidad_medica_movimiento').valueChanges.pipe( startWith(''), map(value => typeof value === 'string' ? value : (value)?value.nombre:''),
                              map(nombre => nombre ? this._filter('unidades_medicas',nombre,'nombre') : this.catalogos['unidades_medicas'].slice())
                            );
        this.formMovimiento.removeControl('proveedor');
        this.formMovimiento.removeControl('proveedor_id');
        this.filteredProveedores = null;
        this.datosForm.proveedor = false;
        this.datosForm.proveedor_id = false;
        this.datosForm.unidad_medica_movimiento = true;
        this.datosForm.unidad_medica_movimiento_id = true;
      }
    }else{
      if(!this.formMovimiento.get('proveedor')){
        this.formMovimiento.addControl('proveedor',new FormControl(''));
        this.formMovimiento.addControl('proveedor_id',new FormControl(''));
        this.filteredProveedores = this.formMovimiento.get('proveedor').valueChanges.pipe( startWith(''), map(value => typeof value === 'string' ? value : (value)?value.nombre:''),
                          map(nombre => nombre ? this._filter('proveedores',nombre,'nombre') : this.catalogos['proveedores'].slice())
                        );
        this.formMovimiento.removeControl('unidad_medica_movimiento');
        this.formMovimiento.removeControl('unidad_medica_movimiento_id');
        this.filteredUnidadesMedicas = null;
        this.datosForm.proveedor = true;
        this.datosForm.proveedor_id = true;
        this.datosForm.unidad_medica_movimiento = false;
        this.datosForm.unidad_medica_movimiento_id = false;
      }
    }
  }
  
  agregarArticulo(articulo){ 
    //console.log(articulo);
    if(this.controlArticulosAgregados[articulo.id]){
      let index = this.dataSourceArticulos.data.findIndex(x => x.id === articulo.id);
      articulo = this.dataSourceArticulos.data[index];
      this.dataSourceArticulos.data.splice(index,1);
    }else{
      this.controlArticulosAgregados[articulo.id] = true;
      this.controlArticulosModificados[articulo.id] = '+';
      this.totalesRecibidos.claves += 1;

      articulo.estatus = 1;
      articulo.total_monto = parseFloat('0');
      articulo.no_lotes = 0;
      articulo.total_piezas = 0;
      articulo.lotes = [];
    }

    if(!this.controlArticulosModificados[articulo.id]){
      this.controlArticulosModificados[articulo.id] = '*';
    }

    this.idArticuloSeleccionado = null;
    this.dataSourceArticulos.data.unshift(articulo);
    
    this.articulosTable.renderRows();
    this.dataSourceArticulos.paginator = this.articulosPaginator;
    this.dataSourceArticulos.sort = this.sort;

    this.expandirRow(articulo);
  }

  quitarArticulo(articulo){ 
    const dialogRef = this.dialog.open(ConfirmActionDialogComponent, {
      width: '500px',
      data:{dialogTitle:'Eliminar Articulo?',dialogMessage:'Esta seguro de eliminar este articulo?',btnColor:'warn',btnText:'Eliminar'}
    });

    dialogRef.afterClosed().subscribe(valid => {
      if(valid){
        this.controlArticulosAgregados[articulo.id] = false;
        
        this.totalesRecibidos.claves -= 1;
        this.totalesRecibidos.articulos -= articulo.total_piezas;
        this.totalesRecibidos.monto -= articulo.total_monto;

        let index = this.dataSourceArticulos.data.findIndex(x => x.id === articulo.id);

        //Guardar para papelera
        let articulo_copia = JSON.parse(JSON.stringify(this.dataSourceArticulos.data[index]));
        this.listadoArticulosEliminados.push(articulo_copia);

        this.dataSourceArticulos.data.splice(index,1);
        this.articulosTable.renderRows();
        this.dataSourceArticulos.paginator = this.articulosPaginator;
        this.dataSourceArticulos.sort = this.sort;

        this.idArticuloSeleccionado = null;
        this.guardarDatosTemporales('lista_articulos');
      }
    });
  }

  aplicarCambios(config:any){
    console.log(config);
    if(config.accion == 'EliminarArticulo'){
      let articulo = this.dataSourceArticulos.data.find(x => x.id == config.value);
      this.quitarArticulo(articulo);
    }else if(config.accion == 'ActualizarCantidades'){
      let articulo = this.dataSourceArticulos.data.find(x => x.id == config.value.id);
      this.totalesRecibidos.monto -= config.value.total_monto;
      this.totalesRecibidos.articulos -= config.value.total_piezas;

      this.totalesRecibidos.monto += articulo.total_monto;
      this.totalesRecibidos.articulos += articulo.total_piezas;

      if(this.modoRecepcion){
        this.totalesRecibidos.recibidos -= config.value.total_recibido;
        this.totalesRecibidos.recibidos += articulo.total_recibido;
      }

      this.guardarDatosTemporales('lista_articulos');
    }else if (config.accion == 'CambiosParaStorage'){
      if(config.value.agregar){
        this.guardarDatosTemporales('lista_articulos');
      }
    }
  }

  activarModificacionEntrada(){
    let configDialog = {
      width: '400px',
      //minHeight: '470px',
      height: 'auto',
      disableClose: true,
      data:{id:this.datosEntrada.id, modificacion: null},
      panelClass: 'no-padding-dialog'
    };

    if(this.datosEntrada && (this.datosEntrada.estatus == 'FIN' || this.datosEntrada.estatus == 'PERE')){
      if(this.datosEntrada.modificacion_activa){
        configDialog.data.modificacion = this.datosEntrada.modificacion_activa;
      }
      const dialogRef = this.dialog.open(DialogoModificarMovimientoComponent, configDialog);

      dialogRef.afterClosed().subscribe(dialogResponse => {
        if(dialogResponse){
          if(dialogResponse.estatus != 'CAN'){
            this.datosEntrada.modificacion_activa = dialogResponse;
            this.cargarDatosModificacion(dialogResponse);

            this.checarAlmacenSeleccionado();
            this.checarTipoRecepcion(this.datosEntrada.tipo_movimiento_id);
            this.formMovimiento.patchValue(this.datosEntrada);
          }else{
            this.datosEntrada.modificacion_activa = null;
            this.puedeEditarDatosEncabezado = false;
            this.verBoton.concluir_modificacion = false;
            this.verBoton.modificar_entrada = true;
            this.estatusMovimiento = this.datosEntrada.estatus;
          }
        }
      });
    }else{
      console.log('no encotnrado');
    }
  }

  cargarDatosModificacion(modificacion){
    this.estatusMovimiento = modificacion.estatus;
    if(modificacion.estatus == 'MOD' && modificacion.solicitado_usuario_id == this.authUser.id){
      this.puedeEditarDatosEncabezado = true;
      this.verBoton.concluir_modificacion = true;
      this.protegerDatosFormulario();
    }
  }

  protegerDatosFormulario(){
    let mostrar_campos:string[] = ['id','fecha_movimiento','turno_id','documento_folio','observaciones'];
    if(this.datosEntrada.tipo_movimiento.clave != 'RCPCN'){
      mostrar_campos.push('tipo_movimiento_id','proveedor','proveedor_id','referencia_folio','referencia_fecha');
    }
    this.reconfigurarFormulario(mostrar_campos);
  }

  concluirModificacion(){
    const dialogRef = this.dialog.open(ConfirmActionDialogComponent, {
      width: '500px',
      data:{dialogTitle:'Concluir Modificación?',dialogMessage:'Esta seguro de concluir las modificaciones? escriba CONCLUIR para confirmar la acción',validationString:'CONCLUIR',btnColor:'admin',btnText:'Concluir'}
    });

    dialogRef.afterClosed().subscribe(valid => {
      if(valid){
        this.isSaving = true;
        let params:any = this.formMovimiento.value;
        params.fecha_movimiento = this.datepipe.transform(params.fecha_movimiento, 'yyyy-MM-dd');
        params.proveedor_id = (params.proveedor)?params.proveedor.id:null;
        params.unidad_medica_movimiento_id = (params.unidad_medica_movimiento)?params.unidad_medica_movimiento.id:null;

        this.almacenService.guardarModificacion(this.datosEntrada.id,params).subscribe(
          response =>{
            if(response.error) {
              let errorMessage = response.error;
              //this.sharedService.showSnackBar(errorMessage, null, 3000);
              this.alertPanel.mostrarError('Error: '+errorMessage);
            }else{
              //this.sharedService.showSnackBar('Datos Guardados con Éxito', null, 3000);
              this.alertPanel.mostrarSucces('Datos Guardados con Éxito');

              response.data.modificacion.registro_original = JSON.parse(response.data.modificacion.registro_original);
              response.data.modificacion.registro_modificado = JSON.parse(response.data.modificacion.registro_modificado);
              
              if(response.data.modificacion.estatus == 'FIN'){
                this.datosEntrada = response.data.movimiento;
                this.estatusMovimiento = response.data.movimiento.estatus;
                this.puedeEditarDatosEncabezado = false;
                this.verBoton.concluir_modificacion = false;
                this.verBoton.modificar_entrada = true;
              }
            }
            this.isSaving = false;
          },
          errorResponse =>{
            var errorMessage = "Ocurrió un error.";
            if(errorResponse.status == 409){
              errorMessage = errorResponse.error.error.message;
            }
            //this.sharedService.showSnackBar(errorMessage, null, 3000);
            this.alertPanel.mostrarError('Error: '+errorMessage);
            this.isSaving = false;
          }
        );
      }
    });
  }
  
  concluirMovimiento(){
    const dialogRef = this.dialog.open(ConfirmActionDialogComponent, {
      width: '500px',
      data:{dialogTitle:'Concluir Movimiento?',dialogMessage:'Esta seguro de concluir esta entrada? escriba CONCLUIR para confirmar la acción',validationString:'CONCLUIR',btnColor:'primary',btnText:'Concluir'}
    });

    dialogRef.afterClosed().subscribe(valid => {
      if(valid){
        this.guardarMovimiento(true);
      }
    });
  }

  guardarMovimiento(concluir:boolean = false){
    if(this.formMovimiento.valid){
      this.isSaving = true;

      this.alertPanel.cerrarAlerta();
      
      let formData:any = this.formMovimiento.value;
      formData.lista_articulos = this.dataSourceArticulos.data;
      formData.concluir = concluir;

      if(this.modoRecepcion){ //El formulario no esta completo asi que se agregan los elementos requeridos
        formData.fecha_movimiento = this.datepipe.transform(formData.fecha_movimiento, 'yyyy-MM-dd');
        formData.almacen_id = this.datosEntrada.almacen_id;
        formData.tipo_movimiento_id = this.datosEntrada.tipo_movimiento_id;
        formData.programa_id = this.datosEntrada.programa_id;
      }else{
        formData.proveedor_id = (formData.proveedor)?formData.proveedor.id:null;
        formData.unidad_medica_movimiento_id = (formData.unidad_medica_movimiento)?formData.unidad_medica_movimiento.id:null;
        formData.programa_id = (formData.programa)?formData.programa.id:null;

        formData.fecha_movimiento = this.datepipe.transform(formData.fecha_movimiento, 'yyyy-MM-dd');
        if(formData.referencia_fecha){
          formData.referencia_fecha = this.datepipe.transform(formData.referencia_fecha, 'yyyy-MM-dd');
        }
      }
      
      this.entradasService.guardarEntrada(formData).subscribe(
        response =>{
          if(response.error) {
            let errorMessage = response.error;
            //this.sharedService.showSnackBar(errorMessage, null, 4000);
            this.alertPanel.mostrarError('Error: '+errorMessage);
          }else{
            this.formMovimiento.get('id').patchValue(response.data.id);

            if(this.estatusMovimiento == 'NV'){
              this.location.replaceState('/almacen/entradas/editar/'+response.data.id);
            }

            this.estatusMovimiento = response.data.estatus;
            this.datosEntrada = response.data;
            this.cargarDatosUsuarios(response.data);

            if(response.data.movimiento_padre){
              this.movimientoPadre = response.data.movimiento_padre;
            }
            
            if(this.estatusMovimiento != 'BOR' && this.estatusMovimiento != 'PERE'){
              this.puedeEditarDatosEncabezado = false;
              this.puedeEditarListaArticulos = false;

              this.verBoton.concluir = false;
              this.verBoton.guardar = false,
              this.verBoton.agregar_articulos = false;
              this.verBoton.eliminar = false;

              this.verBoton.duplicar = true;
              this.verBoton.cancelar = true;
              this.verBoton.modificar_entrada = true;
              this.verBoton.crear_salida = true;
            }
            this.controlArticulosModificados = {};
            this.alertPanel.mostrarSucces('Datos almacenados con Éxito');
            //this.sharedService.showSnackBar('Datos almacenados con éxito', null, 3000);
            this.estatusStorageIcon = '';
            this.verBoton.descartar_cambios = false;
            this.localStorageService.deleteDatos();
          }
          this.isSaving = false;
        },
        errorResponse =>{
          var errorMessage = "Ocurrió un error.";
          if(errorResponse.status == 409){
            errorMessage = errorResponse.error.error.message;
          }
          //this.sharedService.showSnackBar(errorMessage, null, 3000);
          this.alertPanel.mostrarError('Error: '+errorMessage);
          this.isSaving = false;
        }
      );
    }
  }

  descartarCambiosLocalStorage(){
    const dialogRef = this.dialog.open(ConfirmActionDialogComponent, {
      width: '500px',
      disableClose: true,
      data:{dialogTitle:'Descartar Cambios:',dialogMessage:'¿desea descartar todos los cambios no guardados?',btnColor:'accent',btnText:'Aceptar'}
    });

    dialogRef.afterClosed().subscribe(valid => {
      if(valid){
        this.estatusStorageIcon = '';
        this.verBoton.descartar_cambios = false;
        this.localStorageService.deleteDatos();
        this.idArticuloSeleccionado = null;
        this.cargarDatosMovimiento();
      }
    });
  }

  aplicarFiltroArticulos(event: Event){ 
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceArticulos.filter = filterValue.trim().toLowerCase();

    if(filterValue.trim().toLowerCase() == ''){
      this.filtroAplicado = false;
    }else{
      this.filtroAplicado = true;
    }
  }

  expandirRow(row){
    this.idArticuloSeleccionado = this.idArticuloSeleccionado === row.id ? null : row.id;
  }
  
  limpiarFiltroArticulos(){ 
    this.filtroArticulos = '';
    this.dataSourceArticulos.filter = '';
    this.filtroAplicado = false;
  }

  autoOpcionSeleccionada(valor:any,campo:string,parametro:string){
    if(this.formMovimiento.get(campo)){
      this.formMovimiento.get(campo).patchValue(valor[parametro]);
    }
  }

  validarOpcionSeleccionada(campo:string){
    setTimeout (() => {
      if(typeof this.formMovimiento.get(campo).value == 'string' && this.formMovimiento.get(campo).value != ''){
        this.formMovimiento.get(campo).setErrors({notSelected:true});
      }
    }, 100);
  }

  getDisplayFn(label: string){
    return (val) => this.displayFn(val,label);
  }

  displayFn(value: any, valueLabel: string){
    return value ? value[valueLabel] : '';
  }

  private _filter(catalogo: string, value: string, field: string): any[] {
    const filterValue = value.toLowerCase();

    return this.catalogos[catalogo].filter(option => option[field].toLowerCase().includes(filterValue));
  }

  cancelarEntrada(){
    let id:Number;
    if(this.formMovimiento.get('id')){
      id = this.formMovimiento.get('id').value;
    }else{
      id = this.datosEntrada.id;
    }

    let configDialog = {
      width: '350px',
      maxHeight: '90vh',
      height: '340px',
      data:{},
      panelClass: 'no-padding-dialog'
    };

    const dialogRef = this.dialog.open(DialogoCancelarMovimientoComponent, configDialog);

    dialogRef.afterClosed().subscribe(dialogResponse => {
      if(dialogResponse){
        this.entradasService.cancelarEntrada(id,dialogResponse).subscribe(
          response =>{
            if(response.error) {
              if(response.data){
                let configDialog = {
                  width: '50%',
                  maxHeight: '90vh',
                  height: '343px',
                  data:{error:response.error, data:response.data},
                  panelClass: 'no-padding-dialog'
                };
            
                const dialogRef = this.dialog.open(DialogoCancelarResultadoComponent, configDialog);
              }else{
                let errorMessage = response.error;
                //this.sharedService.showSnackBar(errorMessage, null, 4000);
                this.alertPanel.mostrarError('Error: '+errorMessage);
              }
            }else{
              //this.sharedService.showSnackBar('Movimiento cancelado con exito', null, 3000);
              this.alertPanel.mostrarSucces('Movimiento Cancelado con Éxito');
              this.estatusMovimiento = 'CAN';
              this.cargarDatosUsuarios(response.data);
            }
          },
          errorResponse =>{
            var errorMessage = "Ocurrió un error.";
            if(errorResponse.status == 409){
              errorMessage = errorResponse.error.error.message;
            }
            //this.sharedService.showSnackBar(errorMessage, null, 3000);
            this.alertPanel.mostrarError('Error: '+errorMessage);
            //this.isLoadingPDF = false;
          }
        );
      }
    });
  }

  eliminarEntrada(){
    let id:Number;
    if(this.formMovimiento.get('id')){
      id = this.formMovimiento.get('id').value;
    }else{
      id = this.datosEntrada.id;
    }
    
    const dialogRef = this.dialog.open(ConfirmActionDialogComponent, {
      width: '500px',
      data:{dialogTitle:'Eliminar Movimiento?',dialogMessage:'Esta seguro de eliminar esta entrada?',btnColor:'warn',btnText:'Eliminar'}
    });

    dialogRef.afterClosed().subscribe(valid => {
      if(valid){
        this.isLoading = true;
        this.entradasService.eliminarEntrada(id).subscribe(
          response =>{
            if(response.error) {
              let errorMessage = response.error.message;
              //this.sharedService.showSnackBar(errorMessage, null, 3000);
              this.alertPanel.mostrarError('Error: '+errorMessage);
            }else{
              //this.sharedService.showSnackBar('Movimiento eliminado con exito', null, 3000);
              //this.alertPanel.mostrarSucces('Datos Guardados con Éxito');
              this.router.navigateByUrl('/almacen/entradas');
            }
            this.isLoading = false;
          },
          errorResponse =>{
            var errorMessage = "Ocurrió un error.";
            if(errorResponse.status == 409){
              errorMessage = errorResponse.error.error.message;
            }
            //this.sharedService.showSnackBar(errorMessage, null, 3000);
            this.alertPanel.mostrarError('Error: '+errorMessage);
            this.isLoading = false;
          }
        );
      }
    });
  }

  generarPDF(){
    this.isLoading = true;
    let id:Number;
    if(this.formMovimiento.get('id')){
      id = this.formMovimiento.get('id').value;
    }else{
      id = this.datosEntrada.id;
    }
    
    this.entradasService.verEntrada(id).subscribe(
      response =>{
        if(response.error) {
          let errorMessage = response.error.message;
          //this.sharedService.showSnackBar(errorMessage, null, 3000);
          this.alertPanel.mostrarError('Error: '+errorMessage);
        }else{
          if(response.data){
            let fecha_reporte = new Intl.DateTimeFormat('es-ES', {year: 'numeric', month: 'numeric', day: '2-digit'}).format(new Date());

            const reportWorker = new ReportWorker();
            reportWorker.onmessage().subscribe(
              data => {
                FileSaver.saveAs(data.data,'Almacen-Entrada '+'('+fecha_reporte+')');
                reportWorker.terminate();
                this.isLoading = false;
            });

            reportWorker.onerror().subscribe(
              (data) => {
                //this.sharedService.showSnackBar(data.message, null, 3000);
                this.alertPanel.mostrarInfo('Mensaje: '+data.message);
                this.isLoading = false;
                reportWorker.terminate();
              }
            );
            
            let config = {
              mostrar_montos:false,
              /*firmas:[
                {etiqueta:'REALIZÓ', nombre:'Nombre del usuario', cargo:''},
                {etiqueta:'RECIBIÓ', nombre:'', cargo:''},
                {etiqueta:'REVISÓ', nombre:'Nombre del encargado',cargo:'Encargado de almacén'},
              ]*/
            };

            reportWorker.postMessage({data:{items: response.data, config:config, fecha_actual: this.maxFechaMovimiento},reporte:'almacen/entrada'});
            //this.isLoading = false;
          }
        }
      },
      errorResponse =>{
        var errorMessage = "Ocurrió un error.";
        if(errorResponse.status == 409){
          errorMessage = errorResponse.error.error.message;
        }
        //this.sharedService.showSnackBar(errorMessage, null, 3000);
        this.alertPanel.mostrarError('Error: '+errorMessage);
        //this.isLoadingPDF = false;
      }
    );
  }

  cargarNuevaEntrada(uri:string){
    this.router.navigateByUrl('/', {skipLocationChange: true}).then(()=>
    this.router.navigate([uri]));
  }
}
