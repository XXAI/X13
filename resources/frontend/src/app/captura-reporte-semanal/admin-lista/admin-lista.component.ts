import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { CapturaReporteSemanalService } from '../captura-reporte-semanal.service';
import { SharedService } from '../../shared/shared.service';
import { MatDialog } from '@angular/material/dialog';
import { DialogoDetallesRegistroComponent } from '../dialogo-detalles-registro/dialogo-detalles-registro.component';
import { DialogoConfigCapturaComponent } from '../dialogo-config-captura/dialogo-config-captura.component';
import { ConfirmActionDialogComponent } from '../../utils/confirm-action-dialog/confirm-action-dialog.component';
import * as FileSaver from 'file-saver';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { Observable } from 'rxjs';
import {map, startWith} from 'rxjs/operators';

@Component({
  selector: 'app-admin-lista',
  templateUrl: './admin-lista.component.html',
  styleUrls: ['./admin-lista.component.css']
})
export class AdminListaComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(private capturaReporteSemanalService: CapturaReporteSemanalService, private sharedService: SharedService, private dialog: MatDialog, public datepipe: DatePipe) {
  }

  semanas: any[];
  semanaSeleccionada:number;
  semanaActiva: any;
  
  isLoading: boolean = false;
  isLoadingExcel: boolean = false;
  searchQuery: string = '';

  pageEvent: PageEvent;
  resultsLength: number = 0;
  currentPage: number = 0;
  pageSize: number = 50;
  selectedItemIndex: number = -1;

  displayedColumns: string[] = ['unidad_medica','fechas','total_claves','total_porcentaje','actions'];
  dataSource: MatTableDataSource<any>;
  listadoRegistros: any[] = [];

  ngOnInit(): void {
    this.semanas = [];    
    let params = {admin: true};

    this.capturaReporteSemanalService.obtenerDatosUsuario(params).subscribe(
      response =>{
        this.isLoading = false;
        if(response.error) {
          let errorMessage = response.error.message;
          this.sharedService.showSnackBar(errorMessage, null, 3000);
        } else {
          this.semanas = response.data.semanas_capturadas;
          this.semanaActiva = response.data.semana_activa;

          if(this.semanaActiva){
            this.semanaSeleccionada = this.semanaActiva.id;
          }else{
            this.semanaSeleccionada = this.semanas[0].id;
          }
          this.loadListadoRegistros();
          //this.unidadMedica = response.data.unidad_medica;
        }
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

  loadListadoRegistros(event?){
    this.isLoading = true;
    let params:any;
    if(!event){
      this.currentPage = 0;
      params = { page: 1, per_page: this.pageSize }
    }else{
      params = {
        page: event.pageIndex+1,
        per_page: event.pageSize
      };
    }
    params.admin = true;
    this.resultsLength = 0;

    params.config_captura_id = this.semanaSeleccionada;
    
    this.capturaReporteSemanalService.obtenerListaRegistros(params).subscribe(
      response =>{
        if(response.error) {
          let errorMessage = response.error.message;
          this.sharedService.showSnackBar(errorMessage, null, 3000);
        } else {
          this.listadoRegistros = response.data.data;
          this.resultsLength = response.data.total;
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

  verDetalles(id){
    let configDialog:any = {
      width: '99%',
      height: '50vh',
      panelClass: 'no-padding-dialog'
    };

    configDialog.data = {registroId: id};
    
    const dialogRef = this.dialog.open(DialogoDetallesRegistroComponent, configDialog);

    dialogRef.afterClosed().subscribe(response => {
      if(response){
        this.loadListadoRegistros();
      }else{
        console.log('Cancelar');
      }
    });
  }

  verAdminSemanasCaptura(){
    let configDialog:any = {
      width: '99%',
      height: '80vh',
      panelClass: 'no-padding-dialog'
    };

    const dialogRef = this.dialog.open(DialogoConfigCapturaComponent, configDialog);

    dialogRef.afterClosed().subscribe(response => {
      if(response){
        this.loadListadoRegistros();
      }else{
        console.log('Cancelar');
      }
    });
  }

  imprimirPDF(id){
    //imprimir pdf
  }

  imprimirReporteExcel(){
    this.isLoadingExcel = true;
    let params:any = {};
    
    params.config_captura_id = this.semanaSeleccionada;

    this.capturaReporteSemanalService.exportarAdminExcel(params).subscribe(
      response => {
        //FileSaver.saveAs(response);
        FileSaver.saveAs(response,'reporte-semanal-abasto-sumistro');
        this.isLoadingExcel = false;
      },
      errorResponse =>{
        var errorMessage = "Ocurrió un error.";
        if(errorResponse.status == 409){
          errorMessage = errorResponse.error.error.message;
        }
        this.sharedService.showSnackBar(errorMessage, null, 3000);
        this.isLoadingExcel = false;
      }
    );
  }

  applyFilter(){
    this.loadListadoRegistros();
  }

  cleanSearch(){
    this.searchQuery = '';
  }
  
}
