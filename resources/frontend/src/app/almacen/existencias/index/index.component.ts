import { MediaMatcher } from '@angular/cdk/layout';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Title } from '@angular/platform-browser';
import { merge } from 'rxjs';
import { tap } from 'rxjs/operators';
import { getEspPaginatorIntl } from 'src/app/esp-paginator-intl';
import { ExistenciasDataSource } from '../data-source/existencias.data-source';
import { ExistenciasService } from '../data-source/existencias.service';
import { Stock } from '../data-source/stock';
import { MovimientosDialogComponent } from '../movimientos-dialog/movimientos-dialog.component';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.css'],
  providers: [
    { provide: MatPaginatorIntl, useValue: getEspPaginatorIntl() }
  ]
})
export class IndexComponent implements OnInit, AfterViewInit {


  openedSidenav: boolean = false;
  mobileQuery: MediaQueryList;

  inputSearchTxt:string = "";
  filter: string = "";
  private orderBy:string;
  displayedColumns: string[] = ['clave','descripcion','tipo_insumo', 'lote','fecha_caducidad', 'existencia'];

  dataSource: ExistenciasDataSource;

  filtroFechaCaducidad:string = "";
  filtroTipo:string = "";
  //private _mobileQueryListener: () => void;
  
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort,{static:true}) sort: MatSort;

  constructor(media: MediaMatcher, private titleService: Title, private apiService:ExistenciasService, public dialog: MatDialog,) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
  }

  ngOnInit(): void {
    this.openedSidenav = !this.mobileQuery.matches;
    //this.dataSource.paginator = this.paginator;
    this.titleService.setTitle("Existencias");

    this.dataSource = new ExistenciasDataSource(this.apiService);    
        
    this.dataSource.loadData('','asc','',0,20); 
  }
  ngAfterViewInit(){
    
    this.sort.sortChange.subscribe(() => { this.orderBy = this.sort.active; this.paginator.pageIndex = 0});
    merge(this.sort.sortChange,this.paginator.page)
      .pipe(
        tap(()=> this.loadData())
      ).subscribe();
    
  }
  checkFilter(){
    this.inputSearchTxt = this.filter;
  }
  applyFilter(): void {
    this.filter = this.inputSearchTxt.trim().toLowerCase();
    this.paginator.pageIndex = 0;
    this.loadData();
  }

  loadData(){   
    this.dataSource.loadData(this.filter.trim().toLowerCase(),this.sort.direction,this.orderBy,this.paginator.pageIndex, this.paginator.pageSize);
  }

  openDialog(item:Stock):void {
    const dialogRef= this.dialog.open(MovimientosDialogComponent,{ width:"80vw", minHeight:"90%", height:"90%", data: item });
    dialogRef.afterClosed().subscribe(data => {
      if(data != null){ }     
    });
  }
  toggleSidenav():void{
    
    this.openedSidenav = !this.openedSidenav;

    /*
    if(this.openedSidenav) {
      this.documentoDirty = true;
    }
    this.checkEmptyFields();*/

  }
}
