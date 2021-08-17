import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../shared/shared.module';

import { PedidosRoutingModule } from './pedidos-routing.module';
import { PedidosAppsComponent } from './pedidos-apps/pedidos-apps.component';
import { PedidosOrdinariosModule } from './pedidos-ordinarios/pedidos-ordinarios.module';
import { RecepcionPedidosModule } from './recepcion-pedidos/recepcion-pedidos.module';
import { EstatusAvanceRecepcionModule } from './estatus-avance-recepcion/estatus-avance-recepcion.module';


@NgModule({
  declarations: [PedidosAppsComponent],
  imports: [
    CommonModule,
    SharedModule,
    PedidosOrdinariosModule,
    RecepcionPedidosModule,
    PedidosRoutingModule,
    EstatusAvanceRecepcionModule,
  ]
})
export class PedidosModule { }
