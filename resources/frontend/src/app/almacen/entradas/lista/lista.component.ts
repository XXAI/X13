import { Component, OnInit, ViewChild, NgZone } from '@angular/core';
import { SharedService } from '../../../shared/shared.service';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { MatTable } from '@angular/material';
import { MediaObserver } from '@angular/flex-layout';
import { EntradasService } from '../entradas.service';
//import { FormulariosService } from '../formularios.service';

@Component({
  selector: 'app-lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.css']
})
export class ListaComponent implements OnInit {
  isLoading: boolean = false;
  mediaSize: string;

  searchQuery: string = '';

  pageEvent: PageEvent;
  resultsLength: number = 0;
  currentPage: number = 0;
  pageSize: number = 20;
  selectedItemIndex: number = -1;

  displayedColumns: string[] = ['id','formulario','persona','fecha_captura','actions'];
  dataSource: any = [];

  constructor(private sharedService: SharedService, private entradasService: EntradasService, public dialog: MatDialog, public mediaObserver: MediaObserver) { }

  @ViewChild(MatPaginator, {static: false}) paginator: MatPaginator;
  @ViewChild(MatTable, {static:false}) usersTable: MatTable<any>;

  ngOnInit() {
    this.mediaObserver.media$.subscribe(
      response => {
        this.mediaSize = response.mqAlias;
    });
    
    this.loadLlenadoFormularios();
  }

  loadLlenadoFormularios(event?){
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
    this.dataSource = [];
    this.resultsLength = 0;
    
    this.entradasService.getListadoEntradas(params).subscribe(
      response =>{
        if(response.error) {
          let errorMessage = response.error.message;
          this.sharedService.showSnackBar(errorMessage, null, 3000);
        } else {
          if(response.data.total > 0){
            this.dataSource = response.data.data;
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

  applyFilter(){
    this.selectedItemIndex = -1;
    this.paginator.pageIndex = 0;
    this.paginator.pageSize = this.pageSize;
    this.loadLlenadoFormularios(null);
  }

  cleanSearch(){
    this.searchQuery = '';
  }

  verRespuestas(id: number, index: number){
    this.selectedItemIndex = index;
    /*
    let configDialog = {};
    if(this.mediaSize == 'xs'){
      configDialog = {
        //maxWidth: '100vw',
        //maxHeight: '100vh',
        //height: '100%',
        width: '100%',
        data:{id: id, scSize:this.mediaSize}
      };
    }else{
      configDialog = {
        width: '99%',
        //maxHeight: '90vh',
        //height: '643px',
        data:{id: id}
      }
    }

    const dialogRef = this.dialog.open(DetallesLlenadoFormularioComponent, configDialog);

    dialogRef.afterClosed().subscribe(valid => {
      if(valid){
        console.log('Aceptar');
      }else{
        console.log('Cancelar');
      }
    });*/
  }

}
