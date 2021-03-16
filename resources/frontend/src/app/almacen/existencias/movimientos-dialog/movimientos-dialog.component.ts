import { MediaMatcher } from '@angular/cdk/layout';
import { AfterViewInit, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { merge } from 'rxjs';
import { tap } from 'rxjs/operators';
import { getEspPaginatorIntl } from 'src/app/esp-paginator-intl';
import { ExistenciasService } from '../data-source/existencias.service';
import { MovimientosStockDataSource } from '../data-source/movimientos-stock.data-source';
import { Stock } from '../data-source/stock';

@Component({
  selector: 'app-movimientos-dialog',
  templateUrl: './movimientos-dialog.component.html',
  styleUrls: ['./movimientos-dialog.component.css'],
  providers: [
    { provide: MatPaginatorIntl, useValue: getEspPaginatorIntl() }
  ]
})
export class MovimientosDialogComponent implements OnInit, AfterViewInit {
  filter: string = "";
  private orderBy:string;
  displayedColumns: string[] = ['folio','estatus','direccion_movimiento','fecha_movimiento', 'cantidad','user'];

  dataSource: MovimientosStockDataSource;

  mobileQuery: MediaQueryList;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort,{static:true}) sort: MatSort;

  constructor(
    media: MediaMatcher,
    public dialogRef: MatDialogRef<MovimientosDialogComponent>,
    public dialog: MatDialog,
    public apiService:ExistenciasService,
    //private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { 
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
  }

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

  loadData(){   
    this.dataSource.loadData(this.data.id,this.filter.trim().toLowerCase(),this.sort.direction,this.orderBy,this.paginator.pageIndex, this.paginator.pageSize);
  }
}
