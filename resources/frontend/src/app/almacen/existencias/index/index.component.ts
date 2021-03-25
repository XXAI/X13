import { MediaMatcher } from '@angular/cdk/layout';
import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Title } from '@angular/platform-browser';
import { merge, Subscription } from 'rxjs';
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
export class IndexComponent implements OnInit, AfterViewInit,OnDestroy {

  selected:any;
  loading:boolean;
  loadingCatalogos:boolean;

  openedSidenav: boolean = false;
  mobileQuery: MediaQueryList;

  inputSearchTxt:string = "";
  filter: any  = {
    search: "",
    caducidad: "",
    fecha_caducidad_hasta: "",
    tipo: "",
    almacen_id: "",
    unidad_medica_id: ""
  };
  private orderBy:string;
  displayedColumns: string[] = ['clave','descripcion','tipo_insumo', 'lote','fecha_caducidad', 'existencia'];

  dataSource: ExistenciasDataSource;


  filterCatalogos:any = {};
  filterAlmacenes:any[];

  loadingFilterCatalogos:boolean; 
  

  //private _mobileQueryListener: () => void;
  
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort,{static:true}) sort: MatSort;

  constructor(media: MediaMatcher, private titleService: Title, private apiService:ExistenciasService, public dialog: MatDialog,) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
  }

  catalogosSubscription:Subscription;
  ngOnDestroy(): void {
    
  }

  
  ngOnInit(): void {

    this.openedSidenav = !this.mobileQuery.matches;
    //this.dataSource.paginator = this.paginator;
    this.titleService.setTitle("Existencias");
    
    this.dataSource = new ExistenciasDataSource(this.apiService);    
        
    //this.dataSource.loadData('','asc','',0,20); 

    this.loadingFilterCatalogos = true;
    this.catalogosSubscription = this.apiService.catalogos().subscribe(
      response => {
        this.filterCatalogos = response;
        this.filter.unidad_medica_id = this.filterCatalogos.unidad_medica_principal_id;
        this.updateAlmacenes();
        this.loadingFilterCatalogos = false;
        //Anti pattern :( lo siento tendre que echarme un buen clavado de buenas practicas
        this.loadData();
        console.log(response);
      }, error => {
        console.log(error);
      }
    );
    console.log("porque no me ejecuto");
  }

  updateAlmacenes(){
    for(var i = 0; i< this.filterCatalogos.unidades_medicas.length; i++){
      if(this.filterCatalogos.unidades_medicas[i].id == this.filter.unidad_medica_id){
        this.filterAlmacenes = this.filterCatalogos.unidades_medicas[i].almacenes;
        break;
      }
    }
    if(this.filterAlmacenes.length > 0){
      this.filter.almacen_id = this.filterAlmacenes[0].id;
    } else {
      this.filter.almacen_id = "";
    }
    
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

    
    this.paginator.pageIndex = 0;
    this.loadData();
  }

  loadData(){   
    this.filter.search = this.filter.search.trim().toLowerCase();
    this.dataSource.loadData(this.filter,this.sort.direction,this.orderBy,this.paginator.pageIndex, this.paginator.pageSize);
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
