import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { SharedService } from 'src/app/shared/shared.service';
import { ExistenciasService } from '../existencias.service';
import { DialogoDetallesArticuloComponent } from '../dialogo-detalles-articulo/dialogo-detalles-articulo.component';
import { MediaMatcher } from '@angular/cdk/layout';
import { MatSelectionList } from '@angular/material/list';

@Component({
  selector: 'app-lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.css']
})
export class ListaComponent implements OnInit {
  @ViewChild(MatPaginator) articulosPaginator: MatPaginator;
  @ViewChild(MatSelectionList) listaSeleccionableAlmacenes: MatSelectionList;
  
  constructor(
    private media: MediaMatcher,
    private sharedService: SharedService,
    private existenciasService: ExistenciasService,
    private dialog: MatDialog, 
  ) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
  }

  isLoading:boolean;
  isLoadingFiltros:boolean;

  selectedId:number;

  searchQuery:string;

  openedSidenav: boolean;
  mobileQuery: MediaQueryList;
  
  pageEvent: PageEvent;
  resultsLength: number = 0;
  currentPage: number = 0;
  pageSize: number = 20;
  pageSizeOptions: number[] = [10, 20, 30, 50];
  listaArticulos: any[];
  displayedColumns:string[] = ['estatus','clave','articulo','total_lotes','existencias'];

  filtroCatalogos:any;

  ngOnInit(): void {
    this.searchQuery = '';
    this.openedSidenav = false; //!this.mobileQuery.matches;

    this.filtroCatalogos = {
      'almacenes':[]
    };

    this.isLoadingFiltros = true;
    this.existenciasService.obtenerCatalogosFiltros().subscribe(
      response =>{
        if(response.error) {
          let errorMessage = response.error;
          this.sharedService.showSnackBar(errorMessage, null, 3000);
        } else {
          if(response.data['almacenes']){
            this.filtroCatalogos.almacenes = response.data['almacenes'];
            this.listaSeleccionableAlmacenes.selectAll();
          }
        }
        this.isLoadingFiltros = false;
      },
      errorResponse =>{
        var errorMessage = "Ocurrió un error.";
        if(errorResponse.status == 409){
          errorMessage = errorResponse.error.error.message;
        }
        this.sharedService.showSnackBar(errorMessage, null, 3000);
        this.isLoadingFiltros = false;
      }
    );

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
    
    params.query = encodeURIComponent(this.searchQuery);

    this.listaArticulos = [];
    this.resultsLength = 0;
    
    this.existenciasService.obtenerListaArticulos(params).subscribe(
      response =>{
        if(response.error) {
          let errorMessage = response.error;
          this.sharedService.showSnackBar(errorMessage, null, 3000);
        } else {
          if(response.total > 0){
            response.data.forEach(element => {
              let icono:string = 'bookmarks';
              let font_outlined:boolean = true;
              let tooltip:string = 'Fuera del catalogo';
              if(element.es_normativo){
                icono = 'bookmark_added';
                font_outlined = false;
                tooltip = 'Es Normativo';
              }else if(element.en_catalogo_unidad){
                icono = 'bookmark';
                font_outlined = false;
                tooltip = 'En Catalogo';
              }
              element.icono = icono;
              element.font_outlined = font_outlined;
              element.tooltip = tooltip;

              element.existencia -= element.resguardo;
              element.existencia_fraccion -= element.resguardo_fraccion;
            });
            this.listaArticulos = response.data;
            this.resultsLength = response.total;
          }
          this.articulosPaginator.pageIndex = response.current_page-1;
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

  togglePanelFiltros(open){
    this.openedSidenav = open;
    this.listaSeleccionableAlmacenes.selectAll();
  }

  mostrarDialogoArticulo(articuloId:number){
    let configDialog = {
      width: '100%',
      height: '100%',
      maxWidth: '100%',
      disableClose: true,
      data:{articuloId: articuloId},
      panelClass: 'no-padding-dialog'
    };

    this.selectedId = articuloId;

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
