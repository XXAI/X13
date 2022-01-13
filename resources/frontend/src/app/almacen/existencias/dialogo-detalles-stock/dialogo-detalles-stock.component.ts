import { MediaMatcher } from '@angular/cdk/layout';
import { AfterViewInit, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { merge } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ExistenciasService } from '../existencias.service';
import { MovimientosStockDataSource } from '../movimientos-stock.data-source';

@Component({
  selector: 'app-dialogo-detalles-stock',
  templateUrl: './dialogo-detalles-stock.component.html',
  styleUrls: ['./dialogo-detalles-stock.component.css']
})
export class DialogoDetallesStockComponent implements OnInit {
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort,{static:true}) sort: MatSort;

  constructor(
    media: MediaMatcher,
    public dialogRef: MatDialogRef<DialogoDetallesStockComponent>,
    public dialog: MatDialog,
    public apiService:ExistenciasService,
    //private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { 
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
  }

  filter: string = "";
  private orderBy:string;
  displayedColumns: string[] = ['lote','folio','estatus','direccion_movimiento','fecha_movimiento', 'cantidad','user'];

  dataSource: MovimientosStockDataSource;
  panelOpenState:boolean = true;

  mobileQuery: MediaQueryList;
  
  ngOnInit() {
    console.log("chuchi");
    this.dataSource = new MovimientosStockDataSource(this.apiService);           
    this.dataSource.loadData(this.data.id,'','asc','',0,20); 
  }

  ngAfterViewInit(){
    
    this.sort.sortChange.subscribe(() => { this.orderBy = this.sort.active; this.paginator.pageIndex = 0});
    merge(this.sort.sortChange,this.paginator.page)
      .pipe(
        tap(()=> this.loadData())
      ).subscribe();
    
  }

  cerrar(): void {
    this.dialogRef.close();
  }

  applyFilter(): void {
    //this.filter = this.inputSearchTxt.trim().toLowerCase();
    this.paginator.pageIndex = 0;
    this.loadData();
  }
  showFichaTecnica():void {
    alert("Funcion no disponible por el momento.")
  }
  loadData(){   
    this.dataSource.loadData(this.data.id,this.filter.trim().toLowerCase(),this.sort.direction,this.orderBy,this.paginator.pageIndex, this.paginator.pageSize);
  }

}
