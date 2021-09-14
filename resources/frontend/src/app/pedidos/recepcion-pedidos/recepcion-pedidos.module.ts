import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import {SharedModule } from '../../shared/shared.module';
import { ScrollingModule } from '@angular/cdk/scrolling';

import { RecepcionPedidosRoutingModule } from './recepcion-pedidos-routing.module';
import { ListaComponent } from './lista/lista.component';
import { DetallesRecepcionPedidoComponent } from './detalles-recepcion-pedido/detalles-recepcion-pedido.component';
import { DialogoSubirArchivoComponent } from './dialogo-subir-archivo/dialogo-subir-archivo.component';
import { DialogoLotesArticulosComponent } from './dialogo-lotes-articulos/dialogo-lotes-articulos.component';


@NgModule({
  declarations: [ListaComponent, DetallesRecepcionPedidoComponent, DialogoSubirArchivoComponent, DialogoLotesArticulosComponent],
  imports: [
    CommonModule,
    SharedModule,
    RecepcionPedidosRoutingModule,
    ScrollingModule
  ],
  entryComponents: [
    DialogoSubirArchivoComponent,
  ]
})
export class RecepcionPedidosModule { }
