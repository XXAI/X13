import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { MatSelectionList } from '@angular/material/list';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { Subscription } from 'rxjs';
import { SharedService } from 'src/app/shared/shared.service';
import { ExistenciasService } from '../existencias.service';

export interface DialogData {
  articuloId: number;
}

@Component({
  selector: 'app-dialogo-detalles-articulo',
  templateUrl: './dialogo-detalles-articulo.component.html',
  styleUrls: ['./dialogo-detalles-articulo.component.css']
})
export class DialogoDetallesArticuloComponent implements OnInit {
  @ViewChild(MatTable) movimientosTable: MatTable<any>;
  @ViewChild(MatPaginator) lotesPaginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatSelectionList) listaSeleccionableLotes: MatSelectionList;
  
  constructor(
    public dialogRef: MatDialogRef<DialogoDetallesArticuloComponent>,
    private sharedService: SharedService,
    private existenciasService: ExistenciasService,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    public dialog: MatDialog,
  ) { }

  subDialogRef: any;
  nivelesEscape: any[];

  isLoading: boolean;
  isLoadingLotes: boolean;
  isLoadingMovimientos: boolean;
  subscriptionLotes: Subscription;
  subscriptionMovimientos: Subscription;

  verInfoResguardos:boolean;

  loteSeleccionado: boolean;
  datosLote: any;
  existencias: any;
  resguardos: any;
  resumenMovimientos: any;

  pageEvent: PageEvent;
  resultsLength: number = 0;
  currentPage: number = 0;
  pageSize: number = 30;
  displayedColumns: string[] = ["direccion_movimiento","fecha_movimiento","folio","destino_origen","modo_movimiento","cantidad"];
  dataSourceMovimientos: MatTableDataSource<any>;

  almacenes: any[];
  almacenSeleccionado: any;
  datosArticulo: any;

  mostrarTodosLotes:boolean;
  filtroLotes:string;
  filtroAplicado:boolean;
  dataSourceLotes: MatTableDataSource<any>;

  listaEstatusIconos: any = { 'BOR':'content_paste',  'FIN':'assignment_turned_in',   'CAN':'cancel',     'PERE':'pending_actions',       'SOL':'edit_notifications',         'MOD':'note_alt'};
  listaEstatusClaves: any = { 'BOR':'borrador',       'FIN':'concluido',              'CAN':'cancelado',  'PERE':'pendiente-recepcion',   'SOL':'peticion-modificacion',      'MOD':'modificacion-aprobada'};
  listaEstatusLabels: any = { 'BOR':'Borrador',       'FIN':'Concluido',              'CAN':'Cancelado',  'PERE':'Pendiente de Recepción','SOL':'Petición de Modificación',   'MOD':'Modificación Activa'};

  ngOnInit(): void {
    this.nivelesEscape = [];
    this.isLoading = true;
    this.mostrarTodosLotes = false;
    this.existencias = {cantidad:0, piezas:0, x_pieza:1};
    this.resguardos = {cantidad:0, piezas:0};
    this.almacenSeleccionado = {id:0};
    this.dataSourceLotes = new MatTableDataSource<any>([]);

    this.existenciasService.obtenerDetallesArticulo(this.data.articuloId).subscribe(
      response =>{
        let keep:boolean = false;
        if(response.error) {
          let errorMessage = response.error;
          this.sharedService.showSnackBar(errorMessage, null, 3000);
        } else {
          this.datosArticulo = response.detalle_articulo;

          response.existencias_almacenes.forEach(element => {
            element.existencia -= element.resguardo;
            element.existencia_fraccion -= element.resguardo_fraccion;
          });

          this.almacenes = response.existencias_almacenes;

          this.dataSourceLotes = new MatTableDataSource<any>([]);
          this.dataSourceLotes.filterPredicate = function (record,filter) {
            let filtro = JSON.parse(filter);
            let result:boolean = true;

            if(!filtro.todos){
              result = (record.existencia > 0 || record.existencia_piezas > 0);
            }
            
            if(result && filtro.query){
              result = record.lote.toLowerCase().includes(filtro.query.toLowerCase());
            }
            
            return result;
         }
         this.aplicarFiltroLotes();
        }
        this.isLoading = keep;
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
  }

  cancelarAccion(){
    if(this.verInfoResguardos){
      this.verInfoResguardos = false;
    }else if(this.loteSeleccionado){
      this.quitarLoteSeleccionado();
      this.listaSeleccionableLotes.deselectAll();
    }else if(this.almacenSeleccionado.id != 0){
      this.quitarAlmacenSeleccionado();
    }else{
      this.cerrar();
    }
  }

  seleccionarAlmacen(almacen){
    if(this.almacenSeleccionado.id != 0){
      this.quitarAlmacenSeleccionado();
      if(this.loteSeleccionado){
        this.quitarLoteSeleccionado();
      }
    }
    this.nivelesEscape.push(true);
    this.almacenSeleccionado = almacen;
    this.dataSourceLotes.data = [];
    this.isLoadingLotes = true;

    let params:any = {
      'almacen': this.almacenSeleccionado.id,
      'articulo': this.datosArticulo.id,
    };

    this.subscriptionLotes = this.existenciasService.obtenerListaLotes(params).subscribe(
      response =>{
        if(response.error) {
          let errorMessage = response.error;
          this.sharedService.showSnackBar(errorMessage, null, 3000);
        } else {
          response.data.forEach(element => {
            if(!element.piezas_x_empaque){
              element.piezas_x_empaque = 1;
            }
            element.resguardo = Math.floor((element.resguardo_piezas||0) / element.piezas_x_empaque);
            element.resguardo_fraccion = (element.resguardo_piezas||0) % element.piezas_x_empaque;

            element.existencia -= element.resguardo;
            element.existencia_fraccion = (element.existencia_piezas % element.piezas_x_empaque) - element.resguardo_fraccion;
          });
          this.dataSourceLotes.data = response.data;
          this.aplicarFiltroLotes();
        }
        this.isLoadingLotes = false;
      },
      errorResponse =>{
        var errorMessage = "Ocurrió un error.";
        if(errorResponse.status == 409){
          errorMessage = errorResponse.error.error.message;
        }
        this.sharedService.showSnackBar(errorMessage, null, 3000);
        this.isLoadingLotes = false;
      }
    );
  }

  seleccionarLote(event){
    if(this.loteSeleccionado){
      this.quitarLoteSeleccionado();
    }
    this.nivelesEscape.push(true);
    this.loteSeleccionado = true;
    this.datosLote = event.option.value;
    
    if(this.datosLote.resguardo_detalles_activos && this.datosLote.resguardo_detalles_activos.length){
      this.datosLote.resguardo_detalles_activos.forEach(element => {
        element.fecha_resguardo = element.created_at;
        let cantidad = Math.floor(element.cantidad_restante/this.datosLote.piezas_x_empaque);
        let piezas = element.cantidad_restante % this.datosLote.piezas_x_empaque;
        element.cantidad_restante = cantidad;
        element.cantidad_piezas_restante = piezas;
      });
    }

    //this.resguardos.cantidad = Math.floor((this.datosLote.resguardo_piezas||0)/this.datosLote.piezas_x_empaque);
    //this.resguardos.piezas = (this.datosLote.resguardo_piezas||0) % this.datosLote.piezas_x_empaque;
    //this.existencias.cantidad = this.datosLote.existencia - this.resguardos.cantidad;
    //this.existencias.piezas = (this.datosLote.existencia_piezas % this.datosLote.piezas_x_empaque) - this.resguardos.piezas;

    this.resguardos.cantidad = this.datosLote.resguardo;
    this.resguardos.piezas = this.datosLote.resguardo_fraccion;

    this.existencias.cantidad = this.datosLote.existencia;
    this.existencias.piezas = this.datosLote.existencia_fraccion;

    this.resumenMovimientos = null;
    this.dataSourceMovimientos = new MatTableDataSource<any>([]);
    this.dataSourceMovimientos.paginator = this.lotesPaginator;
    this.dataSourceMovimientos.sort = this.sort;
    this.isLoadingMovimientos = true;

    this.existenciasService.obtenerListaMovimientos(this.datosLote.id).subscribe(
      response =>{
        if(response.error) {
          let errorMessage = response.error;
          this.sharedService.showSnackBar(errorMessage, null, 3000);
        } else {
          console.log(response);
          response.data.forEach(item => {
            if(item.tipo_solicitud){
              item.destino_origen = item.tipo_solicitud;
            }else if (item.area_servicio_movimiento){
              item.destino_origen = item.area_servicio_movimiento;
            }else if (item.unidad_medica_movimiento){
              item.destino_origen = item.unidad_medica_movimiento;
            }else if (item.almacen_movimiento){
              item.destino_origen = item.almacen_movimiento;
            }
          });

          setTimeout(() =>{
            this.dataSourceMovimientos = new MatTableDataSource<any>(response.data);
            this.dataSourceMovimientos.paginator = this.lotesPaginator;
            this.dataSourceMovimientos.sort = this.sort;
          });
          
          this.resumenMovimientos = {
            'ENT':{'nrm':0,'uni':0},
            'SAL':{'nrm':0,'uni':0}
          }
          response.resumen.forEach(item => {
            if(this.resumenMovimientos[item.direccion_movimiento]){
              if(item.modo_movimiento == 'UNI'){
                this.resumenMovimientos[item.direccion_movimiento]['uni'] += +item.cantidad;
              }else{
                this.resumenMovimientos[item.direccion_movimiento]['nrm'] += +item.cantidad;
            }
            }
          });

          if(this.resumenMovimientos['ENT']['uni'] > 0){
            let entradas_por_pieza = Math.floor(this.resumenMovimientos['ENT']['uni']/this.datosLote.piezas_x_empaque);
            this.resumenMovimientos['ENT']['uni'] -= (entradas_por_pieza*this.datosLote.piezas_x_empaque);
            this.resumenMovimientos['ENT']['nrm'] += entradas_por_pieza;
          }

          if(this.resumenMovimientos['SAL']['uni'] > 0){
            let entradas_por_pieza = Math.floor(this.resumenMovimientos['SAL']['uni']/this.datosLote.piezas_x_empaque);
            this.resumenMovimientos['SAL']['uni'] -= (entradas_por_pieza*this.datosLote.piezas_x_empaque);
            this.resumenMovimientos['SAL']['nrm'] += entradas_por_pieza;
          }
        }
        this.isLoadingMovimientos = false;
      },
      errorResponse =>{
        var errorMessage = "Ocurrió un error.";
        if(errorResponse.status == 409){
          errorMessage = errorResponse.error.error.message;
        }
        this.sharedService.showSnackBar(errorMessage, null, 3000);
        this.isLoadingMovimientos = false;
      }
    );
  }

  cerrar(){
    this.dialogRef.close();
  }

  private quitarLoteSeleccionado(){
    if(this.subscriptionMovimientos && !this.subscriptionMovimientos.closed){
      this.subscriptionMovimientos.unsubscribe();
    }
    this.loteSeleccionado = false;
    //this.listaSeleccionableLotes.deselectAll();
    this.existencias.cantidad = 0;
    this.existencias.piezas = 0;
    this.existencias.x_pieza = 0;
    this.dataSourceMovimientos = new MatTableDataSource<any>([]);
    this.nivelesEscape.splice(0,1);
  }

  private quitarAlmacenSeleccionado(){
    if(this.subscriptionLotes && !this.subscriptionLotes.closed){
      this.subscriptionLotes.unsubscribe();
    }
    this.almacenSeleccionado = {id:0};
    this.isLoadingLotes = false;
    this.dataSourceLotes.data = [];
    this.nivelesEscape.splice(0,1);
  }

  aplicarFiltroLotes(event?){
    let filter:any = {
      query: this.filtroLotes,
      todos: this.mostrarTodosLotes
    };
    this.dataSourceLotes.filter = JSON.stringify(filter);
  }

}
