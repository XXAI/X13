import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import {SharedModule } from '../../shared/shared.module';
import { ScrollingModule } from '@angular/cdk/scrolling';

import { PedidosOrdinariosRoutingModule } from './pedidos-ordinarios-routing.module';
import { ListaComponent } from './lista/lista.component';
import { PedidoComponent } from './pedido/pedido.component';
import { DialogoInsumoPedidoComponent } from './dialogo-insumo-pedido/dialogo-insumo-pedido.component';


@NgModule({
  declarations: [ListaComponent, PedidoComponent, DialogoInsumoPedidoComponent],
  imports: [
    CommonModule,
    SharedModule,
    PedidosOrdinariosRoutingModule,
    ScrollingModule,
  ],
  entryComponents: [
    DialogoInsumoPedidoComponent
  ]
})
export class PedidosOrdinariosModule { }
