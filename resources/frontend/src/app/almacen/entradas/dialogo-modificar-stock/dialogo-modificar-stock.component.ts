import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Observable } from 'rxjs';
import { CustomValidator } from 'src/app/utils/classes/custom-validator';
import { AlmacenService } from '../../almacen.service';
import { DialogoPreviewMovimientoComponent } from '../../tools/dialogo-preview-movimiento/dialogo-preview-movimiento.component';

export interface DialogData {
  stock: any;
  articulo: any;
}

@Component({
  selector: 'app-dialogo-modificar-stock',
  templateUrl: './dialogo-modificar-stock.component.html',
  styleUrls: ['./dialogo-modificar-stock.component.css']
})
export class DialogoModificarStockComponent implements OnInit {
  @ViewChild(MatPaginator) lotesPaginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<DialogoModificarStockComponent>,
    private dialog: MatDialog, 
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private almacenService: AlmacenService,
  ) { }

  isLoading: boolean;
  isLoadingMovimientos: boolean;

  mostrarCartaCanje: boolean;
  marcadoParaEliminar: boolean;

  indexSeleccionable: number;
  salidasSeleccionadas: any;
  contadorSalidas: number;
  seleccionSalidasActivada: boolean;

  respaldoStock: any;
  accionLote: string;
  accionSalidas: string;

  formStock: FormGroup;
  fechaActual: Date;

  estatusCaducidad: number;
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

  listaEstatusIconos: any = { 'BOR':'content_paste',  'FIN':'assignment_turned_in',   'CAN':'cancel',     'PERE':'pending_actions',       'SOL':'edit_notifications',         'MOD':'note_alt'};
  listaEstatusClaves: any = { 'BOR':'borrador',       'FIN':'concluido',              'CAN':'cancelado',  'PERE':'pendiente-recepcion',   'SOL':'peticion-modificacion',      'MOD':'modificacion-aprobada'};
  listaEstatusLabels: any = { 'BOR':'Borrador',       'FIN':'Concluido',              'CAN':'Cancelado',  'PERE':'Pendiente de Recepción','SOL':'Petición de Modificación',   'MOD':'Modificación Activa'};

  ngOnInit(): void {
    let formConfig:any;
    this.fechaActual = new Date();
    this.salidasSeleccionadas = {};
    this.contadorSalidas = 0;
    this.seleccionSalidasActivada = false;

    this.piezasXEmpaque = 1;
    if(this.data.stock.empaque_detalle){
      this.piezasXEmpaque = this.data.stock.empaque_detalle.piezas_x_empaque;
    }
    
    if(this.data.articulo.tipo_formulario == 'MEDS'){
      formConfig = {
        id:[''],
        stock_id:[''],
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
    this.formStock.patchValue(this.data.stock);

    this.respaldoStock = JSON.parse(JSON.stringify(this.data.stock));
    
    this.formStock.valueChanges.subscribe(
      changes => {
        let cambios_datos:boolean;
        let cambios_cantidad:boolean;
        for(const key in changes){
          if(this.respaldoStock[key] != changes[key]){
            if(key == 'cantidad' || key == 'entrada_piezas'){
              cambios_cantidad = true;
            }else{
              cambios_datos = true;
            }
          }
        }

        if(cambios_datos && this.resumenMovimientos.ENT.total > 0){
          this.accionLote = 'create';
        }else if(cambios_datos && this.resumenMovimientos.ENT.total == 0){
          this.accionLote = 'edit';
        }else if(cambios_cantidad){
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
      }
    );

    this.dataSourceMovimientos = new MatTableDataSource<any>([]);
    this.dataSourceMovimientos.paginator = this.lotesPaginator;
    this.dataSourceMovimientos.sort = this.sort;
    this.isLoadingMovimientos = true;

    this.almacenService.cargarMovimientosStock(this.data.stock.stock_id).subscribe(
      response =>{
        if(response.error) {
          let errorMessage = response.error.message;
          //this.sharedService.showSnackBar(errorMessage, null, 3000);
          //this.alertPanel.mostrarError('Error: '+errorMessage);
        } else {
          console.log(response);
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
          });

          this.indexSeleccionable = response.data.findIndex(x => x.mov_articulo_id == this.data.stock.id);

          //calcular página inicial
          let initial_page = Math.ceil((this.indexSeleccionable+1)/this.pageSize);
          this.lotesPaginator.pageIndex = initial_page - 1;

          this.dataSourceMovimientos = new MatTableDataSource<any>(response.data);
          this.dataSourceMovimientos.paginator = this.lotesPaginator;
          this.dataSourceMovimientos.sort = this.sort;

          this.resumenMovimientos = {
            'ENT':{'nrm':0,'uni':0,'total':0},
            'SAL':{'nrm':0,'uni':0,'total':0}
          }
          response.resumen.forEach(item => {
            if(this.resumenMovimientos[item.direccion_movimiento]){
              if(item.modo_movimiento == 'UNI'){
                this.resumenMovimientos[item.direccion_movimiento]['total'] += +item.cantidad;
              }else{
                this.resumenMovimientos[item.direccion_movimiento]['total'] += (+item.cantidad * this.piezasXEmpaque);
            }
            }
          });

          if(!this.data.stock.entrada_piezas){
            this.resumenMovimientos['ENT']['total'] -= this.data.stock.cantidad * this.piezasXEmpaque;
          }else{
            this.resumenMovimientos['ENT']['total'] -= this.data.stock.cantidad;
          }

          this.resumenMovimientos['ENT']['uni'] -= (this.resumenMovimientos['ENT']['total'] % this.piezasXEmpaque);
          this.resumenMovimientos['ENT']['nrm'] += Math.floor(this.resumenMovimientos['ENT']['total'] / this.piezasXEmpaque);

          this.resumenMovimientos['SAL']['uni'] -= (this.resumenMovimientos['SAL']['total'] % this.piezasXEmpaque);
          this.resumenMovimientos['SAL']['nrm'] += Math.floor(this.resumenMovimientos['SAL']['total'] / this.piezasXEmpaque);
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

  aceptarCambiosStock(){
    let datos_form = this.formStock.value;
    console.log(datos_form);
  }

  checarCaducidadFormulario(){
    //
  }

  toggleCartaCanje(toggle){
    //
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
      this.formStock.patchValue(this.respaldoStock);
      this.accionLote = 'delete';
      if(this.resumenMovimientos.SAL.total > 0 && this.resumenMovimientos.ENT.total == 0){
        this.accionSalidas = 'delete';
        this.seleccionSalidasActivada = false;
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
    }
  }

  seleccionarSalida(index,id,direccion){
    if(index > this.indexSeleccionable && direccion == 'SAL' && this.seleccionSalidasActivada){
      if(!this.salidasSeleccionadas[id]){
        this.salidasSeleccionadas[id] = true;
        this.contadorSalidas++;
      }else{
        this.salidasSeleccionadas[id] = false;
        this.contadorSalidas--;
      }
    }
  }

  cancelarEdicion(){
    this.dialogRef.close();
  }

  previewMovimiento(id){
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
