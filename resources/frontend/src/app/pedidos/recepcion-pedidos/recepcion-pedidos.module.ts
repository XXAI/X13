import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import {SharedModule } from '../../shared/shared.module';
import { ScrollingModule } from '@angular/cdk/scrolling';

import { RecepcionPedidosRoutingModule } from './recepcion-pedidos-routing.module';
import { ListaComponent } from './lista/lista.component';
import { PedidoComponent } from './pedido/pedido.component';
import { DialogoLotesInsumoComponent } from './dialogo-lotes-insumo/dialogo-lotes-insumo.component';


@NgModule({
  declarations: [ListaComponent, PedidoComponent, DialogoLotesInsumoComponent],
  imports: [
    CommonModule,
    SharedModule,
    RecepcionPedidosRoutingModule,
    ScrollingModule
  ],
  entryComponents: [
    DialogoLotesInsumoComponent,
  ]
})
export class RecepcionPedidosModule { }
