import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { SharedService } from 'src/app/shared/shared.service';
import { AjustesService } from '../ajustes.service';

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

  ngOnInit(): void {
    this.actualizado = false;
    this.isLoading = true;
    this.existencias = {cantidad:0, piezas:0, x_pieza:1};

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
          this.listaLotes = response.data.lotes;
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

    this.empaqueDetalleSeleccionado = this.empaqueDetalles.find(x => x.id == lote.empaque_detalle_id);
    this.existencias.cantidad = lote.existencia;
    this.existencias.piezas = lote.existencia_unidades;
    this.existencias.x_pieza = this.empaqueDetalleSeleccionado.piezas_x_empaque;

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
                this.resumenMovimientos[item.direccion_movimiento]['uni'] += item.cantidad;
              }else{
                this.resumenMovimientos[item.direccion_movimiento]['nrm'] += item.cantidad;
            }
            }
            /* 
            if($suma->direccion_movimiento == 'ENT'){
                if($suma->modo_movimiento == 'UNI'){
                    $total_entradas_piezas += $suma->cantidad;
                }else{
                    $total_entradas_piezas += ($suma->cantidad * $nuevo_empaque->piezas_x_empaque);
                }
            }else if($suma->direccion_movimiento == 'SAL'){
                if($suma->modo_movimiento == 'UNI'){
                    $total_salidas_piezas += $suma->cantidad;
                }else{
                    $total_salidas_piezas += ($suma->cantidad * $nuevo_empaque->piezas_x_empaque);
                }
            }
            */
          });
          //response.data.resumen;
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

    let entradas_uni = +this.resumenMovimientos['ENT']['uni'] + (+this.resumenMovimientos['ENT']['nrm'] * this.empaqueDetalleSeleccionado.piezas_x_empaque);
    let salidas_uni = +this.resumenMovimientos['SAL']['uni'] + (+this.resumenMovimientos['SAL']['nrm'] * this.empaqueDetalleSeleccionado.piezas_x_empaque);

    let existencia_uni = entradas_uni - salidas_uni;
    let existencia = Math.floor(existencia_uni / this.empaqueDetalleSeleccionado.piezas_x_empaque);

    if(existencia_uni != this.existencias.piezas){
      this.nuevaExistencia = {
        'nrm':existencia,
        'uni':existencia_uni
      };
    }
  }

  cancelarEdicioLote(){
    this.loteSeleccionado = false;
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
          console.log(response);
          let index = this.listaLotes.findIndex(x => x.id == response.data.id);
          this.listaLotes[index] = response.data;
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

  cerrar(){
    this.dialogRef.close(this.actualizado);
  }
}
