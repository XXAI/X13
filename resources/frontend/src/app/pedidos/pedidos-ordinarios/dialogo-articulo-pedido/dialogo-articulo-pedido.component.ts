import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface ArticuloData {
  articuloInfo: any;
  listaUnidades: any[];
  unidadEntrega: any;
}

@Component({
  selector: 'app-dialogo-articulo-pedido',
  templateUrl: './dialogo-articulo-pedido.component.html',
  styleUrls: ['./dialogo-articulo-pedido.component.css']
})
export class DialogoArticuloPedidoComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<DialogoArticuloPedidoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ArticuloData,
  ) { }

  articulo:any;
  
  listaUnidades:any[];
  unidadEntrega:any;

  ngOnInit() {
    this.articulo = JSON.parse(JSON.stringify(this.data.articuloInfo));
    this.listaUnidades = JSON.parse(JSON.stringify(this.data.listaUnidades));
    this.unidadEntrega = JSON.parse(JSON.stringify(this.data.unidadEntrega));
    
    if(!this.articulo.cantidad){
      this.articulo.cantidad = undefined;
      this.articulo.monto = 0;
    }

    if(this.articulo.cuadro_distribucion && this.articulo.cuadro_distribucion.length > 0){
      for(let i in this.articulo.cuadro_distribucion){
        let unidad = this.articulo.cuadro_distribucion[i];
        let index = this.listaUnidades.findIndex(x => x.id === unidad.id);
        if(index >= 0){
          this.listaUnidades[index].cantidad = unidad.cantidad;
        }
      }
    }
  }

  aceptarInsumo(){
    let articulo = this.articulo;
    //insumo.lotes = this.listaLotes;
    if(articulo.cantidad > 0){
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
        this.articulo.cuadro_distribucion = distribucion_unidades;
      }
      //console.log(this.insumo);
      this.dialogRef.close(articulo);
    }
  }

  sumarCantidades(){
    this.articulo.cantidad = 0;
    for(let i in this.listaUnidades){
      if(this.listaUnidades[i].cantidad){
        this.articulo.cantidad += this.listaUnidades[i].cantidad;
      }
    }
  }

  close(): void {
    this.dialogRef.close();
  }

}
