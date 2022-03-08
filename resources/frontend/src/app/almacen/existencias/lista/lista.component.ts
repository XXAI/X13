import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatDrawer } from '@angular/material/sidenav';
import { MatSort } from '@angular/material/sort';
import { merge, Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ExistenciasDataSource } from '../existencias.data-source';
import { ExistenciasService } from '../existencias.service';
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

  constructor(private apiService:ExistenciasService, public dialog: MatDialog) { }

  isLoadingExcel:boolean;

  searchQuery:string;
  filtroAplicado:boolean;

  private orderBy:string;
  displayedColumns: string[] = ['almacen','clave','articulo','programa', 'total_lotes', 'existencia'];

  filter: any  = {
    search: "",
    caducidad: "",
    fecha_caducidad_hasta: "",
    almacen_id: "",
    programa_id: "",
    unidad_medica_id: "",
    clave_partida_especifica: "",
    familia_id: "",
  };

  dataSource: ExistenciasDataSource;

  ngOnInit(): void {
    this.dataSource = new ExistenciasDataSource(this.apiService);
    this.loadData();
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
    this.filtrosDrawer.open().finally(() => this.filtroAplicado  = !this.filtroAplicado );
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

  descargarExcel(){
    this.isLoadingExcel = true;
    this.apiService.exportarReporte().subscribe(
      response => {
        FileSaver.saveAs(response,'Existencias por almacen');
        this.isLoadingExcel = false;
      },
      errorResponse =>{
        console.log('Ocurrio un error al intentar descargar el archivo');
        this.isLoadingExcel = false;
      }
    );
  }

}
