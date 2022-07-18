import { NgModule } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { OverlayModule } from '@angular/cdk/overlay';
import { DialogoCancelarMovimientoComponent } from './dialogo-cancelar-movimiento/dialogo-cancelar-movimiento.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { DialogoModificarMovimientoComponent } from './dialogo-modificar-movimiento/dialogo-modificar-movimiento.component';
import { WidgetBuscadorArticulosComponent } from './widget-buscador-articulos/widget-buscador-articulos.component';
import { DialogoPreviewMovimientoComponent } from './dialogo-preview-movimiento/dialogo-preview-movimiento.component';
import { DialogoHistorialModificacionesComponent } from './dialogo-historial-modificaciones/dialogo-historial-modificaciones.component';


@NgModule({
  declarations: [DialogoCancelarMovimientoComponent, DialogoModificarMovimientoComponent, WidgetBuscadorArticulosComponent, DialogoPreviewMovimientoComponent, DialogoHistorialModificacionesComponent],
  imports: [
    CommonModule,
    SharedModule,
    OverlayModule
  ],
  exports: [
    DialogoCancelarMovimientoComponent,
    WidgetBuscadorArticulosComponent,
  ],
  providers:[
    DecimalPipe
  ]
})
export class ToolsModule { }
