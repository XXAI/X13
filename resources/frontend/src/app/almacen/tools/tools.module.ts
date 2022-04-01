import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DialogoCancelarMovimientoComponent } from './dialogo-cancelar-movimiento/dialogo-cancelar-movimiento.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { DialogoModificarMovimientoComponent } from './dialogo-modificar-movimiento/dialogo-modificar-movimiento.component';


@NgModule({
  declarations: [DialogoCancelarMovimientoComponent, DialogoModificarMovimientoComponent],
  imports: [
    CommonModule,
    SharedModule
  ],
  exports: [
    DialogoCancelarMovimientoComponent
  ]
})
export class ToolsModule { }
