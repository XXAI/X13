import { DatePipe } from '@angular/common';
import { Component, OnInit, Input, SimpleChange, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatInput } from '@angular/material/input';
import { CustomValidator } from 'src/app/utils/classes/custom-validator';

@Component({
  selector: 'inner-articulo-lista-lotes',
  templateUrl: './inner-articulo-lista-lotes.component.html',
  styleUrls: ['./inner-articulo-lista-lotes.component.css']
})
export class InnerArticuloListaLotesComponent implements OnInit {
  @ViewChild(MatInput) inputFormLote: MatInput;
  @ViewChild('inputValue') inputValue: ElementRef;

  @Input() articulo: any;
  @Input() tipoSalida: any;
  @Input() puedeSurtirUnidades:boolean;
  @Input() edicionActiva: boolean;
  @Input() tieneSolicitud: boolean;
  @Input() fechaMovimiento: Date;

  @Output() cambiosEnLotes = new EventEmitter<any>();

  constructor(
    private formBuilder: FormBuilder,
    private datePipe: DatePipe
  ) { }

  loteEditIndex: number;
  formLote: FormGroup;

  fechaActual: Date;
  estatusCaducidad: number;  // 0 = Sin Caducidad, 1 = Normal, 2 = Por Caducar, 3 = Caducado
  coloresCaducidad: any;
  listaIconosEstatus: any;
  etiquetaEstatus: string;

  mostrarCartaCanje: boolean;

  ngOnInit(): void {
    this.coloresCaducidad = {1:'verde', 2:'ambar', 3:'rojo'};
    this.listaIconosEstatus = {1:'task_alt', 2:'notification_important', 3:'warning'};
    this.fechaActual = new Date();
    this.loteEditIndex = -1;
    this.mostrarCartaCanje = false;

    let formConfig:any = {
      id:[''],
      lote:['',Validators.required],
      codigo_barras:[''],
      cantidad:['',Validators.required],
      precio_unitario:[''],
      iva:[''],
    };
    
    if(this.articulo.tiene_fecha_caducidad){
      formConfig.fecha_caducidad = ['',[Validators.required,CustomValidator.isValidDate()]];
    }else{
      formConfig.fecha_caducidad = ['',CustomValidator.isValidDate()];
    }
    
    this.formLote = this.formBuilder.group(formConfig);
    this.formLote.reset();

    let estatus_articulo = 1;

    if(!this.articulo.nuevos_lotes){
      this.articulo.nuevos_lotes = [];
    }

    this.articulo.lotes.forEach(loteData => {
      loteData.hash = loteData.lote + loteData.fecha_caducidad + loteData.codigo_barras;
    
      let result = this.verificarFechaCaducidad(loteData.fecha_caducidad);
      loteData.estatus_caducidad = result.estatus;
      loteData.icono_estatus = this.listaIconosEstatus[loteData.estatus_caducidad];

      if(estatus_articulo < loteData.estatus_caducidad){
        estatus_articulo = loteData.estatus_caducidad;
      }

      if(this.articulo.surtir_en_unidades){
        loteData.existencia = loteData.existencia_piezas;
      }else{
        loteData.existencia = loteData.existencia_empaque;
      }
      
      if(!loteData.salida){
        loteData.restante = loteData.existencia;
        loteData.salida = null;  
      }

      if(!loteData.empaque_detalle){
        loteData.empaque_detalle = {descripcion: 'Sin Detalles', piezas_x_empaque: 1};
      }else if(typeof loteData.empaque_detalle === 'string'){
        loteData.empaque_detalle = {descripcion: loteData.empaque_detalle};
      }

      if(loteData.empaque_detalle.piezas_x_empaque){
        loteData.piezas_x_empaque = loteData.empaque_detalle.piezas_x_empaque;
      }

      if(this.articulo.surtir_en_unidades){
        loteData.resguardo_apartado = loteData.resguardo_piezas;
      }else{
        loteData.resguardo_apartado = Math.ceil(loteData.resguardo_piezas/loteData.piezas_x_empaque);
      }
    });
    this.articulo.estatus = estatus_articulo;
    if(this.articulo.puede_surtir_unidades && this.articulo.surtir_en_unidades){
      this.surtirUnidades(this.articulo.surtir_en_unidades);
    }

    
    setTimeout(() => {
      if(this.inputValue){
      this.inputValue.nativeElement.focus();  
      }
    }, 100);
  }

  surtirUnidades(checked){
    this.articulo.surtir_en_unidades = checked;
    if(this.articulo.surtir_en_unidades){
      this.articulo.existencias = this.articulo.existencias_unidades;
    }else{
      this.articulo.existencias = this.articulo.existencias_empaque;
    }
    
    let articulo_restante = 0;
    this.articulo.lotes.forEach(loteData => {
      if(this.articulo.surtir_en_unidades){
        loteData.existencia = loteData.existencia_piezas;
        loteData.resguardo_apartado = loteData.resguardo_piezas;
      }else{
        loteData.existencia = loteData.existencia_empaque;
        loteData.resguardo_apartado = Math.ceil(loteData.resguardo_piezas/loteData.piezas_x_empaque);
      }

      if(!loteData.salida){
        loteData.restante = loteData.existencia;
      }else{
        loteData.restante = loteData.existencia - loteData.salida;
      }

      this.aplicarCantidad(loteData,true);

      articulo_restante += loteData.restante;
    });
    this.articulo.existencias_restantes = articulo_restante;
  }

