import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

export interface InsumoData {
  insumoLotes: any;
}

@Component({
  selector: 'app-insumo-lote-dialogo',
  templateUrl: './insumo-lote-dialogo.component.html',
  styleUrls: ['./insumo-lote-dialogo.component.css']
})
export class InsumoLoteDialogoComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<InsumoLoteDialogoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: InsumoData,
    private formBuilder: FormBuilder
  ) { }

  insumo:any;
  formLote:FormGroup;

  listaLotes:any[];

  ngOnInit() {
    this.insumo = this.data.insumoLotes;
    this.listaLotes = [];

    this.formLote = this.formBuilder.group({
      id:[''],
      lote:['',Validators.required],
      fecha_caducidad:[''],
      codigo_barras:[''],
      cantidad:['',Validators.required]
    });
  }

  agregarLote(){
    let loteData = this.formLote.value;

    this.formLote.reset();
    this.listaLotes.push(loteData);
  }

  cancelarLote(){
    this.formLote.reset();
  }

  close(): void {
    this.dialogRef.close();
  }

}
