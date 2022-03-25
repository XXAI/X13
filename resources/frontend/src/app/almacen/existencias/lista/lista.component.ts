import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatDrawer } from '@angular/material/sidenav';
import { MatSort } from '@angular/material/sort';
import { merge, Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ExistenciasDataSource } from '../existencias.data-source';
import { ExistenciasService } from '../existencias.service';
import { SharedService } from 'src/app/shared/shared.service';
import { DialogoDetallesStockComponent } from '../dialogo-detalles-stock/dialogo-detalles-stock.component';
import * as FileSaver from 'file-saver';

@Component({
  selector: 'app-lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.css']
})
export class ListaComponent implements OnInit {
  @ViewChild(MatDrawer) filtrosDrawer: MatDrawer;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort,{static:true}) sort: MatSort;

  constructor(private apiService:ExistenciasService, private sharedService: SharedService, public dialog: MatDialog) { }

  isLoading:boolean;
  isLoadingExcel:boolean;
  filtros: any;
  almacenesSeleccionados: any[];

  searchQuery:string;
  filtroAplicado:boolean;

  private orderBy:string;
  displayedColumns: string[] = ['almacen','clave','articulo','programa', 'total_lotes', 'existencia'];

  filter: any  = {
    search: "",
    caducidad: "",
    fecha_caducidad_hasta: "",
    almacen_id: [],
    programa_id: "",
    unidad_medica_id: "",
    clave_partida_especifica: "",
    familia_id: "",
  };

  dataSource: ExistenciasDataSource;

  ngOnInit(): void {
    this.filtros = {'almacenes':[]};
    this.almacenesSeleccionados = [];
    this.dataSource = new ExistenciasDataSource(this.apiService);
    this.loadData();
    this.apiService.obtenerCatalogosFiltros().subscribe(
      response =>{
        if(response.error) {
          let errorMessage = response.error.message;
          this.sharedService.showSnackBar(errorMessage, null, 3000);
        } else {
          console.log(response);
          this.filtros.almacenes = response.data.almacenes;
          this.filtros.almacenes.forEach(element => {
            this.almacenesSeleccionados.push(element);
          });
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
  }

  ngAfterViewInit(){
    this.sort.sortChange.subscribe(() => { this.orderBy = this.sort.active; this.paginator.pageIndex = 0});
    merge(this.sort.sortChange,this.paginator.page)
      .pipe(
        tap(()=> this.loadData())
      ).subscribe();
    
  }

  loadData(){
    this.filter.search = this.filter.search.trim().toLowerCase();         //groupBy
    this.dataSource.loadData(this.filter,this.sort.direction,this.orderBy,'articulo',this.paginator.pageIndex, this.paginator.pageSize);
  }

  abrirFiltros(){
    this.filtrosDrawer.open();
    //this.filtrosDrawer.open().finally(() => this.filtroAplicado  = !this.filtroAplicado );
  }

  aplicarFiltros(){
    let lista_almacenes_ids = [];
    this.almacenesSeleccionados.forEach(item => lista_almacenes_ids.push(item.id));
    this.filter.almacen_id = lista_almacenes_ids.join('|');
    this.loadData();
  }

  cerrarFiltros(){
    this.filtrosDrawer.close();
  }

  cleanSearch(){
    this.filter.search = '';
    this.paginator.pageIndex = 0;
    this.loadData();
  }

  applySearch(){
    this.paginator.pageIndex = 0;
    this.loadData();
  }

  verDetallesStock(articulo){
    console.log(articulo);
    const dialogRef= this.dialog.open(DialogoDetallesStockComponent,{ width:"80vw", minHeight:"90%", height:"90%", data: articulo });
    dialogRef.afterClosed().subscribe(data => {
      if(data != null){ }     
    });
  }

  descargarExcel(agrupadoPor:string){
    this.isLoadingExcel = true;
    let lista_almacenes_ids = [];
    this.almacenesSeleccionados.forEach(item => lista_almacenes_ids.push(item.id));

    let params:any = {
      agrupar_por: agrupadoPor,
      almacenes_ids: lista_almacenes_ids.join('|'),
    };

    this.apiService.exportarReporte(params).subscribe(
      response => {
        FileSaver.saveAs(response,'Reporte de Existencias por '+agrupadoPor);
        this.isLoadingExcel = false;
      },
      errorResponse =>{
        console.log('Ocurrio un error al intentar descargar el archivo');
        this.isLoadingExcel = false;
      }
    );
  }

}
