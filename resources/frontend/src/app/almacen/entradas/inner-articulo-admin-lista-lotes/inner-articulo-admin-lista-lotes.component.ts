import { Component, OnInit, Input, SimpleChange, Output, EventEmitter, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatInput } from '@angular/material/input';
import { CustomValidator } from 'src/app/utils/classes/custom-validator';

@Component({
  selector: 'inner-articulo-admin-lista-lotes',
  templateUrl: './inner-articulo-admin-lista-lotes.component.html',
  styleUrls: ['./inner-articulo-admin-lista-lotes.component.css']
})

export class InnerArticuloAdminListaLotesComponent implements OnInit {
  @ViewChild(MatInput) inputFormLote: MatInput;

  @Input() articulo: any;
  @Input() edicionActiva: boolean;
  @Input() fechaMovimiento: Date;

  @Output() cambiosEnLotes = new EventEmitter<any>();

  constructor(
    private formBuilder: FormBuilder
  ) { }

  loteEditIndex: number;
  formLote: FormGroup;

  fechaActual: Date;
  estatusCaducidad: number;  // 0 = Sin Caducidad, 1 = Normal, 2 = Por Caducar, 3 = Caducado
  coloresCaducidad: any;
  listaIconosEstatus: any;
  etiquetaEstatus: string;
  
  ngOnInit(): void {
    this.coloresCaducidad = {1:'verde', 2:'ambar', 3:'rojo'};
    this.listaIconosEstatus = {1:'task_alt', 2:'notification_important', 3:'warning'};
    this.fechaActual = new Date();
    this.loteEditIndex = -1;

    let estatus_articulo = 1;
    this.articulo.lotes.forEach(loteData => {
      loteData.hash = loteData.lote + loteData.fecha_caducidad + loteData.codigo_barras;
      
      let result = this.verificarFechaCaducidad(loteData.fecha_caducidad);
      loteData.estatus_caducidad = result.estatus;
      loteData.icono_estatus = this.listaIconosEstatus[loteData.estatus_caducidad];

      if(estatus_articulo < loteData.estatus_caducidad){
        estatus_articulo = loteData.estatus_caducidad;
      }
    });
    this.articulo.estatus = estatus_articulo;

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

    if(this.articulo.lotes.length == 0){
      this.agregarLote();
    }
  }

  ngOnChanges(changes: SimpleChange){
    for (const propName in changes) {
      if(propName == 'fechaMovimiento'){
        const chng = changes[propName];
        if(chng.previousValue){
          console.log(`Trabajando las caducidades en `+this.articulo.clave);
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
          console.log(`Terminado `+this.articulo.clave);
        }else{
          console.log(`Incializando `+this.articulo.clave);
        }
      }else if(propName == 'articulo'){
        const chng = changes[propName];
        let cur  = chng.currentValue;
        console.log(`Cambio de valor en ${propName}: clave = ${cur.clave}`);
      }
    }
  }

  editarLote(index:number){
    if(this.loteEditIndex >= 0){
      this.cancelarEdicion();
    }
    this.loteEditIndex = index;
    this.formLote.patchValue(this.articulo.lotes[index]);
    this.checarCaducidadFormulario();
    this.formLote.markAllAsTouched();
    setTimeout(() => {
      this.inputFormLote.focus();  
    }, 10);
  }

  cancelarEdicion(){
    if(!this.articulo.lotes[this.loteEditIndex].hash){
      this.articulo.lotes.splice(this.loteEditIndex,1);
    }
    this.loteEditIndex = -1;
    this.formLote.reset();
    this.estatusCaducidad = 1;
    this.etiquetaEstatus = '';
  }

  checarCaducidadFormulario(){
    let fecha = this.formLote.get('fecha_caducidad').value;
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

      loteData.estatus_caducidad = this.estatusCaducidad;
      loteData.icono_estatus = this.listaIconosEstatus[loteData.estatus_caducidad];
      loteData.hash = loteData.lote + loteData.fecha_caducidad + loteData.codigo_barras;
      loteData.precio_unitario = parseFloat(loteData.precio_unitario||0);

      if(+loteData.iva > 0){
        monto_iva = (+loteData.iva * loteData.precio_unitario) / 100;
      }
      loteData.total_monto = +loteData.cantidad * (loteData.precio_unitario + monto_iva);

      let estado_anterior = this.obtenerEstadoActualArticulo();

      if(this.articulo.lotes[this.loteEditIndex].hash){
        this.articulo.total_piezas -= +this.articulo.lotes[this.loteEditIndex].cantidad;
        this.articulo.total_monto -= +this.articulo.lotes[this.loteEditIndex].total_monto;
        this.articulo.lotes[this.loteEditIndex] = loteData;
        this.articulo.total_piezas += +loteData.cantidad;
        this.articulo.total_monto += loteData.total_monto;
      }else{
        let loteIndex = this.articulo.lotes.findIndex(x => x.hash === loteData.hash);
        if(loteIndex >= 0){
          console.log('lote ya capturado');
        }else{
          this.articulo.lotes.push(loteData);
          this.articulo.total_piezas += +loteData.cantidad;
          this.articulo.total_monto += loteData.total_monto;
          this.articulo.no_lotes += 1;
        }
      }

      let estatus_articulo = 1;
      this.articulo.lotes.forEach(loteData => {
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
      if(this.articulo.lotes.length == 1){
        this.cambiosEnLotes.emit({accion:'EliminarArticulo',value:this.articulo.id});
      }else{
        let estado_anterior = this.obtenerEstadoActualArticulo();

        this.articulo.total_piezas -= this.articulo.lotes[index].cantidad;
        this.articulo.total_monto -=  this.articulo.lotes[index].total_monto;
        this.articulo.no_lotes -= 1;
        this.articulo.lotes.splice(index,1);
        this.cambiosEnLotes.emit({accion:'ActualizarCantidades',value:estado_anterior});
      }
    }
  }

  obtenerEstadoActualArticulo(): any{
    let estado = {
      id: this.articulo.id,
      total_piezas: this.articulo.total_piezas, 
      no_lotes: this.articulo.no_lotes, 
      total_monto: this.articulo.total_monto,
    };
    return estado;
  }

  agregarLote(){
    this.articulo.lotes.push({});
    this.loteEditIndex = this.articulo.lotes.length-1;
    setTimeout(() => {
      this.inputFormLote.focus();  
    }, 10);
  }

}
