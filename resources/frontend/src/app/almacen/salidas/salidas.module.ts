import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../../shared/shared.module';
import { OverlayModule } from '@angular/cdk/overlay';
import { SalidasRoutingModule } from './salidas-routing.module';
import { ListaComponent } from './lista/lista.component';
import { SalidaComponent } from './salida/salida.component';
import { WidgetBuscadorStockComponent } from './widget-buscador-stock/widget-buscador-stock.component';
import { InnerArticuloListaLotesComponent } from './inner-articulo-lista-lotes/inner-articulo-lista-lotes.component';
import { DialogoSolicitudRepetidaComponent } from './dialogo-solicitud-repetida/dialogo-solicitud-repetida.component';

@NgModule({
  declarations: [ListaComponent, SalidaComponent, WidgetBuscadorStockComponent, InnerArticuloListaLotesComponent, DialogoSolicitudRepetidaComponent],
  imports: [
    CommonModule,
    SharedModule,
    SalidasRoutingModule,
    OverlayModule
  ]
})
export class SalidasModule { }
