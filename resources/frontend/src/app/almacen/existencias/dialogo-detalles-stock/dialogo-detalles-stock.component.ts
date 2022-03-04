import { MediaMatcher } from '@angular/cdk/layout';
import { AfterViewInit, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { merge } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ExistenciasService } from '../existencias.service';
import { MovimientosStockDataSource } from '../movimientos-stock.data-source';
import { SharedService } from 'src/app/shared/shared.service';

@Component({
  selector: 'app-dialogo-detalles-stock',
  templateUrl: './dialogo-detalles-stock.component.html',
  styleUrls: ['./dialogo-detalles-stock.component.css']
})
export class DialogoDetallesStockComponent implements OnInit {
  //@ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  //@ViewChild(MatSort,{static:true}) sort: MatSort;

  constructor(
    media: MediaMatcher,
    public dialogRef: MatDialogRef<DialogoDetallesStockComponent>,
    public dialog: MatDialog,
    public apiService: ExistenciasService,
    public sharedService: SharedService,
    //private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { 
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
  }

  filter: string = "";
  private orderBy:string;
  //displayedColumns: string[] = ['direccion_movimiento','fecha_movimiento','folio','lote','fecha_caducidad','cantidad'];
  displayedColumns: string[] = ['direccion_movimiento','almacen','fecha_movimiento','folio','lote','fecha_caducidad','cantidad'];

  dataSource: MovimientosStockDataSource;
  panelOpenState:boolean = true;

  mobileQuery: MediaQueryList;

  datosCatalogo:any;
  listaExistenciasAlmacen: any[];
  listaResumenMovimientos: any[];
  
  ngOnInit() {
    console.log("chuchi");
    //this.dataSource = new MovimientosStockDataSource(this.apiService);           
    //this.dataSource.loadData(this.data.id,'','asc','',0,20); 

    this.listaExistenciasAlmacen = [];
    this.listaResumenMovimientos = [];
    this.cargarDetalles(this.data.id);
  }

  ngAfterViewInit(){
    /*this.sort.sortChange.subscribe(() => { this.orderBy = this.sort.active; this.paginator.pageIndex = 0});
    merge(this.sort.sortChange,this.paginator.page)
      .pipe(
        tap(()=> this.loadData())
      ).subscribe();
    */
  }

  cargarDetalles(id){
    this.apiService.obtenerDetallesStock(id,{es_articulo: true}).subscribe(
      response =>{
        if(response.error) {
          let errorMessage = response.error.message;
          this.sharedService.showSnackBar(errorMessage, null, 3000);
        } else {
          console.log(response);
          this.listaExistenciasAlmacen = [];
          let controlAlmacenes = {};
          for (let i = 0; i < response.por_almacen.length; i++) {
            let almacen = response.por_almacen[i];
            if(controlAlmacenes[almacen.id] === undefined){
              controlAlmacenes[almacen.id] = this.listaExistenciasAlmacen.length;
              this.listaExistenciasAlmacen.push({
                nombre: almacen.almacen,
                total_existencias: +almacen.existencias,
                programas: [
                  { nombre: almacen.programa, existencias: +almacen.existencias }
                ]
              });
            }else{
              let index = controlAlmacenes[almacen.id];
              this.listaExistenciasAlmacen[index].total_existencias += +almacen.existencias;
              this.listaExistenciasAlmacen[index].programas.push({ nombre: almacen.programa, existencias: +almacen.existencias });
            }
          }
          this.listaResumenMovimientos = response.movimientos;
          this.datosCatalogo = response.datos_catalogo;
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

  cerrar(): void {
    this.dialogRef.close();
  }

  applyFilter(): void {
    //this.filter = this.inputSearchTxt.trim().toLowerCase();
    //this.paginator.pageIndex = 0;
    //this.loadData();
  }

  showFichaTecnica():void {
    alert("Funcion no disponible por el momento.")
  }

  loadData(){   
    //this.dataSource.loadData(this.data.id,this.filter.trim().toLowerCase(),this.sort.direction,this.orderBy,this.paginator.pageIndex, this.paginator.pageSize);
  }

}
