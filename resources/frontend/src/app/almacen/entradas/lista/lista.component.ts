import { Component, OnInit, ViewChild, NgZone } from '@angular/core';
import { SharedService } from '../../../shared/shared.service';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { MatTable } from '@angular/material/table';
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

  listaEstatusIconos: any = { 'ME-BR':'content_paste',  'ME-FI':'description', 'ME-CA':'cancel'  };
  listaEstatusClaves: any = { 'ME-BR':'borrador',       'ME-FI':'concluido',   'ME-CA':'cancelado' };
  listaEstatusLabels: any = { 'ME-BR':'Borrador',       'ME-FI':'Concluido',   'ME-CA':'Cancelado' };

  displayedColumns: string[] = ['id','almacen','programa','descripcion','fecha_movimiento','totales_claves_articulos','actions'];
  listadoMovimientos: any = [];

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
}
