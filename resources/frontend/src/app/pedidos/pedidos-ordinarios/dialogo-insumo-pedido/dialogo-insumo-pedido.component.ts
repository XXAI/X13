import { Component, Inject, OnInit, ViewChild, ElementRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';

export interface InsumoData {
  insumoInfo: any;
  listaUnidades: any[];
  unidadEntrega: any;
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

  listaUnidades:any[];
  unidadEntrega:any;

  iconoMedicamento:string = 'assets/icons-ui/MED.svg';
  iconoMatCuracion:string = 'assets/icons-ui/MTC.svg';

  ngOnInit() {
    this.insumo = JSON.parse(JSON.stringify(this.data.insumoInfo));
    this.listaUnidades = JSON.parse(JSON.stringify(this.data.listaUnidades));
    this.unidadEntrega = JSON.parse(JSON.stringify(this.data.unidadEntrega));
    
    if(!this.insumo.cantidad){
      this.insumo.cantidad = undefined;
      this.insumo.monto = 0;
    }

    if(this.insumo.cuadro_distribucion && this.insumo.cuadro_distribucion.length > 0){
      for(let i in this.insumo.cuadro_distribucion){
        let unidad = this.insumo.cuadro_distribucion[i];
        let index = this.listaUnidades.findIndex(x => x.id === unidad.id);
        if(index >= 0){
          this.listaUnidades[index].cantidad = unidad.cantidad;
        }
      }
    }
  }

  aceptarInsumo(){
    let insumo = this.insumo;
    //insumo.lotes = this.listaLotes;
    if(this.listaUnidades.length > 0){
      let distribucion_unidades = [];
      for(let i in this.listaUnidades){
        if(this.listaUnidades[i].cantidad){
          distribucion_unidades.push({
            id: this.listaUnidades[i].id,
            clues: this.listaUnidades[i].clues,
            cantidad: this.listaUnidades[i].cantidad
          });
        }
      }
      this.insumo.cuadro_distribucion = distribucion_unidades;
    }
    //console.log(this.insumo);
    this.dialogRef.close(insumo);
  }

  sumarCantidades(){
    this.insumo.cantidad = 0;
    for(let i in this.listaUnidades){
      if(this.listaUnidades[i].cantidad){
        this.insumo.cantidad += this.listaUnidades[i].cantidad;
      }
    }
  }

  close(): void {
    this.dialogRef.close();
  }
}
