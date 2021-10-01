import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { CapturaReporteSemanalService } from '../captura-reporte-semanal.service';
import { SharedService } from '../../shared/shared.service';
import { MatDialog } from '@angular/material/dialog';
import { DialogoDetallesRegistroComponent } from '../dialogo-detalles-registro/dialogo-detalles-registro.component';
import { ConfirmActionDialogComponent } from '../../utils/confirm-action-dialog/confirm-action-dialog.component';
import * as FileSaver from 'file-saver';

@Component({
  selector: 'app-admin-lista',
  templateUrl: './admin-lista.component.html',
  styleUrls: ['./admin-lista.component.css']
})
export class AdminListaComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(private capturaReporteSemanalService: CapturaReporteSemanalService, private sharedService: SharedService, private dialog: MatDialog) { }

  isLoading: boolean = false;
  isLoadingExcel: boolean = false;
  searchQuery: string = '';

  pageEvent: PageEvent;
  resultsLength: number = 0;
  currentPage: number = 0;
  pageSize: number = 20;
  selectedItemIndex: number = -1;

  displayedColumns: string[] = ['unidad_medica','fechas','total_claves','total_porcentaje','actions'];
  dataSource: MatTableDataSource<any>;
  listadoRegistros: any[] = [];

  ngOnInit(): void {
    this.loadListadoRegistros();

    this.capturaReporteSemanalService.obtenerDatosUsuario().subscribe(
      response =>{
        if(response.error) {
          let errorMessage = response.error.message;
          this.sharedService.showSnackBar(errorMessage, null, 3000);
        } else {
          //this.unidadMedica = response.data.unidad_medica;
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

  loadListadoRegistros(event?){
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
    params.admin = true;
    this.resultsLength = 0;

    this.capturaReporteSemanalService.obtenerListaRegistros(params).subscribe(
      response =>{
        if(response.error) {
          let errorMessage = response.error.message;
          this.sharedService.showSnackBar(errorMessage, null, 3000);
        } else {
          if(response.data.total > 0){
            this.listadoRegistros = response.data.data;

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

  imprimirPDF(id){
    //imprimir pdf
  }

  imprimirReporteExcel(){
    this.isLoadingExcel = true;
    this.capturaReporteSemanalService.exportarAdminExcel().subscribe(
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
        this.isLoading = false;
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
