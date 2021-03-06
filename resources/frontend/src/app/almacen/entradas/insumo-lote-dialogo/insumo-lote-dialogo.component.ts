import { Component, Inject, OnInit, ViewChild, ElementRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { CustomValidator } from '../../../utils/classes/custom-validator';

export interface InsumoData {
  insumoLotes: any;
}

@Component({
  selector: 'app-insumo-lote-dialogo',
  templateUrl: './insumo-lote-dialogo.component.html',
  styleUrls: ['./insumo-lote-dialogo.component.css']
})
export class InsumoLoteDialogoComponent implements OnInit {
    @ViewChild('lote') loteInput: ElementRef;

    constructor(
      public dialogRef: MatDialogRef<InsumoLoteDialogoComponent>,
      @Inject(MAT_DIALOG_DATA) public data: InsumoData,
      private formBuilder: FormBuilder
    ) { }

    fechaMovimiento:any;
    fechaActual:any;

    estatusCaducidad:number; // 0 = Sin Caducidad, 1 = Normal, 2 = Por Caducar, 3 = Caducado

    insumo:any;
    formLote:FormGroup;

    iconoMedicamento:string = 'assets/icons-ui/MED.svg';
    iconoMatCuracion:string = 'assets/icons-ui/MTC.svg';

    loteEditIndex:number;

    listaLotes:any[];

    ngOnInit() {      
      this.insumo = JSON.parse(JSON.stringify(this.data.insumoLotes));
      //this.insumo = this.data.insumoLotes;
      this.listaLotes = [];
      this.loteEditIndex = -1;

      if(!this.insumo.total_piezas){
        this.insumo.total_piezas = 0;
      }

      if(this.insumo.lotes){
        this.listaLotes = this.insumo.lotes;
      }

      let formConfig:any = {
        id:[''],
        lote:['',Validators.required],
        //fecha_caducidad:['',CustomValidator.isValidDate()],
        codigo_barras:[''],
        cantidad:['',Validators.required]
      };

      if(this.insumo.tiene_fecha_caducidad){
        this.estatusCaducidad = 1;
        formConfig.fecha_caducidad = ['',[Validators.required,CustomValidator.isValidDate()]];
      }else{
        this.estatusCaducidad = 0;
        formConfig.fecha_caducidad = ['',CustomValidator.isValidDate()];
      }
      
      this.formLote = this.formBuilder.group(formConfig);
      this.formLote.reset();

      this.fechaActual = new Date();
    }

    verificarFechaCaducidad(){
      this.estatusCaducidad = 1;

      if(this.insumo.tiene_fecha_caducidad){
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

        if(this.loteEditIndex >= 0){
          this.insumo.total_piezas -= this.listaLotes[this.loteEditIndex].cantidad;
          this.listaLotes[this.loteEditIndex] = loteData;
          this.insumo.total_piezas += +loteData.cantidad;
          this.loteEditIndex = -1;
        }else{
          this.listaLotes.push(loteData);
          this.insumo.total_piezas += +loteData.cantidad;
        }
        
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
        this.insumo.total_piezas -= this.listaLotes[index].cantidad;
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
      let insumo = this.insumo;
      insumo.lotes = this.listaLotes;

      this.dialogRef.close(insumo);
    }

    close(): void {
      this.dialogRef.close();
    }
}
