import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { SharedService } from 'src/app/shared/shared.service';
import { AjustesService } from '../ajustes.service';
import { DialogoDetallesArticuloComponent } from '../dialogo-detalles-articulo/dialogo-detalles-articulo.component';

@Component({
  selector: 'app-lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.css']
})
export class ListaComponent implements OnInit {
  @ViewChild(MatPaginator) articulosPaginator: MatPaginator;

  constructor(
    private sharedService: SharedService,
    private ajustesService: AjustesService,
    private dialog: MatDialog, 
  ) { }

  isLoading:boolean;

  selectedId:number;

  searchQuery:string;
  
  pageEvent: PageEvent;
  resultsLength: number = 0;
  currentPage: number = 0;
  pageSize: number = 20;
  pageSizeOptions: number[] = [10, 20, 30, 50];
  listaArticulos: any[];
  displayedColumns:string[] = ['almacen','clave','articulo','existencias','total_lotes'];

  ngOnInit(): void {
    this.searchQuery = '';
    this.loadListadoArticulos();
  }

  loadListadoArticulos(event?:PageEvent):any{
    this.isLoading = true;

    let params:any;
    if(!event){
      params = { page: 1, per_page: this.pageSize }
    }else{
      this.pageEvent = event;
      params = {
        page: event.pageIndex+1,
        per_page: event.pageSize
      };
    }
    
    params.query = this.searchQuery;

    this.listaArticulos = [];
    this.resultsLength = 0;
    
    this.ajustesService.getListaArticulos(params).subscribe(
      response =>{
        if(response.error) {
          let errorMessage = response.error;
          this.sharedService.showSnackBar(errorMessage, null, 3000);
        } else {
          if(response.data.total > 0){
            this.listaArticulos = response.data.data;
            this.resultsLength = response.data.total;
          }
          this.articulosPaginator.pageIndex = response.data.current_page-1;
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

  mostrarDialogoArticulo(articuloId:number, almacenId:number, seleccionId:number){
    let configDialog = {
      width: '100%',
      height: '100%',
      maxWidth: '100%',
      disableClose: true,
      data:{articuloId: articuloId, almacenId: almacenId},
      panelClass: 'no-padding-dialog'
    };

    this.selectedId = seleccionId;

    const dialogRef = this.dialog.open(DialogoDetallesArticuloComponent, configDialog);
    dialogRef.afterClosed().subscribe(dialogResponse => {
      if(dialogResponse){
        console.log('Response: ',dialogResponse);
        this.loadListadoArticulos(this.pageEvent);
      }
    });
  }

  cleanSearch(){
    this.searchQuery = '';
  }

  applyFilter(){
    this.loadListadoArticulos();
  }

}
