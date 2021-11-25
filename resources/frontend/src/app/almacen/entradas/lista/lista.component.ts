import { Component, OnInit, ViewChild, NgZone } from '@angular/core';
import { SharedService } from '../../../shared/shared.service';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { MatTable } from '@angular/material/table';
import { MediaObserver } from '@angular/flex-layout';
import { EntradasService } from '../entradas.service';
//import { FormulariosService } from '../formularios.service';

import { ReportWorker } from '../../../web-workers/report-worker';
import * as FileSaver from 'file-saver';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.css']
})
export class ListaComponent implements OnInit {
  
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

  

  searchQuery: string = '';

  pageEvent: PageEvent;
  resultsLength: number = 0;
  currentPage: number = 0;
  pageSize: number = 20;
  selectedItemIndex: number = -1;

  listaEstatusIconos: any = { 'ME-BR':'content_paste',  'ME-FI':'description', 'ME-CA':'cancel'  };
  listaEstatusClaves: any = { 'ME-BR':'borrador',       'ME-FI':'concluido',   'ME-CA':'cancelado' };
  listaEstatusLabels: any = { 'ME-BR':'Borrador',       'ME-FI':'Concluido',   'ME-CA':'Cancelado' };

  displayedColumns: string[] = ['id','almacen','programa','descripcion','fecha_movimiento','totales_claves_articulos','actions'];
  listadoMovimientos: any = [];
  objetoMovimiento:any;

  fechaActual:Date = new Date();

  constructor(private sharedService: SharedService, private entradasService: EntradasService, public dialog: MatDialog, public mediaObserver: MediaObserver) { }

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatTable) usersTable: MatTable<any>;

  ngOnInit() {
    this.mediaObserver.media$.subscribe(
      response => {
        this.mediaSize = response.mqAlias;
    });
    
    this.loadListadoMovimientos();
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
    
    this.entradasService.getListadoEntradas(params).subscribe(
      response =>{
        if(response.error) {
          let errorMessage = response.error.message;
          this.sharedService.showSnackBar(errorMessage, null, 3000);
        } else {
          if(response.data.total > 0){
            let lista_items = response.data.data;
            lista_items.forEach(element => {
              element.estatus_clave = this.listaEstatusClaves[element.estatus];
              element.estatus_label = this.listaEstatusLabels[element.estatus];
              element.estatus_icono = this.listaEstatusIconos[element.estatus];
            });
            this.listadoMovimientos = response.data.data;
            console.log(this.listadoMovimientos);
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

  obtenerEntrada(id){
    this.isLoading = true;

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
            console.log(this.objetoMovimiento);
            this.generarEntradaPDF(this.objetoMovimiento);
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



  generarEntradaPDF(obj){

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
        title: "ENTRADA DE ALMACEN",
        showSigns: this.reportIncludeSigns, 
      };
      reportWorker.postMessage({data:{items: obj, config:config, fecha_actual: this.fechaActual},reporte:'almacen/entrada'});
      this.isLoading = false;
  }

}
