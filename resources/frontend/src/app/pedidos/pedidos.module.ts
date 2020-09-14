import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../shared/shared.module';

import { PedidosOrdinariosModule } from './pedidos-ordinarios/pedidos-ordinarios.module';
import { PedidosRoutingModule } from './pedidos-routing.module';
import { PedidosAppsComponent } from './pedidos-apps/pedidos-apps.component';


@NgModule({
  declarations: [PedidosAppsComponent],
  imports: [
    CommonModule,
    SharedModule,
    PedidosOrdinariosModule,
    PedidosRoutingModule,
  ]
})
export class PedidosModule { }
