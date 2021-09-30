import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { CapturaReporteSemanalService } from '../captura-reporte-semanal.service';
import { SharedService } from '../../shared/shared.service';
import { MatDialog } from '@angular/material/dialog';
import { DialogoRegistroComponent } from '../dialogo-registro/dialogo-registro.component';

@Component({
  selector: 'app-lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.css']
})
export class ListaComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  
  constructor(private capturaReporteSemanalService: CapturaReporteSemanalService, private sharedService: SharedService, private dialog: MatDialog) { }

  isLoading: boolean = false;
  searchQuery: string = '';

  pageEvent: PageEvent;
  resultsLength: number = 0;
  currentPage: number = 0;
  pageSize: number = 20;
  selectedItemIndex: number = -1;

  displayedColumns: string[] = ['fechas','total_medicamentos','total_material_curacion','total_claves','total_porcentaje','actions'];
  dataSource: MatTableDataSource<any>;
  listadoRegistros: any[] = [];

  ngOnInit(): void {
    this.loadListadoRegistros();
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

  nuevoRegistro(){
    let configDialog:any = {
      width: '99%',
      height: '50vh',
      panelClass: 'no-padding-dialog'
    };

    configDialog.data = {registroId: 0};
    
    const dialogRef = this.dialog.open(DialogoRegistroComponent, configDialog);

    dialogRef.afterClosed().subscribe(response => {
      if(response){
        console.log(response);
      }else{
        console.log('Cancelar');
      }
    });
  }

  editarRegistro(id){
    //
  }

  applyFilter(){
    this.loadListadoRegistros();
  }

  cleanSearch(){
    this.searchQuery = '';
  }

}