  ngOnChanges(changes: SimpleChange){
    for (const propName in changes) {
      if(propName == 'fechaMovimiento'){
        const chng = changes[propName];
        if(chng.previousValue){
          //console.log(`Trabajando las caducidades en `+this.articulo.clave);
          let estatus_articulo = 1;
          this.articulo.lotes.forEach(loteData => {
            let result = this.verificarFechaCaducidad(loteData.fecha_caducidad);
            loteData.estatus_caducidad = result.estatus;
            loteData.icono_estatus = this.listaIconosEstatus[loteData.estatus_caducidad];

            if(estatus_articulo < loteData.estatus_caducidad){
              estatus_articulo = loteData.estatus_caducidad;
            }
          });
          this.articulo.estatus = estatus_articulo;
          //console.log(`Terminado `+this.articulo.clave);
        }else{
          //console.log(`Incializando `+this.articulo.clave);
        }
      }else if(propName == 'articulo'){
        const chng = changes[propName];
        let cur  = chng.currentValue;
        //console.log(`Cambio de valor en ${propName}: clave = ${cur.clave}`);
      }else if(propName == 'tieneSolicitud'){
        const chng = changes[propName];
        let cur  = chng.currentValue;
        //console.log(`Cambio de valor en ${propName}: clave = ${cur}`);
      }else if(propName == 'tipoSalida'){
        const chng = changes[propName];
        let cur = chng.currentValue;
        /*if(cur && !(cur.clave == 'RCTA' || cur.clave == 'PSNL')){
          this.surtirUnidades(false);
        }*/
        /*if(cur){
          console.log(`Cambio de valor en ${propName}: clave = ${cur.clave}`);
        }*/
      }
    }
  }

  checarTotalSolicitado(value){
    this.articulo.cantidad_solicitado = value;
    if(value < this.articulo.total_piezas){
      for (let index = this.articulo.lotes.length-1; index >= 0; index--) {
        let lote = this.articulo.lotes[index];
        this.aplicarCantidad(lote,true);
      }
    }
  }

  aplicarCantidad(lote:any, force:boolean = false){
    if(lote.salida !== undefined && this.edicionActiva){
      if((lote.restante != (lote.existencia - lote.salida)) || force){
        if(this.tieneSolicitud){
          let cantidad_surtida = this.articulo.total_piezas - (lote.existencia - lote.restante) + lote.salida;
          if( cantidad_surtida > this.articulo.cantidad_solicitado){
            lote.salida -= (cantidad_surtida - this.articulo.cantidad_solicitado);
          }
        }
  
        if(lote.salida < 0){
          lote.salida = 0;
        }
  
        if((lote.existencia - lote.salida) < 0){
          lote.salida = lote.existencia;
        }
  
        let estado_anterior = this.obtenerEstadoActualArticulo();
  
        this.articulo.total_piezas -= (lote.existencia - lote.restante);
        this.articulo.total_piezas += lote.salida;
        //this.articulo.existencias_restantes = this.articulo.existencias - this.articulo.total_piezas;
        this.articulo.existencias_restantes += (lote.existencia - lote.restante);
        this.articulo.existencias_restantes -= lote.salida;
  
        lote.restante = lote.existencia - lote.salida;
        this.cambiosEnLotes.emit({accion:'ActualizarCantidades',value:estado_anterior});
      } 
    }
  }

  editarLote(index:number){
    if(this.loteEditIndex >= 0){
      this.cancelarEdicion();
    }

    this.loteEditIndex = index;

    let result = this.verificarFechaCaducidad(this.articulo.nuevos_lotes[index].fecha_caducidad);
    this.estatusCaducidad = result.estatus; //Caducado
    this.etiquetaEstatus = result.label;

    let item = JSON.parse(JSON.stringify(this.articulo.nuevos_lotes[index]));
    item.memo_fecha = new Date(item.memo_fecha + 'T00:00:00');
    item.fecha_caducidad = new Date(item.fecha_caducidad + 'T00:00:00');

    this.formLote.patchValue(item);
    this.formLote.markAllAsTouched();
    setTimeout(() => {
      this.inputFormLote.focus();  
    }, 10);
  }

  cancelarEdicion(){
    if(!this.articulo.nuevos_lotes[this.loteEditIndex].hash){
      this.articulo.nuevos_lotes.splice(this.loteEditIndex,1);
    }
    this.loteEditIndex = -1;
    this.formLote.reset();
    this.estatusCaducidad = 1;
    this.etiquetaEstatus = '';
    this.mostrarCartaCanje = false;
  }

