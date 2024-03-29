import { Component, OnInit, ViewChild, NgZone } from '@angular/core';
import { SharedService } from '../../../shared/shared.service';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { MatTable } from '@angular/material/table';
import { MediaObserver } from '@angular/flex-layout';
import { EntradasService } from '../entradas.service';
import { AlmacenService } from '../../almacen.service';
import { ReportWorker } from '../../../web-workers/report-worker';
import { ConfirmActionDialogComponent } from 'src/app/utils/confirm-action-dialog/confirm-action-dialog.component';
import { DialogoCancelarResultadoComponent } from '../dialogo-cancelar-resultado/dialogo-cancelar-resultado.component';
import { DialogoCancelarMovimientoComponent } from '../../tools/dialogo-cancelar-movimiento/dialogo-cancelar-movimiento.component';
import { DialogoSubirArchivoComponent } from '../dialogo-subir-archivo/dialogo-subir-archivo.component';
import { DatePipe } from '@angular/common';
import { DialogoModificarMovimientoComponent } from '../../tools/dialogo-modificar-movimiento/dialogo-modificar-movimiento.component';
import { MovimientosLocalStorageService } from '../../tools/movimientos-local-storage.service';
import { Router } from '@angular/router';

import * as FileSaver from 'file-saver';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { DialogoResolverConflictoComponent } from '../dialogo-resolver-conflicto/dialogo-resolver-conflicto.component';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.css']
})
export class ListaComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatTable) usersTable: MatTable<any>;

  constructor(
    private datepipe: DatePipe, 
    private sharedService: SharedService, 
    private entradasService: EntradasService, 
    private almacenService: AlmacenService, 
    public dialog: MatDialog, 
    public mediaObserver: MediaObserver, 
    private localStorageService: MovimientosLocalStorageService, 
    private router: Router){ }

  isLoading: boolean = false;
  mediaSize: string;
  isLoadingPDF: boolean = false;
  isLoadingPDFArea: boolean = false;
  isLoadingAgent: boolean = false;

  datosRecuperados:any;

  showMyStepper:boolean = false;
  showReportForm:boolean = false;
  stepperConfig:any = {};
  reportTitle:string;
  reportIncludeSigns:boolean = false;

  filtroAplicado: boolean;
  filtros: any = {estatus:false, almacen_id:false, tipo_movimiento_id:false, rango_fechas:{inicio:null, fin:null}};
  filtrosCatalogos: any = {almacenes:[],tipos_movimiento:[],estatus:[]};
  searchQuery: string = '';

  pageEvent: PageEvent;
  resultsLength: number = 0;
  currentPage: number = 0;
  pageSize: number = 20;
  selectedItemIndex: number = -1;
  
  listaEstatusIconos: any;
  listaEstatusClaves: any;
  listaEstatusLabels: any;

  displayedColumns: string[] = ['id','folio','folio_referencia','almacen','fecha_movimiento','totales_claves_articulos','total_monto','dato_usuario','actions']; //,'descripcion','proveedor','programa', 'total_articulos'
  listadoMovimientos: any = [];
  objetoMovimiento:any;

  fechaActual:Date = new Date();

  ngOnInit() {
    this.listaEstatusIconos = this.almacenService.listaIconos;
    this.listaEstatusClaves = this.almacenService.listaClaves;
    this.listaEstatusLabels = this.almacenService.listaEtiquetas;

    this.localStorageService.tipoMovimiento = 'entradas';
    this.datosRecuperados = this.localStorageService.getDatosID();
    this.mediaObserver.media$.subscribe(
      response => {
        this.mediaSize = response.mqAlias;
    });

    let filtros_recibidos = history.state.filtros;
    if(filtros_recibidos){
      let filtros = Object.keys(filtros_recibidos);
      filtros.forEach(element => {
        this.filtros[element] = filtros_recibidos[element];
      });
    }
    
    this.loadListadoMovimientos();

    let lista_catalogos:any = {almacenes:'*',tipos_movimiento:'movimiento.ENT',estatus_movimientos:'*'};

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

  recuperarDatos(){
    //this.router.navigateByUrl('/', {skipLocationChange: true}).then(()=>);
    if(this.datosRecuperados.id == 'NV'){
      this.router.navigate(['/almacen/entradas/nueva'],{state:{data:{recuperacion:true}}});
    }else{
      this.router.navigate(['/almacen/entradas/editar/'+this.datosRecuperados.id]);
    }
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

    if(this.filtros.estatus){
      params.estatus = this.filtros.estatus;
    }

    if(this.filtros.almacen_id){
      params.almacen_id = this.filtros.almacen_id;
    }

    if(this.filtros.tipo_movimiento_id){
      params.tipo_movimiento_id = this.filtros.tipo_movimiento_id;
    }

    if(this.filtros.especiales){
      params.especiales = JSON.stringify(this.filtros.especiales);
    }

    if(this.filtros.rango_fechas.inicio){
      params.fecha_inicio = this.datepipe.transform(this.filtros.rango_fechas.inicio, 'yyyy-MM-dd');
      params.fecha_fin = this.datepipe.transform(this.filtros.rango_fechas.fin, 'yyyy-MM-dd');
    }

    this.entradasService.getListadoEntradas(params).subscribe(
      response =>{
        if(response.error) {
          let errorMessage = response.error.message;
          this.sharedService.showSnackBar(errorMessage, null, 3000);
        } else {
          if(response.data.total > 0){
            let lista_items = response.data.data;
            lista_items.forEach(element => {

              if((element.estatus == 'FIN') && element.modificacion_activa){
                element.estatus_clave = this.listaEstatusClaves[element.modificacion_activa.estatus];
                element.estatus_label = this.listaEstatusLabels[element.modificacion_activa.estatus];
                element.estatus_icono = this.listaEstatusIconos[element.modificacion_activa.estatus];
              }else{
                element.estatus_clave = this.listaEstatusClaves[element.estatus];
                element.estatus_label = this.listaEstatusLabels[element.estatus];
                element.estatus_icono = this.listaEstatusIconos[element.estatus];
              }

              if(!element.folio){
                element.folio = 'Sin Folio';
                if(element.estatus == 'PERE'){
                  element.folio += ' (Pendiente de Recepción)';
                }else if(element.estatus == 'BOR'){
                  element.folio += ' (En Borrador)';
                }else if(element.estatus == 'CAN'){
                  element.folio += ' (Rechazado)';
                }
              }

              if(element.unidad_origen){
                element.origen = element.unidad_origen;
              }else if(element.almacen_origen){
                element.origen = element.almacen_origen;
              }else if(element.proveedor){
                element.origen = element.proveedor;
              }

              if(element.eliminado_por_usuario_id){
                element.usuario = element.eliminado_por;
              }else if(element.cancelado_por_usuario_id){
                element.usuario = element.cancelado_por;
              }else if(element.concluido_por_usuario_id){
                element.usuario = element.concluido_por;
              }else if(element.modificado_por_usuario_id){
                element.usuario = element.modificado_por;
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
    const dialogRef = this.dialog.open(ConfirmActionDialogComponent, {
      width: '500px',
      data:{dialogTitle:'Eliminar Movimiento?',dialogMessage:'Esta seguro de eliminar esta entrada?',btnColor:'warn',btnText:'Eliminar'}
    });

    dialogRef.afterClosed().subscribe(valid => {
      if(valid){
        this.entradasService.eliminarEntrada(id).subscribe(
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

  activarModificacionEntrada(id){
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
      console.log('no encontrado');
    }
  }

  resolverConflictoEntrada(id){
    let configDialog = {
      width: '80%',
      height: '80%',
      disableClose: true,
      data:{id:id},
      panelClass: 'no-padding-dialog'
    };

    //if(this.datosEntrada && (this.datosEntrada.estatus == 'CONF')){
      const dialogRef = this.dialog.open(DialogoResolverConflictoComponent, configDialog);

      dialogRef.afterClosed().subscribe(dialogResponse => {
        if(dialogResponse){
          //this.router.navigateByUrl('/', {skipLocationChange: true}).then(()=>this.router.navigate(['/almacen/entradas']));
          this.loadListadoMovimientos();
        }
      });
    //}else{
    //}
  }

  cancelarEntrada(id){
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
              let configDialog = {
                width: '50%',
                maxHeight: '90vh',
                height: '343px',
                data:{error:response.error, data:response.data},
                panelClass: 'no-padding-dialog'
              };
          
              const dialogRef = this.dialog.open(DialogoCancelarResultadoComponent, configDialog);
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
            //this.isLoadingPDF = false;
          }
        );
      }
    });
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

  obtenerEntrada(id){

    //this.isLoadingPDF = true;
    this.showMyStepper = true;
    this.showReportForm = true;
    this.showReportForm = false;
    
    this.objetoMovimiento = "";
    this.entradasService.verEntrada(id).subscribe(
      response =>{
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
            //console.log(this.objetoMovimiento);
            this.generarEntradaPDF(this.objetoMovimiento);
            
          }
  
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

  limpiarFiltro(){
    this.filtros.almacen_id = false;
    this.filtros.tipo_movimiento_id = false;
    this.filtros.rango_fechas = {inicio:null, fin:null};
    this.filtros.estatus = false;
    this.filtros.especiales = undefined;
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

  verDialogoSubirArchivo(){
    let configDialog:any = {
      width: '99%',
      //height: '50%',
      maxHeight: '100vh',
      panelClass: 'no-padding-dialog'
    };

    configDialog.data = {pedidoId: 0};
    
    const dialogRef = this.dialog.open(DialogoSubirArchivoComponent, configDialog);

    dialogRef.afterClosed().subscribe(response => {
      if(response){
        this.loadListadoMovimientos();
      }
    });
  }

  generarEntradaPDF(obj){
      this.isLoadingPDF = true;
      this.showMyStepper = true;
      this.showReportForm = false;

      let params:any = {};
      let countFilter = 0;
      let fecha_reporte = new Intl.DateTimeFormat('es-ES', {year: 'numeric', month: 'numeric', day: '2-digit'}).format(new Date());

      let appStoredData = this.sharedService.getArrayDataFromCurrentApp(['searchQuery','filter']);
      
      params.reporte = 'almacen-entrada';
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

          FileSaver.saveAs(data.data,'Almacen-Entrada '+'('+fecha_reporte+')');
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
        vacunas: true,
      };
      reportWorker.postMessage({data:{items: obj, config:config, fecha_actual: this.fechaActual},reporte:'almacen/entrada'});
      this.isLoading = false;
  }

}
