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
    @ViewChild('lote',{static:false}) loteInput: ElementRef;

    constructor(
      public dialogRef: MatDialogRef<InsumoLoteDialogoComponent>,
      @Inject(MAT_DIALOG_DATA) public data: InsumoData,
      private formBuilder: FormBuilder
    ) { }

    insumo:any;
    formLote:FormGroup;

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

      this.formLote = this.formBuilder.group({
        id:[''],
        lote:['',Validators.required],
        fecha_caducidad:['',CustomValidator.isValidDate()],
        codigo_barras:[''],
        cantidad:['',Validators.required]
      });
      this.formLote.reset();
    }

    agregarLote(){
      if(this.formLote.valid){
        let loteData = this.formLote.value;

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
      }else{
        this.formLote.markAllAsTouched();
      }
    }

    editarLote(index:number){
      let loteEditar = this.listaLotes[index];
      this.formLote.patchValue(loteEditar);
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
