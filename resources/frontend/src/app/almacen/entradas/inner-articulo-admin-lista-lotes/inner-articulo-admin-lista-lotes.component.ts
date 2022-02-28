import { DatePipe } from '@angular/common';
import { Component, OnInit, Input, SimpleChange, Output, EventEmitter, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatInput } from '@angular/material/input';
import { Observable } from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import { CustomValidator } from 'src/app/utils/classes/custom-validator';

@Component({
  selector: 'inner-articulo-admin-lista-lotes',
  templateUrl: './inner-articulo-admin-lista-lotes.component.html',
  styleUrls: ['./inner-articulo-admin-lista-lotes.component.css']
})

export class InnerArticuloAdminListaLotesComponent implements OnInit {
  @ViewChild(MatInput) inputFormField: MatInput;

  @Input() articulo: any;
  @Input() edicionActiva: boolean;
  @Input() fechaMovimiento: Date;
  @Input() catalogoMarcas: any[];
  @Input() modoRecepcion: boolean;

  @Output() cambiosEnLotes = new EventEmitter<any>();

  constructor(
    private formBuilder: FormBuilder,
    private datePipe: DatePipe
  ) { }

  filteredMarcas: Observable<string[]>;

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
    let formConfig:any;

    if(this.articulo.tipo_formulario == 'MEDS'){
      formConfig = {
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
    }else if(this.articulo.tipo_formulario == 'ACTVO'){
      formConfig = {
        id:[''],
        marca:[''],
        marca_id:[''],
        modelo:['',],
        no_serie:['',Validators.required],
        cantidad:['',Validators.required],
        precio_unitario:[''],
        iva:[''],
      };
    }
    
    this.formLote = this.formBuilder.group(formConfig);
    this.formLote.reset();

    if(this.formLote.get('marca_id')){
      this.filteredMarcas = this.formLote.get('marca').valueChanges.pipe(
        startWith(''),
        map(marca => typeof marca === 'string' ? marca : (marca)?marca.nombre : ''),
        map(nombre => nombre ? this._filter(nombre) : this.catalogoMarcas.slice())
        //startWith(''),
        //map(value => this._filter(value))
      );
    }

    let estatus_articulo = 1;
    this.articulo.lotes.forEach(loteData => {
      loteData.hash = this.generarHashLote(loteData);
      
      let result = this.verificarFechaCaducidad(loteData.fecha_caducidad);
      loteData.estatus_caducidad = result.estatus;
      loteData.icono_estatus = this.listaIconosEstatus[loteData.estatus_caducidad];

      if(estatus_articulo < loteData.estatus_caducidad){
        estatus_articulo = loteData.estatus_caducidad;
      }
    });
    this.articulo.estatus = estatus_articulo;

    if(this.articulo.lotes.length == 0 && !this.modoRecepcion){
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

  aplicarCantidad(lote){
    console.log(lote);
    if(this.edicionActiva){
      if(lote.cantidad < 0){
        lote.cantidad = 0;
      }else if(lote.cantidad > lote.cantidad_enviada){
        lote.cantidad = lote.cantidad_enviada;
      }
  
      let estado_anterior = this.obtenerEstadoActualArticulo();
      
      if(lote.cantidad_recibida_anterior){
        this.articulo.total_recibido += lote.cantidad_recibida_anterior;
      }
  
      this.articulo.total_recibido -= (lote.cantidad_enviada - lote.cantidad);
      lote.cantidad_recibida_anterior = (lote.cantidad_enviada - lote.cantidad);
  
      this.cambiosEnLotes.emit({accion:'ActualizarCantidades',value:estado_anterior});
    }
  }

  editarLote(index:number){
    if(this.loteEditIndex >= 0){
      this.cancelarEdicion();
    }

    this.loteEditIndex = index;

    let result = this.verificarFechaCaducidad(this.articulo.lotes[index].fecha_caducidad);
    this.estatusCaducidad = result.estatus; //Caducado
    this.etiquetaEstatus = result.label;

    let item = JSON.parse(JSON.stringify(this.articulo.lotes[index]));
    item.memo_fecha = new Date(item.memo_fecha + 'T00:00:00');
    item.fecha_caducidad = new Date(item.fecha_caducidad + 'T00:00:00');

    if(item.memo_folio){
      this.toggleCartaCanje(true);
    }else{
      this.toggleCartaCanje(false);
    }

    this.formLote.patchValue(item);
    this.formLote.markAllAsTouched();
    setTimeout(() => {
      this.inputFormField.focus();  
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
    this.mostrarCartaCanje = false;
  }

  checarCaducidadFormulario(){
    if(this.formLote.get('fecha_caducidad')){
      let fecha = this.formLote.get('fecha_caducidad').value;
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

  toggleCartaCanje(mostrar:boolean){
    this.mostrarCartaCanje = mostrar;

    if(this.mostrarCartaCanje){
      if(!this.formLote.get('memo_folio')){
        this.formLote.addControl('memo_folio',new FormControl('',Validators.required));
        this.formLote.addControl('memo_fecha',new FormControl('',Validators.required));
        this.formLote.addControl('vigencia_meses',new FormControl('',Validators.required));
      }
    }else{
      if(this.formLote.get('memo_folio')){
        this.formLote.removeControl('memo_folio');
        this.formLote.removeControl('memo_fecha');
        this.formLote.removeControl('vigencia_meses');
      }
    }
  }

  guardarCambiosLote(addNew:boolean = false){
    if(this.formLote.valid){
      this.checarCaducidadFormulario();
      
      let monto_iva = 0;
      let loteData = this.formLote.value;

      if(loteData.marca){
        loteData.marca_id = loteData.marca.id;
      }

      if(loteData.fecha_caducidad){
        loteData.fecha_caducidad = this.datePipe.transform(loteData.fecha_caducidad, 'yyyy-MM-dd');
        if(loteData.memo_fecha){
          loteData.memo_fecha = this.datePipe.transform(loteData.memo_fecha, 'yyyy-MM-dd');
        }

        loteData.estatus_caducidad = this.estatusCaducidad;
        loteData.icono_estatus = this.listaIconosEstatus[loteData.estatus_caducidad];
      }
      
      loteData.hash = this.generarHashLote(loteData);
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

      if(loteData.fecha_caducidad){
        let estatus_articulo = 1;
        this.articulo.lotes.forEach(loteData => {
          if(estatus_articulo < loteData.estatus_caducidad){
            estatus_articulo = loteData.estatus_caducidad;
          }
        });
        this.articulo.estatus = estatus_articulo;
      }
      this.cambiosEnLotes.emit({accion:'ActualizarCantidades',value:estado_anterior});

      this.cancelarEdicion();
      if(addNew){
        this.agregarLote();
      }
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
      total_recibido: this.articulo.total_recibido,
      no_lotes: this.articulo.no_lotes, 
      total_monto: this.articulo.total_monto,
    };
    return estado;
  }

  generarHashLote(loteData){
    let hash: string;

    if(this.articulo.tipo_formulario == 'MEDS'){
      hash = loteData.lote + loteData.fecha_caducidad + loteData.codigo_barras;
    }else if(this.articulo.tipo_formulario == 'ACTVO'){
      hash = loteData.no_serie + loteData.modelo + loteData.marca;
    }

    return hash;
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

  agregarLote(){
    this.articulo.lotes.push({});
    this.loteEditIndex = this.articulo.lotes.length-1;
    setTimeout(() => {
      this.inputFormField.focus();  
    }, 10);
  }

}
