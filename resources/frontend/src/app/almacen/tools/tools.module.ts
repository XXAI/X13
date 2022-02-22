import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DialogoCancelarMovimientoComponent } from './dialogo-cancelar-movimiento/dialogo-cancelar-movimiento.component';
import { SharedModule } from 'src/app/shared/shared.module';


@NgModule({
  declarations: [DialogoCancelarMovimientoComponent],
  imports: [
    CommonModule,
    SharedModule
  ],
  exports: [
    DialogoCancelarMovimientoComponent
  ]
})
export class ToolsModule { }
