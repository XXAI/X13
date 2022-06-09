import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { SharedService } from 'src/app/shared/shared.service';
import { ExistenciasService } from '../existencias.service';
import { DialogoDetallesArticuloComponent } from '../dialogo-detalles-articulo/dialogo-detalles-articulo.component';
import { MediaMatcher } from '@angular/cdk/layout';
import { MatSelectionList } from '@angular/material/list';
import * as FileSaver from 'file-saver';
import { ReportWorker } from 'src/app/web-workers/report-worker';

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
  isLoadingExport: boolean;

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
        {key:'article',value:'Por: Articulo'},
        {key:'batch',value:'Por: Lote y Cad.'}
      ],
      'existencias':[
        {key: 'with-stock', value: 'Con Existencias'},
        {key: 'zero-stock', value: 'Sin existencias'},
        {key: 'all',        value: 'Todos'},
      ],
      'catalogo_unidad':[
        {key: 'all',            value: 'Todos'},
        {key: 'in-catalog',     value: 'Dentro del Catalogo de la Unidad'},
        {key: 'non-normative',  value: 'Catalogo No Normativo'},
        {key: 'normative',      value: 'Catalogo Normativo'},
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
      params.agrupar                    = this.filtroAplicado.agrupar;
      params.existencias                = this.filtroAplicado.existencias;
      params.catalogo_unidad            = this.filtroAplicado.catalogo_unidad;
      params.tipo_articulo              = this.filtroAplicado.tipo_articulo;
      params.almacenes                  = this.filtroAplicado.almacenes.join('|');
      params.incluir_catalogo_completo  = (this.filtroAplicado.incluir_catalogo_completo)?1:0;
      params.incluir_almacenes_ajenos   = (this.filtroAplicado.incluir_almacenes_ajenos)?1:0;
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

              if(!element.es_almacen_propio){
                element.selectable_id = element.selectable_id * -1;
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
      incluir_catalogo_completo: false,
      incluir_almacenes_ajenos: false,
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
    if(this.filtroAplicado){
      filtro_dialogo = {};
      if(this.filtroAplicado.agrupar != 'article'){
        filtro_dialogo.agrupar = this.filtroAplicado.agrupar;
        filtro_dialogo.datos_stock = {
          lote: articulo.lote,
          fecha_caducidad: (articulo.fecha_caducidad)?articulo.fecha_caducidad:'',
        };
      }
      if(!articulo.es_almacen_propio){
        filtro_dialogo.almacenes_ajenos = true;
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

  exportarPDF(){
    this.isLoadingExport = true;

    let params:any = {
      query: encodeURIComponent(this.searchQuery),
    };

    if(this.filtro && this.filtroAplicado){
      params.agrupar                    = this.filtroAplicado.agrupar;
      params.existencias                = this.filtroAplicado.existencias;
      params.catalogo_unidad            = this.filtroAplicado.catalogo_unidad;
      params.tipo_articulo              = this.filtroAplicado.tipo_articulo;
      params.almacenes                  = this.filtroAplicado.almacenes.join('|');
      params.incluir_catalogo_completo  = (this.filtroAplicado.incluir_catalogo_completo)?1:0;
      params.incluir_almacenes_ajenos   = (this.filtroAplicado.incluir_almacenes_ajenos)?1:0;
    }

    this.existenciasService.exportarPDF(params).subscribe(
      response =>{
        if(response.error) {
          let errorMessage = response.error;
          this.sharedService.showSnackBar(errorMessage, null, 3000);
        } else {
          if(response.items.length > 0){
            response.items.forEach(element => {
              element.existencia -= element.resguardo;
              element.existencia_fraccion -= element.resguardo_fraccion;
            });
            
            let fecha_reporte = new Intl.DateTimeFormat('es-ES', {year: 'numeric', month: '2-digit', day: '2-digit'}).format(new Date());

            const reportWorker = new ReportWorker();
            reportWorker.onmessage().subscribe(
              data => {
                FileSaver.saveAs(data.data,'Almacen-Existencias '+'('+fecha_reporte+')');
                reportWorker.terminate();
                this.isLoadingExport = false;
            });

            reportWorker.onerror().subscribe(
              (data) => {
                this.sharedService.showSnackBar(data.message, null, 3000);
                this.isLoadingExport = false;
                reportWorker.terminate();
              }
            );
            
            let config = {
              agrupado_lote: (this.filtroAplicado && this.filtroAplicado.agrupar == 'batch')?true:false,
            };

            reportWorker.postMessage({data:{items: response.items, encabezado:{unidad_medica:response.unidad_medica}, config:config},reporte:'almacen/existencia'});
          }else{
            this.sharedService.showSnackBar('No se encontraron resultados', null, 3000);
            this.isLoadingExport = false;
          }
        }
      },
      errorResponse =>{
        var errorMessage = "Ocurrió un error.";
        if(errorResponse.status == 409){
          errorMessage = errorResponse.error.error.message;
        }
        this.sharedService.showSnackBar(errorMessage, null, 3000);
        this.isLoadingExport = false;
      }
    );
  }

  exportarExcel(){
    this.isLoadingExport = true;
    let params:any = {};
    params.query = encodeURIComponent(this.searchQuery);

    if(this.filtro && this.filtroAplicado){
      params.agrupar                    = this.filtroAplicado.agrupar;
      params.existencias                = this.filtroAplicado.existencias;
      params.catalogo_unidad            = this.filtroAplicado.catalogo_unidad;
      params.tipo_articulo              = this.filtroAplicado.tipo_articulo;
      params.almacenes                  = this.filtroAplicado.almacenes.join('|');
      params.incluir_catalogo_completo  = (this.filtroAplicado.incluir_catalogo_completo)?1:0;
      params.incluir_almacenes_ajenos   = (this.filtroAplicado.incluir_almacenes_ajenos)?1:0;
    }

    this.existenciasService.exportarExcel(params).subscribe(
      response => {
        FileSaver.saveAs(response,'Repote - Existencias');
        this.isLoadingExport = false;
      },
      errorResponse =>{
        this.sharedService.showSnackBar('Ocurrio un error al intentar descargar el archivo', null, 3000);
        console.log(errorResponse);
        this.isLoadingExport = false;
      }
    );
  }

}
