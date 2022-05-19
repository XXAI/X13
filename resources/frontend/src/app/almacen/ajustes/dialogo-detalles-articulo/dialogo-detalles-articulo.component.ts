import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { MatSelectionList } from '@angular/material/list';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { SharedService } from 'src/app/shared/shared.service';
import { AjustesService } from '../ajustes.service';
import { DialogoResguardoLoteComponent } from '../dialogo-resguardo-lote/dialogo-resguardo-lote.component';

export interface DialogData {
  articuloId: number;
  almacenId: number;
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
    private ajustesService: AjustesService,
    private formBuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    public dialog: MatDialog,
  ) { }

  isLoading:boolean;
  isSaving:boolean;
  actualizado:boolean;

  loteSeleccionado:boolean;
  formDetallesLote:FormGroup;
  existencias:any;
  resguardos:any;
  resumenMovimientos:any;
  nuevaExistencia: any;

  empaqueDetalleSeleccionado:any;

  pageEvent: PageEvent;
  resultsLength: number = 0;
  currentPage: number = 0;
  pageSize: number = 30;
  displayedColumns: string[] = ["direccion_movimiento","fecha_movimiento","folio","destino_origen","modo_movimiento","cantidad"];
  dataSourceMovimientos: MatTableDataSource<any>;
  isLoadingMovimientos:boolean;

  datosAlmacen:any;
  datosArticulo:any;
  empaqueDetalles:any[];
  listaLotes:any[];

  mostrarTodosLotes:boolean;
  filtroLotes:string;
  filtroAplicado:boolean;
  dataSourceLotes: MatTableDataSource<any>;

  listaEstatusIconos: any = { 'BOR':'content_paste',  'FIN':'assignment_turned_in',   'CAN':'cancel',     'PERE':'pending_actions',       'SOL':'edit_notifications',         'MOD':'note_alt'};
  listaEstatusClaves: any = { 'BOR':'borrador',       'FIN':'concluido',              'CAN':'cancelado',  'PERE':'pendiente-recepcion',   'SOL':'peticion-modificacion',      'MOD':'modificacion-aprobada'};
  listaEstatusLabels: any = { 'BOR':'Borrador',       'FIN':'Concluido',              'CAN':'Cancelado',  'PERE':'Pendiente de Recepción','SOL':'Petición de Modificación',   'MOD':'Modificación Activa'};

  ngOnInit(): void {
    this.actualizado = false;
    this.isLoading = true;
    this.mostrarTodosLotes = false;
    this.existencias = {cantidad:0, piezas:0, x_pieza:1};
    this.resguardos = {cantidad:0, piezas:0};
    this.dataSourceLotes = new MatTableDataSource<any>([]);

    this.formDetallesLote = this.formBuilder.group({
      'id':                         [''],
      'lote':                       [''],
      'fecha_caducidad':            [''],
      'codigo_barras':              [''],
      'empaque_detalle_id':         [''],
    });

    let params:any = {
      articulo: this.data.articuloId,
      almacen: this.data.almacenId,
    };

    this.ajustesService.getLotes(params).subscribe(
      response =>{
        let keep:boolean = false;
        if(response.error) {
          let errorMessage = response.error;
          this.sharedService.showSnackBar(errorMessage, null, 3000);
        } else {
          this.datosAlmacen = response.data.almacen;
          this.datosArticulo = response.data.articulo;
          this.empaqueDetalles = this.datosArticulo.empaque_detalle;
          //this.listaLotes = response.data.lotes;
          this.dataSourceLotes = new MatTableDataSource<any>(response.data.lotes);
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

  seleccionarLote(event){
    this.loteSeleccionado = true;
    let lote = event.option.value;
    this.formDetallesLote.patchValue(lote);
    this.nuevaExistencia = null;

    this.empaqueDetalleSeleccionado = this.empaqueDetalles.find(x => x.id == lote.empaque_detalle_id);

    this.existencias.cantidad = lote.existencia;
    this.existencias.piezas = lote.existencia_piezas;
    this.existencias.x_pieza = (this.empaqueDetalleSeleccionado)?this.empaqueDetalleSeleccionado.piezas_x_empaque:1;
    
    this.resguardos.piezas = lote.resguardo_piezas||0;
    this.resguardos.cantidad = Math.floor((lote.resguardo_piezas||0)/this.existencias.x_pieza);

    this.resumenMovimientos = null;
    this.dataSourceMovimientos = new MatTableDataSource<any>([]);
    this.dataSourceMovimientos.paginator = this.lotesPaginator;
    this.dataSourceMovimientos.sort = this.sort;
    this.isLoadingMovimientos = true;

    this.ajustesService.getMovimientos(lote.id).subscribe(
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
          this.dataSourceMovimientos = new MatTableDataSource<any>(response.data);
          this.dataSourceMovimientos.paginator = this.lotesPaginator;
          this.dataSourceMovimientos.sort = this.sort;

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

  cambiarDetalle(event){
    this.nuevaExistencia = null;
    this.empaqueDetalleSeleccionado = this.empaqueDetalles.find(x => x.id == event.value);
    let piezas_x_empaque = (this.empaqueDetalleSeleccionado)?this.empaqueDetalleSeleccionado.piezas_x_empaque:1;

    let entradas_uni = +this.resumenMovimientos['ENT']['uni'] + (+this.resumenMovimientos['ENT']['nrm'] * piezas_x_empaque);
    let salidas_uni = +this.resumenMovimientos['SAL']['uni'] + (+this.resumenMovimientos['SAL']['nrm'] * piezas_x_empaque);

    let existencia_uni = entradas_uni - salidas_uni;
    let existencia = Math.floor(existencia_uni / piezas_x_empaque);

    if(existencia_uni != this.existencias.piezas){
      this.nuevaExistencia = {
        'nrm':existencia,
        'uni':existencia_uni
      };
    }
  }

  cancelarEdicioLote(){
    this.loteSeleccionado = false;
    this.listaSeleccionableLotes.deselectAll();
    this.formDetallesLote.reset();
    this.existencias.cantidad = 0;
    this.existencias.piezas = 0;
    this.existencias.x_pieza = 0;
    this.nuevaExistencia = null;
    this.dataSourceMovimientos = new MatTableDataSource<any>([]);
  }

  guardarCambiosLote(){
    this.isSaving = true;
    let datosForm = this.formDetallesLote.value;
    this.ajustesService.guardarCambioLote(datosForm.id,datosForm).subscribe(
      response =>{
        if(response.error) {
          let errorMessage = response.error;
          this.sharedService.showSnackBar(errorMessage, null, 3000);
        } else {
          let index = this.dataSourceLotes.data.findIndex(x => x.id == response.data.id);
          this.dataSourceLotes.data[index] = response.data;
          this.aplicarFiltroLotes();
          this.cancelarEdicioLote();
        }
        this.isSaving = false;
      },
      errorResponse =>{
        var errorMessage = "Ocurrió un error.";
        if(errorResponse.status == 409){
          errorMessage = errorResponse.error.error.message;
        }
        this.sharedService.showSnackBar(errorMessage, null, 3000);
        this.isSaving = false;
      }
    );
  }

  cancelarAccion(){
    if(this.loteSeleccionado){
      this.cancelarEdicioLote();
    }else{
      this.cerrar();
    }
  }

  cerrar(){
    this.dialogRef.close(this.actualizado);
  }

  aplicarFiltroLotes(event?){
    let filter:any = {
      query: this.filtroLotes,
      todos: this.mostrarTodosLotes
    };
    this.dataSourceLotes.filter = JSON.stringify(filter);
  }

  mostrarDialogoResguardo(){
    let stock_id:number = this.formDetallesLote.get('id').value;
    let piezas_x_empaque = (this.empaqueDetalleSeleccionado)?this.empaqueDetalleSeleccionado.piezas_x_empaque:1;
    let configDialog = {
      width: '60%',
      height: '80%',
      data:{stockId: stock_id, almacenData:this.datosAlmacen, articuloData: this.datosArticulo, piezasXEmpaque: piezas_x_empaque},
      panelClass: 'no-padding-dialog'
    };

    const dialogRef = this.dialog.open(DialogoResguardoLoteComponent, configDialog);
    dialogRef.afterClosed().subscribe(dialogResponse => {
      if(dialogResponse){
        console.log('Response: ',dialogResponse);
      }
    });
  }
}