  checarCaducidadFormulario(){
    let fecha = this.formLote.get('fecha_caducidad').value;
    fecha = this.datePipe.transform(fecha, 'yyyy-MM-dd');

    let result = this.verificarFechaCaducidad(fecha);
    this.estatusCaducidad = result.estatus; //Caducado
    this.etiquetaEstatus = result.label;
  }

  verificarFechaCaducidad(fecha_caducidad):any{
    this.estatusCaducidad = 1;
    this.etiquetaEstatus = '';
    let estatus_caducidad:any = {estatus:1, label:''};

    //if(this.formLote.get('fecha_caducidad').value){
    if(fecha_caducidad){
      let fecha_caducidad_date = new Date(fecha_caducidad + 'T00:00:00');
      
      let fecha_comparacion = this.fechaActual;
      if(this.fechaMovimiento){
        fecha_comparacion = this.fechaMovimiento;
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
  
  guardarCambiosLote(){
    if(this.formLote.valid){
      this.checarCaducidadFormulario();
      
      let monto_iva = 0;
      let loteData = this.formLote.value;

      loteData.fecha_caducidad = this.datePipe.transform(loteData.fecha_caducidad, 'yyyy-MM-dd');
      if(loteData.memo_fecha){
        loteData.memo_fecha = this.datePipe.transform(loteData.memo_fecha, 'yyyy-MM-dd');
      }

      loteData.estatus_caducidad = this.estatusCaducidad;
      loteData.icono_estatus = this.listaIconosEstatus[loteData.estatus_caducidad];
      loteData.hash = loteData.lote + loteData.fecha_caducidad + loteData.codigo_barras;
      loteData.precio_unitario = parseFloat(loteData.precio_unitario||0);

      if(+loteData.iva > 0){
        monto_iva = (+loteData.iva * loteData.precio_unitario) / 100;
      }
      loteData.total_monto = +loteData.cantidad * (loteData.precio_unitario + monto_iva);
      loteData.salida = loteData.cantidad;
      loteData.existencia = loteData.cantidad;
      loteData.restante = 0;

      let estado_anterior = this.obtenerEstadoActualArticulo();

      if(this.articulo.nuevos_lotes[this.loteEditIndex].hash){
        this.articulo.total_piezas -= +this.articulo.nuevos_lotes[this.loteEditIndex].salida;
        this.articulo.existencias_extras -= +this.articulo.nuevos_lotes[this.loteEditIndex].existencia;

        this.articulo.nuevos_lotes[this.loteEditIndex] = loteData;
        this.articulo.total_piezas += +loteData.salida;
        this.articulo.existencias_extras += +loteData.existencia;
        //this.articulo.existencias_restantes -= +loteData.salida;
        //this.articulo.total_monto += loteData.total_monto;
      }else{
        let loteIndex = this.articulo.nuevos_lotes.findIndex(x => x.hash === loteData.hash);
        if(loteIndex >= 0){
          console.log('lote ya capturado');
        }else{
          this.articulo.nuevos_lotes.push(loteData);
          this.articulo.total_piezas += +loteData.salida;
          this.articulo.existencias_extras += +loteData.existencia;
        }
      }

      let estatus_articulo = 1;
      this.articulo.nuevos_lotes.forEach(loteData => {
        if(estatus_articulo < loteData.estatus_caducidad){
          estatus_articulo = loteData.estatus_caducidad;
        }
      });
      this.articulo.estatus = estatus_articulo;
      
      this.cambiosEnLotes.emit({accion:'ActualizarCantidades',value:estado_anterior});

      this.cancelarEdicion();
    }else{
      this.formLote.markAllAsTouched();
    }
  }

  eliminarLote(index:number){
    if(this.loteEditIndex < 0){
      let estado_anterior = this.obtenerEstadoActualArticulo();

      this.articulo.total_piezas -= this.articulo.nuevos_lotes[index].salida;
      this.articulo.existencias_extras -= +this.articulo.nuevos_lotes[index].existencia;
      
      //this.articulo.total_monto -=  this.articulo.nuevos_lotes[index].total_monto;
      //this.articulo.no_lotes -= 1;
      this.articulo.nuevos_lotes.splice(index,1);
      this.cambiosEnLotes.emit({accion:'ActualizarCantidades',value:estado_anterior});
    }
  }

  obtenerEstadoActualArticulo(): any{
    let estado = {
      id: this.articulo.id,
      total_piezas: this.articulo.total_piezas,
      existencias_extras: this.articulo.existencias_extras,
      //no_lotes: this.articulo.no_lotes, 
      //total_monto: this.articulo.total_monto,
    };
    return estado;
  }

  agregarLote(){
    this.articulo.nuevos_lotes.push({});
    this.loteEditIndex = this.articulo.nuevos_lotes.length-1;
    setTimeout(() => {
      this.inputFormLote.focus();  
    }, 10);
  }

}
