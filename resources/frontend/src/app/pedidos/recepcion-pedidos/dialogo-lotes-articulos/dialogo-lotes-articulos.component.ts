import { Component, Inject, OnInit, ViewChild, ElementRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { CustomValidator } from '../../../utils/classes/custom-validator';

export interface ArticuloData {
  articulo: any;
  editar: boolean;
  fecha_movimiento?: any;
}

@Component({
  selector: 'app-dialogo-lotes-articulos',
  templateUrl: './dialogo-lotes-articulos.component.html',
  styleUrls: ['./dialogo-lotes-articulos.component.css']
})
export class DialogoLotesArticulosComponent implements OnInit {
    @ViewChild('lote') loteInput: ElementRef;

    constructor(
      public dialogRef: MatDialogRef<DialogoLotesArticulosComponent>,
      @Inject(MAT_DIALOG_DATA) public data: ArticuloData,
      private formBuilder: FormBuilder
    ) { }

    fechaMovimiento:any;
    fechaActual:any;

    estatusCaducidad:number; // 0 = Sin Caducidad, 1 = Normal, 2 = Por Caducar, 3 = Caducado

    articulo:any;
    formLote:FormGroup;

    loteEditIndex:number;
    loteRecienteHash:string;

    listaLotes:any[];

    modoEdicion:boolean;

    ngOnInit() {      
      this.articulo = JSON.parse(JSON.stringify(this.data.articulo));
      //this.articulo = this.data.insumoLotes;
      this.listaLotes = [];
      this.loteEditIndex = -1;
      this.modoEdicion = this.data.editar;

      if(!this.articulo.total_piezas){
        this.articulo.total_piezas = 0;
      }

      if(this.articulo.lotes){
        this.listaLotes = this.articulo.lotes;
      }

      let formConfig:any = {
        id:[''],
        lote:['',Validators.required],
        //fecha_caducidad:['',CustomValidator.isValidDate()],
        codigo_barras:[''],
        cantidad:['',Validators.required]
      };

      if(this.articulo.tiene_fecha_caducidad){
        this.estatusCaducidad = 1;
        formConfig.fecha_caducidad = ['',[Validators.required,CustomValidator.isValidDate()]];
      }else{
        this.estatusCaducidad = 0;
        formConfig.fecha_caducidad = ['',CustomValidator.isValidDate()];
      }
      
      this.formLote = this.formBuilder.group(formConfig);
      this.formLote.reset();

      if(this.data.fecha_movimiento){
        this.fechaMovimiento = this.data.fecha_movimiento;
      }

      this.fechaActual = new Date();
    }

    verificarFechaCaducidad(){
      this.estatusCaducidad = 1;

      if(this.articulo.tiene_fecha_caducidad){
        let value = this.formLote.get('fecha_caducidad').value + 'T00:00:00';
        let fecha_caducidad = new Date(value);
        
        let fecha_comparacion = this.fechaActual;
        if(this.fechaMovimiento){
          fecha_comparacion = this.fechaMovimiento;
        }

        let diferencia_fechas = new Date(fecha_caducidad.getTime() - fecha_comparacion.getTime());
        let diferencia_dias = Math.floor(diferencia_fechas.getTime() / (1000*60*60*24));

        console.log(diferencia_dias);

        if (diferencia_dias < 0){
          this.estatusCaducidad = 3; //Caducado
        }else if (diferencia_dias >= 60){
          this.estatusCaducidad = 1; //Normal
        }else{
          this.estatusCaducidad = 2; //Por caducar
        }
      }
    }

    agregarLote(){
      if(this.formLote.valid){
        this.verificarFechaCaducidad();

        let loteData = this.formLote.value;
        loteData.estatusCaducidad = this.estatusCaducidad;
        loteData.hash = loteData.lote + loteData.fecha_caducidad + loteData.codigo_barras;

        if(this.loteEditIndex >= 0){
          this.articulo.total_piezas -= this.listaLotes[this.loteEditIndex].cantidad;
          this.listaLotes[this.loteEditIndex] = loteData;
          this.articulo.total_piezas += +loteData.cantidad;
          this.loteEditIndex = -1;
        }else{
          let loteIndex = this.listaLotes.findIndex(x => x.hash === loteData.hash);

          if(loteIndex >= 0){
            let lote = this.listaLotes[loteIndex];
            lote.cantidad += loteData.cantidad;
          }else{
            this.listaLotes.push(loteData);
          }
          this.articulo.total_piezas += +loteData.cantidad;
        }

        this.loteRecienteHash = loteData.hash;
        this.loteInput.nativeElement.focus();
        this.formLote.reset();
        this.estatusCaducidad = 1;
      }else{
        this.formLote.markAllAsTouched();
      }
    }

    editarLote(index:number){
      let loteEditar = this.listaLotes[index];
      this.formLote.patchValue(loteEditar);
      this.estatusCaducidad = loteEditar.estatusCaducidad;
      this.loteEditIndex = index;
    }

    eliminarLote(index:number){
      if(this.loteEditIndex < 0){
        this.articulo.total_piezas -= this.listaLotes[index].cantidad;
        this.listaLotes.splice(index,1);
      }
    }

    cancelarLote(){
      this.formLote.reset();
      this.loteEditIndex = -1;
      this.loteInput.nativeElement.focus();
      this.estatusCaducidad = 1;
    }

    aceptarLotes(){
      if((this.articulo.cantidad_restante - this.articulo.total_piezas) >= 0){
        this.articulo.agregado = Math.floor(((this.articulo.recibido+this.articulo.total_piezas)/this.articulo.cantidad)*100);
        let articulo = this.articulo;
        articulo.lotes = this.listaLotes;

        this.dialogRef.close(articulo);
      }
    }

    close(): void {
      this.dialogRef.close();
    }
}
