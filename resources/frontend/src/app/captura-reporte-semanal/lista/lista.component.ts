import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { CapturaReporteSemanalService } from '../captura-reporte-semanal.service';
import { SharedService } from '../../shared/shared.service';
import { MatDialog } from '@angular/material/dialog';
import { DialogoRegistroComponent } from '../dialogo-registro/dialogo-registro.component';
import { DialogoDetallesRegistroComponent } from '../dialogo-detalles-registro/dialogo-detalles-registro.component';
import { DialogoSubirArchivoComponent } from '../dialogo-subir-archivo/dialogo-subir-archivo.component';
import { ConfirmActionDialogComponent } from '../../utils/confirm-action-dialog/confirm-action-dialog.component';
import * as FileSaver from 'file-saver';

@Component({
  selector: 'app-lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.css']
})
export class ListaComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  
  constructor(private capturaReporteSemanalService: CapturaReporteSemanalService, private sharedService: SharedService, private dialog: MatDialog) { }

  isLoading: boolean = false;
  isLoadingExcel: boolean = false;
  searchQuery: string = '';

  unidadMedica:any;
  archivoCargado:any;
  semanaActiva:any;

  pageEvent: PageEvent;
  resultsLength: number = 0;
  currentPage: number = 0;
  pageSize: number = 20;
  selectedItemIndex: number = -1;

  displayedColumns: string[] = ['fechas','medicamentos','porcentaje_medicamentos','material_curacion','porcentaje_material_curacion','total_claves','total_porcentaje','actions'];
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
          this.unidadMedica = response.data.unidad_medica;
          this.archivoCargado = response.data.archivo_subido;
          this.semanaActiva = response.data.semana_activa;
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
    this.resultsLength = 0;

    this.capturaReporteSemanalService.obtenerListaRegistros(params).subscribe(
      response =>{
        if(response.error) {
          let errorMessage = response.error.message;
          this.sharedService.showSnackBar(errorMessage, null, 3000);
        } else {
          if(response.data.total > 0){
            this.listadoRegistros = response.data.data;

            for(let i in this.listadoRegistros){
              let registro = this.listadoRegistros[i];
            }

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

  verArchivo(){
    this.isLoadingExcel = true;
    this.capturaReporteSemanalService.verArchivoListaMeds().subscribe(
      response => {
        //FileSaver.saveAs(response);
        FileSaver.saveAs(response,'listado-medicamentos-activos');
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

  subirArchivo(){
    let configDialog:any = {
      width: '50%',
      maxHeight: '90vh',
      panelClass: 'no-padding-dialog'
    };

    const dialogRef = this.dialog.open(DialogoSubirArchivoComponent, configDialog);

    dialogRef.afterClosed().subscribe(response => {
      if(response){
        this.archivoCargado = response;
      }else{
        console.log('Cancelar');
      }
    });
  }

  nuevoRegistro(){
    let configDialog:any = {
      width: '99%',
      height: '50vh',
      panelClass: 'no-padding-dialog'
    };

    configDialog.data = {registroId: 0, semanaActiva: this.semanaActiva};
    
    const dialogRef = this.dialog.open(DialogoRegistroComponent, configDialog);

    dialogRef.afterClosed().subscribe(response => {
      if(response){
        this.loadListadoRegistros();
      }else{
        console.log('Cancelar');
      }
    });
  }

  editarRegistro(id){
    let configDialog:any = {
      width: '99%',
      height: '50vh',
      panelClass: 'no-padding-dialog'
    };

    configDialog.data = {registroId: id};
    
    const dialogRef = this.dialog.open(DialogoRegistroComponent, configDialog);

    dialogRef.afterClosed().subscribe(response => {
      if(response){
        this.loadListadoRegistros();
      }else{
        console.log('Cancelar');
      }
    });
  }

  verRegistro(id){
    let configDialog:any = {
      width: '99%',
      height: '50vh',
      panelClass: 'no-padding-dialog'
    };

    configDialog.data = {registroId: id};
    
    const dialogRef = this.dialog.open(DialogoDetallesRegistroComponent, configDialog);

    dialogRef.afterClosed().subscribe(response => {
        console.log('Cerrar');
    });
  }

  eliminarRegistro(id){
    const dialogRef = this.dialog.open(ConfirmActionDialogComponent, {
      width: '500px',
      data:{dialogTitle:'Eliminar Registro',dialogMessage:'Esta seguro de eliminar este registro?',btnColor:'warn',btnText:'Eliminar'}
    });

    dialogRef.afterClosed().subscribe(valid => {
      if(valid){
        this.capturaReporteSemanalService.borrarRegistro(id).subscribe(
          response =>{
            if(response.error) {
              let errorMessage = response.error.message;
              this.sharedService.showSnackBar(errorMessage, null, 3000);
            } else {
              this.loadListadoRegistros();
            }
          },
          errorResponse =>{
            var errorMessage = "Ocurrió un error.";
            if(errorResponse.status == 409){
              errorMessage = errorResponse.error.message;
            }
            this.sharedService.showSnackBar(errorMessage, null, 3000);
            this.isLoading = false;
          }
        );
      }
    });
  }

  applyFilter(){
    this.loadListadoRegistros();
  }

  cleanSearch(){
    this.searchQuery = '';
  }

}
