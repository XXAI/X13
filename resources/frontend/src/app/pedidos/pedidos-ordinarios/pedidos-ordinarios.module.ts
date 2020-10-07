import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import {SharedModule } from '../../shared/shared.module';
import { ScrollingModule } from '@angular/cdk/scrolling';

import { PedidosOrdinariosRoutingModule } from './pedidos-ordinarios-routing.module';
import { ListaComponent } from './lista/lista.component';
import { PedidoComponent } from './pedido/pedido.component';
import { DialogoInsumoPedidoComponent } from './dialogo-insumo-pedido/dialogo-insumo-pedido.component';
import { DialogoSeleccionarUnidadesMedicasComponent } from './dialogo-seleccionar-unidades-medicas/dialogo-seleccionar-unidades-medicas.component';
import { DialogoSelecAccionInsumosUnidadesComponent } from './dialogo-selec-accion-insumos-unidades/dialogo-selec-accion-insumos-unidades.component';


@NgModule({
  declarations: [ListaComponent, PedidoComponent, DialogoInsumoPedidoComponent, DialogoSeleccionarUnidadesMedicasComponent, DialogoSelecAccionInsumosUnidadesComponent],
  imports: [
    CommonModule,
    SharedModule,
    PedidosOrdinariosRoutingModule,
    ScrollingModule,
  ],
  entryComponents: [
    DialogoInsumoPedidoComponent,
    DialogoSeleccionarUnidadesMedicasComponent,
    DialogoSelecAccionInsumosUnidadesComponent
  ]
})
export class PedidosOrdinariosModule { }
