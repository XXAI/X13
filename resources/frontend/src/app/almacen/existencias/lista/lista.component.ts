import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { SharedService } from 'src/app/shared/shared.service';
import { ExistenciasService } from '../existencias.service';
import { DialogoDetallesArticuloComponent } from '../dialogo-detalles-articulo/dialogo-detalles-articulo.component';
import { MediaMatcher } from '@angular/cdk/layout';
import { MatSelectionList } from '@angular/material/list';
import * as FileSaver from 'file-saver';

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

  isLoading: boolean;
  isLoadingFiltros: boolean;
  isLoadingExcel: boolean;

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
  displayedColumns:string[];

  filtroCatalogos:any;
  filtro:any;
  filtroAplicado:any;

  ngOnInit(): void {
    this.searchQuery = '';
    this.openedSidenav = false; //!this.mobileQuery.matches;

    this.alterColumns();
    
    this.filtroCatalogos = {
      'almacenes':[],
      'tipos_articulo':[],
      'agrupacion':[
        {key:'article',value:'Articulo'},
        {key:'batch',value:'Lote - Cad.'}
      ],
      'existencias':[
        {key: 'with-stock', value: 'Con Existencias'},
        {key: 'zero-stock', value: 'Sin existencias'},
        {key: 'all',        value: 'Todos'},
      ],
      'catalogo_unidad':[
        {key: 'all',            value: 'Todos'},
        {key: 'in-catalog',     value: 'Catalogo de la Unidad'},
        {key: 'non-normative',  value: 'No Normativos'},
        {key: 'normative',      value: 'Normativos'},
        {key: 'outside',        value: 'Fuera del Catalogo de la Unidad'},
      ]
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
          }

          if(response.data['tipos_bien_servicio']){
            this.filtroCatalogos.tipos_articulo = response.data['tipos_bien_servicio'];
          }
        }
        this.isLoadingFiltros = false;
        this.filtrosDefault();
        this.loadListadoArticulos(this.pageEvent, true);
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

    //this.loadListadoArticulos();
  }

  loadListadoArticulos(event?:PageEvent, reset:boolean = false):any{
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

    if(reset){
      params.page = 1;
    }
    
    params.query = encodeURIComponent(this.searchQuery);

    if(this.filtro && this.filtroAplicado){
      params.agrupar = this.filtroAplicado.agrupar;
      params.existencias = this.filtroAplicado.existencias;
      params.catalogo_unidad = this.filtroAplicado.catalogo_unidad;
      params.tipo_articulo = this.filtroAplicado.tipo_articulo;
      params.almacenes = this.filtroAplicado.almacenes.join('|');
    }

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

              if(this.filtro && this.filtro.agrupar == 'batch'){
                element.selectable_id = element.stock_id;
              }else{
                element.selectable_id = element.id;
              }
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

  aplicarFiltro(){
    this.filtroAplicado = JSON.parse(JSON.stringify(this.filtro));
    this.alterColumns();
    this.loadListadoArticulos(this.pageEvent, true);
  }

  quitarFiltro(){
    this.filtrosDefault();
    this.alterColumns();
    this.loadListadoArticulos(this.pageEvent, true);
  }

  filtrosDefault(){
    let almacenes_ids:number[] = [];

    if(this.filtroCatalogos.almacenes){
      this.filtroCatalogos.almacenes.forEach(element => {
        almacenes_ids.push(element.id);
      });
    }

    this.filtro = {
      agrupar:'article',
      existencias: 'with-stock',
      catalogo_unidad: 'all',
      tipo_articulo: '0',
      almacenes: almacenes_ids,
    };

    this.filtroAplicado = null;
  }

  togglePanelFiltros(open){
    this.openedSidenav = open;
    //this.listaSeleccionableAlmacenes.selectAll();
  }

  mostrarDialogoArticulo(articuloId:number, selectableId:number){
    let articulo = this.listaArticulos.find(x => x.selectable_id == selectableId);
    let filtro_dialogo:any;
    if(this.filtroAplicado && this.filtroAplicado.agrupar != 'article'){
      filtro_dialogo = {
        agrupar: this.filtroAplicado.agrupar,
        datos_stock: {
          lote: articulo.lote,
          fecha_caducidad: (articulo.fecha_caducidad)?articulo.fecha_caducidad:'',
        } 
      }
    }

    let configDialog = {
      width: '100%',
      height: '100%',
      maxWidth: '100%',
      disableClose: true,
      data:{articuloId: articuloId, datosFiltroAplicado: filtro_dialogo},
      panelClass: 'no-padding-dialog'
    };

    this.selectedId = selectableId;

    const dialogRef = this.dialog.open(DialogoDetallesArticuloComponent, configDialog);
    dialogRef.afterClosed().subscribe(dialogResponse => {
      if(dialogResponse){
        console.log('Response: ',dialogResponse);
        //this.loadListadoArticulos(this.pageEvent);
      }
    });
  }

  cleanSearch(){
    this.searchQuery = '';
  }

  applySearch(){
    this.loadListadoArticulos(this.pageEvent, true);
  }

  alterColumns(){
    if(this.filtroAplicado && this.filtroAplicado.agrupar == 'batch'){
      this.displayedColumns = ['estatus','clave','articulo','lote_caducidad','existencias'];
    }else{
      this.displayedColumns = ['estatus','clave','articulo','total_lotes','existencias'];
    }
  }

  exportarExcel(){
    this.isLoadingExcel = true;
    let params:any = {};
    params.query = encodeURIComponent(this.searchQuery);

    if(this.filtro && this.filtroAplicado){
      params.agrupar = this.filtroAplicado.agrupar;
      params.existencias = this.filtroAplicado.existencias;
      params.catalogo_unidad = this.filtroAplicado.catalogo_unidad;
      params.tipo_articulo = this.filtroAplicado.tipo_articulo;
      params.almacenes = this.filtroAplicado.almacenes.join('|');
    }

    this.existenciasService.exportarExcel(params).subscribe(
      response => {
        FileSaver.saveAs(response,'Repote - Existencias');
        this.isLoadingExcel = false;
      },
      errorResponse =>{
        this.sharedService.showSnackBar('Ocurrio un error al intentar descargar el archivo', null, 3000);
        console.log(errorResponse);
        this.isLoadingExcel = false;
      }
    );
  }

}
