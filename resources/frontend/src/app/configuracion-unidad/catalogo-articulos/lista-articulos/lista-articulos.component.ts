import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { SharedService } from '../../../shared/shared.service';
import { MatDialog } from '@angular/material/dialog';
import { CatalogoArticulosService } from '../catalogo-articulos.service';
import { DialogoArticuloComponent } from '../dialogo-articulo/dialogo-articulo.component';

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

  displayedColumns: string[] = ['clave','descripcion','minimo','maximo','indispensable','actions'];
  listadoArticulos: any[] = [];

  ngOnInit(): void {
    this.resultsLength = 0;

    this.catalogoArticulosService.getCatalogos().subscribe(
      response =>{
        if(response.error) {
          let errorMessage = response.error.message;
          this.sharedService.showSnackBar(errorMessage, null, 3000);
        } else {
          console.log(response);
        }
        //this.isLoading = false;
      },
      errorResponse =>{
        var errorMessage = "Ocurrió un error.";
        if(errorResponse.status == 409){
          errorMessage = errorResponse.error.error.message;
        }
        this.sharedService.showSnackBar(errorMessage, null, 3000);
        //this.isLoading = false;
      }
    );

    this.loadListadoArticulos();
  }

  applyFilter(){
    this.loadListadoArticulos();
  }

  cleanSearch(){
    this.searchQuery = '';
  }

  editarCatalogo(){
    //
  }

  mostrarArticulo(articulo){
    let configDialog:any;
    
    configDialog = {
      width: '60%',
      height: '50%',
      data:{articuloId: articulo.id},
      panelClass: 'no-padding-dialog'
    }

    const dialogRef = this.dialog.open(DialogoArticuloComponent, configDialog);

    dialogRef.afterClosed().subscribe(valid => {
      if(valid){
        this.loadListadoArticulos();
      }
    });
  }

  loadListadoArticulos(event?){
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

    this.listadoArticulos = [];
    
    params.query = this.searchQuery;
    this.resultsLength = 0;
    
    this.catalogoArticulosService.getListaArticulos(params).subscribe(
      response =>{
        if(response.error) {
          let errorMessage = response.error.message;
          this.sharedService.showSnackBar(errorMessage, null, 3000);
        } else {
          this.resultsLength = response.data.total;
          this.listadoArticulos = response.data.data;
          
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

}
