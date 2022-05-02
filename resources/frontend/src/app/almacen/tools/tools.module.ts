import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DialogoCancelarMovimientoComponent } from './dialogo-cancelar-movimiento/dialogo-cancelar-movimiento.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { DialogoModificarMovimientoComponent } from './dialogo-modificar-movimiento/dialogo-modificar-movimiento.component';
import { WidgetBuscadorArticulosComponent } from './widget-buscador-articulos/widget-buscador-articulos.component';


@NgModule({
  declarations: [DialogoCancelarMovimientoComponent, DialogoModificarMovimientoComponent, WidgetBuscadorArticulosComponent],
  imports: [
    CommonModule,
    SharedModule
  ],
  exports: [
    DialogoCancelarMovimientoComponent,
    WidgetBuscadorArticulosComponent
  ]
})
export class ToolsModule { }
