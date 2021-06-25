import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { ScrollingModule } from '@angular/cdk/scrolling';

import { ElementosPedidosRoutingModule } from './elementos-pedidos-routing.module';
import { ListaComponent } from './lista/lista.component';
import { DialogoFormElementoPedidoComponent } from './dialogo-form-elemento-pedido/dialogo-form-elemento-pedido.component';


@NgModule({
  declarations: [ListaComponent, DialogoFormElementoPedidoComponent],
  imports: [
    CommonModule,
    SharedModule,
    ElementosPedidosRoutingModule,
    ScrollingModule
  ]
})
export class ElementosPedidosModule { }
