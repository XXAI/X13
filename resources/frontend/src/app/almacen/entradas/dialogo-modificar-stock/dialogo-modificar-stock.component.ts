import { DatePipe } from '@angular/common';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Observable, of } from 'rxjs';
import { CustomValidator } from 'src/app/utils/classes/custom-validator';
import { AlmacenService } from '../../almacen.service';
import { DialogoPreviewMovimientoComponent } from '../../tools/dialogo-preview-movimiento/dialogo-preview-movimiento.component';
import { AlertPanelComponent } from 'src/app/shared/components/alert-panel/alert-panel.component';

export interface DialogData {
  stock: any;
  articulo: any;
  fecha_movimiento: Date;
  modo_conflicto: boolean;
}

@Component({
  selector: 'app-dialogo-modificar-stock',
  templateUrl: './dialogo-modificar-stock.component.html',
  styleUrls: ['./dialogo-modificar-stock.component.css']
})
export class DialogoModificarStockComponent implements OnInit {
  @ViewChild(MatPaginator) lotesPaginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(AlertPanelComponent) alertPanel:AlertPanelComponent;

  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<DialogoModificarStockComponent>,
    private dialog: MatDialog, 
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private almacenService: AlmacenService,
    private datePipe: DatePipe,
  ) { }

  isLoading: boolean;
  isLoadingMovimientos: boolean;

  modoConflicto: boolean;

  descartarCambios: boolean;

  mostrarCartaCanje: boolean;
  marcadoParaEliminar: boolean;

  indexSeleccionable: number;
  salidasSeleccionadas: any;
  totalPiezasSalidas: number;
  contadorSalidas: number;
  seleccionSalidasActivada: boolean;
  existenciasLote: any;
  existenciasNuevoLote: any;

  respaldoStock: any;
  accionLote: string;
  accionSalidas: string;

  infoMessage: string[];

  formStock: FormGroup;
  fechaActual: Date;
  
  estatusCaducidad: number;  // 0 = Sin Caducidad, 1 = Normal, 2 = Por Caducar, 3 = Caducado
  coloresCaducidad: any = {1:'verde', 2:'ambar', 3:'rojo'};
  listaIconosEstatus: any = {1:'task_alt', 2:'notification_important', 3:'warning'};
  etiquetaEstatus: string;

  catalogoMarcas: any[];
  filteredMarcas: Observable<string[]>;

  resumenMovimientos: any;
  piezasXEmpaque: number;
  
  pageEvent: PageEvent;
  resultsLength: number = 0;
  currentPage: number = 0;
  pageSize: number = 15;
  displayedColumns: string[] = ["direccion_movimiento","fecha_movimiento","preview","folio","destino_origen","modo_movimiento","cantidad"];
  dataSourceMovimientos: MatTableDataSource<any>;

  subDialogRef: any;

  listaEstatusIconos: any;
  listaEstatusClaves: any;
  listaEstatusLabels: any;

  ngOnInit(): void {
    this.modoConflicto = this.data.modo_conflicto;

    this.listaEstatusIconos = this.almacenService.listaIconos;
    this.listaEstatusClaves = this.almacenService.listaClaves;
    this.listaEstatusLabels = this.almacenService.listaEtiquetas;

    let formConfig:any;
    this.fechaActual = new Date();
    this.salidasSeleccionadas = {};
    this.contadorSalidas = 0;
    this.totalPiezasSalidas = 0;
    this.infoMessage = [];
    this.seleccionSalidasActivada = false;

    this.piezasXEmpaque = 1;
    if(this.data.stock.empaque_detalle){
      this.piezasXEmpaque = this.data.stock.empaque_detalle.piezas_x_empaque;
    }

    this.estatusCaducidad = this.data.stock.estatus_caducidad;

    this.resumenMovimientos = {
      'ENT':{'nrm':0,'uni':0,'total':0},
      'SAL':{'nrm':0,'uni':0,'total':0}
    };
    
    if(!this.modoConflicto){
      if(this.data.articulo.tipo_formulario == 'MEDS'){
        formConfig = {
          id:[''],
          stock_id:[''],
          programa_id:[''],
          almacen_id:[''],
          lote:['',Validators.required],
          codigo_barras:[''],
          cantidad:['',Validators.required],
          entrada_piezas:[''],
          empaque_detalle_id:[''],
          precio_unitario:[''],
          iva:[''],
        };
        
        if(this.data.articulo.tiene_fecha_caducidad > 0){
          formConfig.fecha_caducidad = ['',[Validators.required,CustomValidator.isValidDate()]];
        }else{
          formConfig.fecha_caducidad = ['',CustomValidator.isValidDate()];
        }
      }else if(this.data.articulo.tipo_formulario == 'ACTVO'){
        formConfig = {
          id:[''],
          stock_id:[''],
          programa_id:[''],
          almacen_id:[''],
          marca:[''],
          marca_id:[''],
          modelo: [''],
          no_serie:['',Validators.required],
          cantidad:['',Validators.required],
          entrada_piezas:[''],
          empaque_detalle_id:[''],
          precio_unitario:[''],
          iva:[''],
        };
      }
    
      this.formStock = this.formBuilder.group(formConfig);

      if(this.data.stock.precio_unitario == 0){
        this.data.stock.precio_unitario = null;
      }

    /*let item = JSON.parse(JSON.stringify(this.data.stock));
    item.memo_fecha = new Date(item.memo_fecha + 'T00:00:00');
    if(item.fecha_caducidad){
      item.fecha_caducidad = new Date(item.fecha_caducidad + 'T00:00:00');
    }*/
    
      if(this.data.stock.memo_folio){
        this.toggleCartaCanje(true);
      }else{
        this.toggleCartaCanje(false);
      }

      if(this.data.stock.respaldo){
        this.respaldoStock = JSON.parse(JSON.stringify(this.data.stock.respaldo));
        this.accionLote = this.data.stock.accion_lote;
        this.accionSalidas = this.data.stock.accion_salidas;
        if(this.accionSalidas != 'none' && this.accionSalidas != ''){
          this.seleccionSalidasActivada = true;
        }
      }else{
        this.respaldoStock = JSON.parse(JSON.stringify(this.data.stock));
      }
    
      if(this.accionLote && this.accionLote != 'delete'){
        this.descartarCambios = true;
      }
    
      this.formStock.valueChanges.subscribe(
        changes => {
          let cambios_datos:boolean;
          let cambios_cantidad:boolean;
          let cambios_precio:boolean;
          for(const key in changes){
            if(this.respaldoStock[key] != changes[key]){
              if(key == 'cantidad' || key == 'entrada_piezas'){
                cambios_cantidad = true;
              }else if(key != 'precio_unitario' && key != 'iva'){
                cambios_datos = true;
              }else{
                cambios_precio = true;
              }
            }
          }

          if(cambios_datos && this.resumenMovimientos.ENT.total > 0){
            this.accionLote = 'create';
          }else if(cambios_datos && this.resumenMovimientos.ENT.total == 0){
            this.accionLote = 'edit';
          }else if(cambios_cantidad || cambios_precio){
            this.accionLote = 'edit';
          }else{
            this.accionLote = '';
          }

          if(this.accionLote == 'create' && this.resumenMovimientos.SAL.total > 0){
            this.accionSalidas = 'select';
            this.seleccionSalidasActivada = true;

            if(this.resumenMovimientos.SAL.total > this.resumenMovimientos.ENT.total){
              //Aqui hacer validaciones para que tenga que seleccionar salidas de manera obligatoria, o marcar error
            }
          }else if(this.accionLote == 'edit' && this.resumenMovimientos.SAL.total > 0){
            this.seleccionSalidasActivada = false;
            if(cambios_cantidad){
              //this.accionSalidas = 'modify';
              //validar existencias despues del cambio en base a las salidas
            }
          }else{
            this.seleccionSalidasActivada = false;
          }

          if(!this.seleccionSalidasActivada){
            this.accionSalidas = '';
          }

          this.infoMessage = [];
          
          if(this.respaldoStock['programa_id'] != changes['programa_id']){
            this.infoMessage.push('El Programa ha sido modificado');
          }

          if(this.respaldoStock['almacen_id'] != changes['almacen_id']){
            this.infoMessage.push('El Almacen ha sido modificado');
          }

          if(cambios_cantidad || cambios_datos || cambios_precio){
            this.descartarCambios = true;
          }

          this.calcularExistencias();
        }
      );
    }else{
      this.formStock = this.formBuilder.group({id:[''],cantidad:[''],entrada_piezas:['']});
      let result = this.verificarFechaCaducidad(this.data.stock.fecha_caducidad);
      this.estatusCaducidad = result.estatus;
      //this.seleccionSalidasActivada = true;
      //this.accionLote = this.data.stock.accion_lote;
      //this.accionSalidas = this.data.stock.accion_salidas;
      //this.etiquetaEstatus = result.label;
    }

    this.dataSourceMovimientos = new MatTableDataSource<any>([]);
    this.dataSourceMovimientos.paginator = this.lotesPaginator;
    this.dataSourceMovimientos.sort = this.sort;
    this.isLoadingMovimientos = true;

    this.almacenService.cargarMovimientosStock(this.data.stock.stock_id).subscribe(
      response =>{
        if(response.error) {
          let errorMessage = response.error.message;
          //this.sharedService.showSnackBar(errorMessage, null, 3000);
          this.alertPanel.mostrarError('Error: '+errorMessage);
        } else {
          let index = 0;
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
            item.no_index = index++;

            if(item.modo_movimiento == 'UNI'){
              item.cantidad_piezas = item.cantidad;
            }else{
              item.cantidad_piezas = item.cantidad * this.piezasXEmpaque;
            }
          });

          this.indexSeleccionable = response.data.findIndex(x => x.mov_articulo_id == this.data.stock.id);

          //calcular página inicial
          let initial_page = Math.ceil((this.indexSeleccionable+1)/this.pageSize);
          this.lotesPaginator.pageIndex = initial_page - 1;

          this.dataSourceMovimientos = new MatTableDataSource<any>(response.data);
          this.dataSourceMovimientos.paginator = this.lotesPaginator;
          this.dataSourceMovimientos.sort = this.sort;

          response.resumen.forEach(item => {
            if(this.resumenMovimientos[item.direccion_movimiento]){
              if(item.modo_movimiento == 'UNI'){
                this.resumenMovimientos[item.direccion_movimiento]['total'] += +item.cantidad;
              }else{
                this.resumenMovimientos[item.direccion_movimiento]['total'] += (+item.cantidad * this.piezasXEmpaque);
            }
            }
          });

          if(this.respaldoStock){
            if(!this.respaldoStock.entrada_piezas){
              this.resumenMovimientos['ENT']['total'] -= this.respaldoStock.cantidad * this.piezasXEmpaque;
            }else{
              this.resumenMovimientos['ENT']['total'] -= this.respaldoStock.cantidad;
            }
          }else if(this.modoConflicto){
            console.log('new respalgo------');
            if(!this.data.stock.entrada_piezas){
              this.resumenMovimientos['ENT']['total'] -= this.data.stock.cantidad * this.piezasXEmpaque;
            }else{
              this.resumenMovimientos['ENT']['total'] -= this.data.stock.cantidad;
            }
          }
          
          this.resumenMovimientos['ENT']['uni'] -= (this.resumenMovimientos['ENT']['total'] % this.piezasXEmpaque);
          this.resumenMovimientos['ENT']['nrm'] += Math.floor(this.resumenMovimientos['ENT']['total'] / this.piezasXEmpaque);

          this.resumenMovimientos['SAL']['uni'] -= (this.resumenMovimientos['SAL']['total'] % this.piezasXEmpaque);
          this.resumenMovimientos['SAL']['nrm'] += Math.floor(this.resumenMovimientos['SAL']['total'] / this.piezasXEmpaque);

          console.log('configurar acciones:',this.data.stock);

          if(this.modoConflicto){
            if(this.data.stock.estatus_articulo == 'DEL'){
              this.data.stock.marcado_borrar = true;
            }else if(this.data.stock.estatus_articulo == 'EDIT'){
              //Checar entradas y salidas
              if(this.resumenMovimientos.SAL.total > 0 && this.resumenMovimientos.ENT.total == 0){
                this.accionLote = 'edit';
                this.accionSalidas = '';
                this.seleccionSalidasActivada = false;
                //this.totalPiezasSalidas = this.resumenMovimientos.SAL.total;
              }else if(this.resumenMovimientos.SAL.total > 0 && this.resumenMovimientos.ENT.total > 0){
                this.accionLote = 'create';
                this.accionSalidas = 'select';
                this.seleccionSalidasActivada = true;
              }else{
                this.accionLote = 'edit';
                this.accionSalidas = '';
                this.seleccionSalidasActivada = false;
              }
            }
          }

          this.formStock.patchValue(this.data.stock);
          this.checarCaducidadFormulario();

          if(this.data.stock.marcado_borrar){
            this.marcarEliminarLote();
          }

          if(this.data.stock.lista_salidas && this.data.stock.lista_salidas.length > 0){
            this.data.stock.lista_salidas.forEach(id =>{
              let index = this.dataSourceMovimientos.data.findIndex(x => x.mov_articulo_id == id);
              this.seleccionarSalida(index,id,'SAL');
            });
          }

          this.calcularExistencias();
        }
        this.isLoadingMovimientos = false;
      },
      errorResponse =>{
        var errorMessage = "Ocurrió un error.";
        if(errorResponse.status == 409){
          errorMessage = errorResponse.error.error.message;
        }
        //this.sharedService.showSnackBar(errorMessage, null, 3000);
        //this.alertPanel.mostrarError('Error: '+errorMessage);
        this.isLoadingMovimientos = false;
      }
    );
  }

  descartarCambiosStock(){
    if(this.descartarCambios){
      this.salidasSeleccionadas = {};
      this.contadorSalidas = 0;
      this.totalPiezasSalidas = 0;
      this.seleccionSalidasActivada = false;

      let programa_id = this.formStock.get('programa_id').value;
      let almacen_id = this.formStock.get('almacen_id').value;

      this.formStock.reset();
      if(this.respaldoStock.memo_folio){
        this.toggleCartaCanje(true);
      }else{
        this.toggleCartaCanje(false);
      }

      this.descartarCambios = false;

      let respaldo = JSON.parse(JSON.stringify(this.respaldoStock));
      respaldo.programa_id = programa_id;
      respaldo.almacen_id = almacen_id;
      this.formStock.patchValue(respaldo);

      this.checarCaducidadFormulario();
      this.calcularExistencias();
    }
  }

  aceptarCambiosStock(){
    let datos_form:any = this.formStock.value;
    let lista_salidas:number[] = [];

    if(this.existenciasLote.existencia_piezas < 0 || (this.existenciasNuevoLote && this.existenciasNuevoLote.existencia_piezas < 0)){
      this.alertPanel.mostrarError('Error: La existencias del lote alcanzan numeros negativos');
      return false;
    }
    
    for (const key in this.salidasSeleccionadas) {
      if(this.salidasSeleccionadas[key]){
        lista_salidas.push(+key);
      }
    }

    let datos_respuesta:any = {
      formulario: datos_form,
      respaldo: this.respaldoStock,
      estatus_caducidad: this.estatusCaducidad,
      lista_salidas: lista_salidas,
      accion_lote: this.accionLote,
      accion_salidas: this.accionSalidas,
    };
    
    this.dialogRef.close(datos_respuesta);
  }

  checarCaducidadFormulario(){
    //this.estatusCaducidad = this.data.stock.estatus_caducidad;
    if(this.formStock.get('fecha_caducidad')){
      let fecha = this.formStock.get('fecha_caducidad').value;
      fecha = this.datePipe.transform(fecha, 'yyyy-MM-dd');

      let result = this.verificarFechaCaducidad(fecha);
      this.estatusCaducidad = result.estatus; //Caducado
      this.etiquetaEstatus = result.label;
    }
  }

  verificarFechaCaducidad(fecha_caducidad):any{
    this.estatusCaducidad = 1;
    this.etiquetaEstatus = '';
    let estatus_caducidad:any = {estatus:1, label:''};

    //if(this.formLote.get('fecha_caducidad').value){
    if(fecha_caducidad){
      let fecha_caducidad_date = new Date(fecha_caducidad + 'T00:00:00');
      
      let fecha_comparacion = this.fechaActual;
      if(this.data.fecha_movimiento){
        fecha_comparacion = this.data.fecha_movimiento;
      }

      let diferencia_fechas = new Date(fecha_caducidad_date.getTime() - fecha_comparacion.getTime());
      let diferencia_dias = Math.floor(diferencia_fechas.getTime() / (1000*60*60*24));

      if (diferencia_dias < 0){
        estatus_caducidad.estatus = 3;
        estatus_caducidad.label = 'Caducado';
      }else if (diferencia_dias >= 90){
        estatus_caducidad.estatus = 1;
        estatus_caducidad.label = '';
      }else{
        estatus_caducidad.estatus = 2;
        estatus_caducidad.label = 'Por caducar';
      }
    }

    return estatus_caducidad;
  }

  toggleCartaCanje(mostrar:boolean){
    this.mostrarCartaCanje = mostrar;

    if(this.mostrarCartaCanje){
      if(!this.formStock.get('memo_folio')){
        this.formStock.addControl('memo_folio',new FormControl('',Validators.required));
        this.formStock.addControl('memo_fecha',new FormControl('',Validators.required));
        this.formStock.addControl('vigencia_meses',new FormControl('',Validators.required));
      }
    }else{
      if(this.formStock.get('memo_folio')){
        this.formStock.removeControl('memo_folio');
        this.formStock.removeControl('memo_fecha');
        this.formStock.removeControl('vigencia_meses');
      }
    }
  }

  marcarEliminarLote(){
    this.marcadoParaEliminar = !this.marcadoParaEliminar;
    for(const key in this.formStock.controls) {
      if(key != 'id'){
        if(this.marcadoParaEliminar){
          this.formStock.get(key).disable();
        }else{
          this.formStock.get(key).enable();
        }
      }
    }

    if(this.marcadoParaEliminar){
      this.descartarCambiosStock();
      //this.formStock.patchValue(this.respaldoStock);
      this.accionLote = 'delete';
      if(this.resumenMovimientos.SAL.total > 0 && this.resumenMovimientos.ENT.total == 0){
        this.accionSalidas = 'delete-all';
        this.seleccionSalidasActivada = false;
        this.totalPiezasSalidas = this.resumenMovimientos.SAL.total;
      }else if(this.resumenMovimientos.SAL.total > 0 && this.resumenMovimientos.ENT.total > 0){
        this.accionSalidas = 'delete';
        this.seleccionSalidasActivada = true;
      }else{
        this.accionSalidas = '';
        this.seleccionSalidasActivada = false;
      }
    }else{
      this.accionLote = '';
      this.accionSalidas = '';
      this.seleccionSalidasActivada = false;
      this.salidasSeleccionadas = {};
      this.contadorSalidas = 0;
      this.totalPiezasSalidas = 0;
    }

    //this.toggleCartaCanje(false);
    //this.checarCaducidadFormulario();
    this.calcularExistencias();
  }

  seleccionarSalida(index,id,direccion){
    if(index > this.indexSeleccionable && direccion == 'SAL' && this.seleccionSalidasActivada){
      if(!this.salidasSeleccionadas[id]){
        this.salidasSeleccionadas[id] = this.dataSourceMovimientos.data[index].cantidad_piezas;
        this.totalPiezasSalidas += this.salidasSeleccionadas[id];
        this.contadorSalidas++;
      }else{
        this.totalPiezasSalidas -= this.salidasSeleccionadas[id];
        this.salidasSeleccionadas[id] = 0;
        this.contadorSalidas--;
      }
      this.calcularExistencias();
    }
  }

  calcularExistencias(){
    let form_cantidad = this.formStock.get('cantidad').value;
    if(!this.formStock.get('entrada_piezas').value){
      form_cantidad = form_cantidad * this.piezasXEmpaque;
    }
    
    let existenciasCalculadas = this.resumenMovimientos.ENT.total - this.resumenMovimientos.SAL.total;
    if(this.accionLote != 'delete' && this.accionLote != 'create'){
      existenciasCalculadas += form_cantidad;
    }

    //totalPiezasSalidas contiene el total de todas las salidas seleccionadas para ser movidas/borradas
    if(this.totalPiezasSalidas > 0){
      existenciasCalculadas += this.totalPiezasSalidas;
    }

    this.existenciasLote = {
      cantidad: Math.floor(existenciasCalculadas / this.piezasXEmpaque),
      piezas: existenciasCalculadas % this.piezasXEmpaque,
      existencia_piezas: existenciasCalculadas,
    };

    if(this.accionLote == 'create'){
      form_cantidad -= this.totalPiezasSalidas;

      this.existenciasNuevoLote = {
        cantidad: Math.floor(form_cantidad / this.piezasXEmpaque),
        piezas: form_cantidad % this.piezasXEmpaque,
        existencia_piezas: form_cantidad,
      }
    }else{
      this.existenciasNuevoLote = null;
    }
  }

  cancelarEdicion(){
    this.dialogRef.close();
  }

  previewMovimiento(event,id){
    event.stopPropagation();

    let configDialog = {
      width: '80%',
      height: '90%',
      maxWidth: '100%',
      disableClose: false,
      data:{id: id},
      panelClass: 'no-padding-dialog'
    };

    this.subDialogRef = this.dialog.open(DialogoPreviewMovimientoComponent, configDialog);
  }

  displayFn(marca: any): string {
    return marca && marca.nombre ? marca.nombre : '';
  }

  private _filter(value: string): any[] {
    if(this.catalogoMarcas){
      const filterValue = value.toLowerCase();
      return this.catalogoMarcas.filter(marca => marca.nombre.toLowerCase().includes(filterValue));
    }else{
      return [];
    }
  }

}
