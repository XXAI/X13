import { Component, Inject, OnInit, ViewChild, ElementRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';

export interface InsumoData {
  insumoInfo: any;
}

@Component({
  selector: 'app-dialogo-insumo-pedido',
  templateUrl: './dialogo-insumo-pedido.component.html',
  styleUrls: ['./dialogo-insumo-pedido.component.css']
})
export class DialogoInsumoPedidoComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<DialogoInsumoPedidoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: InsumoData,
    private formBuilder: FormBuilder
  ) { }

  insumo:any;
  formInsumo:FormGroup;

  iconoMedicamento:string = 'assets/icons-ui/MED.svg';
  iconoMatCuracion:string = 'assets/icons-ui/MTC.svg';

  ngOnInit() {
    this.insumo = JSON.parse(JSON.stringify(this.data.insumoInfo));

    if(!this.insumo.cantidad){
      this.insumo.cantidad = undefined;
      this.insumo.monto = 0;
    }
  }

  aceptarInsumo(){
    let insumo = this.insumo;
    //insumo.lotes = this.listaLotes;

    this.dialogRef.close(insumo);
  }

  close(): void {
    this.dialogRef.close();
  }
}
