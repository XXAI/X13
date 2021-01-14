import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import {SharedModule } from '../../shared/shared.module';

import { RecepcionPedidosRoutingModule } from './recepcion-pedidos-routing.module';
import { ListaComponent } from './lista/lista.component';


@NgModule({
  declarations: [ListaComponent],
  imports: [
    CommonModule,
    SharedModule,
    RecepcionPedidosRoutingModule
  ]
})
export class RecepcionPedidosModule { }
