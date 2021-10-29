import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { SharedService } from '../../../shared/shared.service';
import { MatDialog } from '@angular/material/dialog';
import { CatalogoArticulosService } from '../catalogo-articulos.service';

@Component({
  selector: 'app-lista-articulos',
  templateUrl: './lista-articulos.component.html',
  styleUrls: ['./lista-articulos.component.css']
})
export class ListaArticulosComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  
  constructor(private catalogoArticulosService: CatalogoArticulosService, private sharedService: SharedService, private dialog: MatDialog) { }

  isLoading: boolean = false;

  searchQuery: string = '';

  pageEvent: PageEvent;
  resultsLength: number = 0;
  currentPage: number = 0;
  pageSize: number = 20;
  selectedItemIndex: number = -1;

  displayedColumns: string[] = ['id','folio','descripcion','total_claves','total_insumos','actions'];
  listadoPedidos: any[] = [];

  ngOnInit(): void {
    this.resultsLength = 0;
  }

  applyFilter(){
    this.loadListadoPedidos();
    this.loadListadoPedidos();
  }

  cleanSearch(){
    this.searchQuery = '';
  }

  editarCatalogo(){
    //
  }

  loadListadoPedidos(event?){
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

    this.listadoPedidos = [];
    
    params.query = this.searchQuery;
    this.resultsLength = 0;
    
    /*this.catalogoArticulosService.obtenerCatalogo(params).subscribe(
      response =>{
        if(response.error) {
          let errorMessage = response.error.message;
          this.sharedService.showSnackBar(errorMessage, null, 3000);
        } else {
          if(response.data.total > 0){
            this.listadoPedidos = response.data.data;

            for(let i in this.listadoPedidos){
              let pedido = this.listadoPedidos[i];

              if(!pedido.folio){
                pedido.folio = 'S/F';
              }
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
    );*/
    
    return event;
  }

}
