import { Component, OnInit, ViewChild, NgZone } from '@angular/core';
import { SharedService } from '../../../shared/shared.service';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { MatTable } from '@angular/material/table';
import { MediaObserver } from '@angular/flex-layout';
import { SalidasService } from '../salidas.service';
import { AlmacenService } from '../../almacen.service';

import { ReportWorker } from '../../../web-workers/report-worker';
import * as FileSaver from 'file-saver';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { ConfirmActionDialogComponent } from 'src/app/utils/confirm-action-dialog/confirm-action-dialog.component';
import { DialogoCancelarMovimientoComponent } from '../../tools/dialogo-cancelar-movimiento/dialogo-cancelar-movimiento.component';
import { DatePipe } from '@angular/common';
import { DialogoModificarMovimientoComponent } from '../../tools/dialogo-modificar-movimiento/dialogo-modificar-movimiento.component';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.css']
})
export class ListaComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatTable) usersTable: MatTable<any>;
  
  constructor(private datepipe: DatePipe, private sharedService: SharedService, private salidasService: SalidasService, private almacenService: AlmacenService, public dialog: MatDialog, public mediaObserver: MediaObserver) { }

  isLoading: boolean = false;
  mediaSize: string;
  isLoadingPDF: boolean = false;
  isLoadingPDFArea: boolean = false;
  isLoadingAgent: boolean = false;

  showMyStepper:boolean = false;
  showReportForm:boolean = false;
  stepperConfig:any = {};
  reportTitle:string;
  reportIncludeSigns:boolean = false;

  filtroAplicado: boolean;
  filtros: any = {estatus:false,almacen_id:false, tipo_movimiento_id:false, rango_fechas:{inicio:null, fin:null}};
  filtrosCatalogos: any = {almacenes:[],tipos_movimiento:[],estatus:[]};
  searchQuery: string = '';

  pageEvent: PageEvent;
  resultsLength: number = 0;
  currentPage: number = 0;
  pageSize: number = 20;
  selectedItemIndex: number = -1;

  listaEstatusIconos: any = { 'BOR':'content_paste',  'FIN':'assignment_turned_in',   'CAN':'cancel',     'PERE':'pending_actions',       'SOL':'edit_notifications',         'MOD':'note_alt'};
  listaEstatusClaves: any = { 'BOR':'borrador',       'FIN':'concluido',              'CAN':'cancelado',  'PERE':'pendiente-recepcion',   'SOL':'peticion-modificacion',      'MOD':'modificacion-aprobada'};
  listaEstatusLabels: any = { 'BOR':'Borrador',       'FIN':'Concluido',              'CAN':'Cancelado',  'PERE':'Pendiente de Recepción','SOL':'Petición de Modificación',   'MOD':'Modificación Activa'};

  displayedColumns: string[] = ['id','folio','almacen_turno','fecha_movimiento','totales_claves','dato_usuario','actions']; //,'descripcion','proveedor'
  listadoMovimientos: any = [];
  objetoMovimiento:any;

  fechaActual:Date = new Date();

  ngOnInit() {
    this.mediaObserver.media$.subscribe(
      response => {
        this.mediaSize = response.mqAlias;
    });
    
    this.loadListadoMovimientos();

    let lista_catalogos:any = {almacenes:'*',tipos_movimiento:'movimiento.SAL',estatus_movimientos:'*'};

    this.almacenService.obtenerMovimientoCatalogos(lista_catalogos).subscribe(
      response =>{
        if(response.error) {
          let errorMessage = response.error.message;
          this.sharedService.showSnackBar(errorMessage, null, 3000);
        } else {
          this.filtrosCatalogos.almacenes = response.data.almacenes;
          this.filtrosCatalogos.tipos_movimiento = response.data.tipos_movimiento;
          this.filtrosCatalogos.estatus = response.data.estatus_movimientos;
        }
        this.isLoading = false;
      },
      errorResponse =>{
        var errorMessage = "Ocurrió un error.";
        if(errorResponse.status == 409){
          errorMessage = errorResponse.error.error.message;
        }
        this.sharedService.showSnackBar(errorMessage, null, 3000);
        this.isLoading = false;
      }
    );
  }

  loadListadoMovimientos(event?){
    this.isLoading = true;
    let params:any;
    if(!event){
      params = { page: 1, per_page: this.pageSize }
    }else{
      params = {
        page: event.pageIndex+1,
        per_page: event.pageSize
      };
    }

    if(event && !event.hasOwnProperty('selectedIndex')){
      this.selectedItemIndex = -1;
    }
    
    params.query = this.searchQuery;
    this.listadoMovimientos = [];
    this.resultsLength = 0;

    if(this.filtros.almacen_id){
      params.almacen_id = this.filtros.almacen_id;
    }

    if(this.filtros.tipo_movimiento_id){
      params.tipo_movimiento_id = this.filtros.tipo_movimiento_id;
    }

    if(this.filtros.estatus){
      params.estatus = this.filtros.estatus;
    }

    if(this.filtros.rango_fechas.inicio){
      params.fecha_inicio = this.datepipe.transform(this.filtros.rango_fechas.inicio, 'yyyy-MM-dd');
      params.fecha_fin = this.datepipe.transform(this.filtros.rango_fechas.fin, 'yyyy-MM-dd');
    }
    
    this.salidasService.getListadoSalidas(params).subscribe(
      response =>{
        if(response.error) {
          let errorMessage = response.error.message;
          this.sharedService.showSnackBar(errorMessage, null, 3000);
        } else {
          if(response.data.total > 0){
            let lista_items = response.data.data;
            lista_items.forEach(element => {

              if((element.estatus == 'FIN' || element.estatus == 'PERE') && element.modificacion_activa){
                element.estatus_clave = this.listaEstatusClaves[element.modificacion_activa.estatus];
                element.estatus_label = this.listaEstatusLabels[element.modificacion_activa.estatus];
                element.estatus_icono = this.listaEstatusIconos[element.modificacion_activa.estatus];
              }else{
                element.estatus_clave = this.listaEstatusClaves[element.estatus];
                element.estatus_label = this.listaEstatusLabels[element.estatus];
                element.estatus_icono = this.listaEstatusIconos[element.estatus];
              }

              if(element.unidad_destino){
                element.destino = element.unidad_destino;
              }else if(element.almacen_destino){
                element.destino = element.almacen_destino;
              }else if(element.area_servicio_destino){
                element.destino = element.area_servicio_destino;
              }else if(element.paciente_id){
                element.destino = 'Folio '+element.documento_folio;
              }

              if(element.eliminado_por_usuario_id){
                element.usuario = element.eliminado_por;
              }else if(element.cancelado_por_usuario_id){
                element.usuario = element.cancelado_por;
              }else if(element.modificado_por_usuario_id){
                element.usuario = element.modificado_por;
              }else if(element.concluido_por_usuario_id){
                element.usuario = element.concluido_por;
              }
            });
            this.listadoMovimientos = response.data.data;
            this.resultsLength = response.data.total;
          }
        }
        this.isLoading = false;
      },
      errorResponse =>{
        var errorMessage = "Ocurrió un error.";
        if(errorResponse.status == 409){
          errorMessage = errorResponse.error.error.message;
        }
        this.sharedService.showSnackBar(errorMessage, null, 3000);
        this.isLoading = false;
      }
    );
    
    return event;
  }

  eliminarEntrada(id){
    console.log('eliminar : '+id);
  }

  applyFilter(){
    this.selectedItemIndex = -1;
    this.paginator.pageIndex = 0;
    this.paginator.pageSize = this.pageSize;
    this.loadListadoMovimientos(null);
  }

  cleanSearch(){
    this.searchQuery = '';
  }

  activarModificacionSalida(id){
    let configDialog = {
      width: '400px',
      //minHeight: '470px',
      height: 'auto',
      disableClose: true,
      data:{id:id, modificacion: null},
      panelClass: 'no-padding-dialog'
    };

    let movimiento = this.listadoMovimientos.find(x => x.id == id);
    if(movimiento){
      if(movimiento.modificacion_activa){
        configDialog.data.modificacion = movimiento.modificacion_activa;
      }
      const dialogRef = this.dialog.open(DialogoModificarMovimientoComponent, configDialog);

      dialogRef.afterClosed().subscribe(dialogResponse => {
        if(dialogResponse){
          let movimiento = this.listadoMovimientos.find(x => x.id == id);
          if(dialogResponse.estatus != 'CAN'){
            movimiento.modificacion_activa = dialogResponse;
            movimiento.estatus_clave = this.listaEstatusClaves[dialogResponse.estatus];
            movimiento.estatus_label = this.listaEstatusLabels[dialogResponse.estatus];
            movimiento.estatus_icono = this.listaEstatusIconos[dialogResponse.estatus];
          }else{
            movimiento.modificacion_activa = null;
            movimiento.estatus_clave = this.listaEstatusClaves[movimiento.estatus];
            movimiento.estatus_label = this.listaEstatusLabels[movimiento.estatus];
            movimiento.estatus_icono = this.listaEstatusIconos[movimiento.estatus];
          }
          
          //console.log(dialogResponse);
        }
      });
    }else{
      console.log('no encotnrado');
    }
  }

  cancelarSalida(id){
    let configDialog = {
      width: '350px',
      //maxHeight: '90vh',
      height: 'auto',
      data:{},
      panelClass: 'no-padding-dialog'
    };

    const dialogRef = this.dialog.open(DialogoCancelarMovimientoComponent, configDialog);

    dialogRef.afterClosed().subscribe(dialogResponse => {
      if(dialogResponse){
        this.salidasService.cancelarSalida(id,dialogResponse).subscribe(
          response =>{
            if(response.error) {
              let errorMessage = response.error;
              this.sharedService.showSnackBar(errorMessage, null, 3000);
            }else{
              this.sharedService.showSnackBar('Movimiento cancelado con exito', null, 3000);
              this.loadListadoMovimientos();
            }
          },
          errorResponse =>{
            var errorMessage = "Ocurrió un error.";
            if(errorResponse.status == 409){
              errorMessage = errorResponse.error.error.message;
            }
            this.sharedService.showSnackBar(errorMessage, null, 3000);            
          }
        );
      }
    });
  }

  eliminarSalida(id){
    const dialogRef = this.dialog.open(ConfirmActionDialogComponent, {
      width: '500px',
      data:{dialogTitle:'Eliminar Movimiento?',dialogMessage:'Esta seguro de eliminar esta salida?',btnColor:'warn',btnText:'Eliminar'}
    });

    dialogRef.afterClosed().subscribe(valid => {
      if(valid){
        this.salidasService.eliminarSalida(id).subscribe(
          response =>{
            if(response.error) {
              let errorMessage = response.error.message;
              this.sharedService.showSnackBar(errorMessage, null, 3000);
            }else{
              this.sharedService.showSnackBar('Movimiento eliminado con exito', null, 3000);
              this.loadListadoMovimientos();
            }
          },
          errorResponse =>{
            var errorMessage = "Ocurrió un error.";
            if(errorResponse.status == 409){
              errorMessage = errorResponse.error.error.message;
            }
            this.sharedService.showSnackBar(errorMessage, null, 3000);
            //this.isLoadingPDF = false;
          }
        );
      }
    });
  }

  obtenerSalida(id){
    this.isLoading = true;

    this.objetoMovimiento = "";

    this.salidasService.verSalida(id).subscribe(
      response =>{
        console.log("get api",response);
        if(response.error) {
          let errorMessage = response.error.message;
          this.sharedService.showSnackBar(errorMessage, null, 3000);
        }else{

          if(response.data){
            let lista_items = response.data;
              lista_items.estatus_clave = this.listaEstatusClaves[lista_items.estatus];
              lista_items.estatus_label = this.listaEstatusLabels[lista_items.estatus];
              lista_items.estatus_icono = this.listaEstatusIconos[lista_items.estatus];
            this.objetoMovimiento = response.data;
            console.log(this.objetoMovimiento);
            this.generarSalidaPDF(this.objetoMovimiento);
          }
  
        }
        this.isLoading = false;
      },
      errorResponse =>{
        var errorMessage = "Ocurrió un error.";
        if(errorResponse.status == 409){
          errorMessage = errorResponse.error.error.message;
        }
        this.sharedService.showSnackBar(errorMessage, null, 3000);
        this.isLoading = false;
      }
    );

  }

  limpiarFiltro(){
    this.filtros.almacen_id = false;
    this.filtros.tipo_movimiento_id = false;
    this.filtros.rango_fechas = {inicio:null, fin:null};
    this.filtros.estatus = false;
    this.aplicarFiltro();
  }

  checarFechasFiltro(){
    if(this.filtros.rango_fechas.inicio && !this.filtros.rango_fechas.fin){
      this.filtros.rango_fechas.fin = this.filtros.rango_fechas.inicio;
    }
    this.aplicarFiltro();
  }

  aplicarFiltro(){
    this.loadListadoMovimientos();
    //console.log(this.filtros);
  }


  generarSalidaPDF(obj){

    console.log("aca en el objeto",obj);

    //this.selectedItemIndex = index;

      this.showMyStepper = true;
      this.isLoadingPDF = true;
      this.showMyStepper = true;
      this.showReportForm = false;

      let params:any = {};
      let countFilter = 0;
      let fecha_reporte = new Intl.DateTimeFormat('es-ES', {year: 'numeric', month: 'numeric', day: '2-digit'}).format(new Date());

      let appStoredData = this.sharedService.getArrayDataFromCurrentApp(['searchQuery','filter']);
      
      params.reporte = 'almacen-salida';
      if(appStoredData['searchQuery']){
        params.query = appStoredData['searchQuery'];
      }
      this.stepperConfig = {
        steps:[
          {
            status: 1, //1:standBy, 2:active, 3:done, 0:error
            label: { standBy: 'Cargar Datos', active: 'Cargando Datos', done: 'Datos Cargados' },
            icon: 'settings_remote',
            errorMessage: '',
          },
          {
            status: 1, //1:standBy, 2:active, 3:done, 0:error
            label: { standBy: 'Generar PDF', active: 'Generando PDF', done: 'PDF Generado' },
            icon: 'settings_applications',
            errorMessage: '',
          },
          {
            status: 1, //1:standBy, 2:active, 3:done, 0:error
            label: { standBy: 'Descargar Archivo', active: 'Descargando Archivo', done: 'Archivo Descargado' },
            icon: 'save_alt',
            errorMessage: '',
          },
        ],
        currentIndex: 0
      }


      this.stepperConfig.steps[0].status = 2;

      this.stepperConfig.steps[0].status = 3;
      this.stepperConfig.steps[1].status = 2;
      this.stepperConfig.currentIndex = 1;

      const reportWorker = new ReportWorker();
      reportWorker.onmessage().subscribe(
        data => {
          this.stepperConfig.steps[1].status = 3;
          this.stepperConfig.steps[2].status = 2;
          this.stepperConfig.currentIndex = 2;

          FileSaver.saveAs(data.data,'Almacen-Salida '+'('+fecha_reporte+')');
          reportWorker.terminate();

          this.stepperConfig.steps[2].status = 3;
          this.isLoadingPDF = false;
          this.showMyStepper = false;
      });

      reportWorker.onerror().subscribe(
        (data) => {
          this.stepperConfig.steps[this.stepperConfig.currentIndex].status = 0;
          this.stepperConfig.steps[this.stepperConfig.currentIndex].errorMessage = data.message;
          this.isLoadingPDF = false;
          reportWorker.terminate();
        }
      );
      
      let config = {
        mostrar_montos:false,
      };
      reportWorker.postMessage({data:{items: obj, config:config, fecha_actual: this.fechaActual},reporte:'almacen/salida'});
      this.isLoading = false;
  }

}
