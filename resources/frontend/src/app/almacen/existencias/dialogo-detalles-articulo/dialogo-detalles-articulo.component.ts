import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { MatSelectionList } from '@angular/material/list';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
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

  isLoading: boolean;

  loteSeleccionado: boolean;
  existencias: any;
  resguardos: any;
  resumenMovimientos: any;

  pageEvent: PageEvent;
  resultsLength: number = 0;
  currentPage: number = 0;
  pageSize: number = 30;
  displayedColumns: string[] = ["direccion_movimiento","fecha_movimiento","folio","destino_origen","modo_movimiento","cantidad"];
  dataSourceMovimientos: MatTableDataSource<any>;
  isLoadingMovimientos:boolean;

  almacenes: any[];
  almacenSeleccionado: any;
  datosArticulo: any;
  listaLotes: any[];

  mostrarTodosLotes:boolean;
  filtroLotes:string;
  filtroAplicado:boolean;
  dataSourceLotes: MatTableDataSource<any>;

  listaEstatusIconos: any = { 'BOR':'content_paste',  'FIN':'assignment_turned_in',   'CAN':'cancel',     'PERE':'pending_actions',       'SOL':'edit_notifications',         'MOD':'note_alt'};
  listaEstatusClaves: any = { 'BOR':'borrador',       'FIN':'concluido',              'CAN':'cancelado',  'PERE':'pendiente-recepcion',   'SOL':'peticion-modificacion',      'MOD':'modificacion-aprobada'};
  listaEstatusLabels: any = { 'BOR':'Borrador',       'FIN':'Concluido',              'CAN':'Cancelado',  'PERE':'Pendiente de Recepción','SOL':'Petición de Modificación',   'MOD':'Modificación Activa'};

  ngOnInit(): void {
    this.isLoading = true;
    this.mostrarTodosLotes = false;
    this.existencias = {cantidad:0, piezas:0, x_pieza:1};
    this.resguardos = {cantidad:0, piezas:0};
    this.dataSourceLotes = new MatTableDataSource<any>([]);

    this.existenciasService.obtenerDetallesArticulo(this.data.articuloId).subscribe(
      response =>{
        let keep:boolean = false;
        if(response.error) {
          let errorMessage = response.error;
          this.sharedService.showSnackBar(errorMessage, null, 3000);
        } else {
          console.log(response);
          this.datosArticulo = response.detalle_articulo;
          this.almacenes = response.existencias_almacenes;
          /*this.dataSourceLotes = new MatTableDataSource<any>(response.data.lotes);
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
         this.aplicarFiltroLotes();*/
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
    /*if(something){
      another thing
    }else if(something else){
      something more
    }else{
      this.cerrar();
    }*/
    this.cerrar();
  }

  cerrar(){
    this.dialogRef.close();
  }

  aplicarFiltroLotes(event?){
    let filter:any = {
      query: this.filtroLotes,
      todos: this.mostrarTodosLotes
    };
    this.dataSourceLotes.filter = JSON.stringify(filter);
  }

}
