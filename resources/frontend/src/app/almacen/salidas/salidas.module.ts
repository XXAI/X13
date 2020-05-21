import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../../shared/shared.module';
import { SalidasRoutingModule } from './salidas-routing.module';
import { ListaComponent } from './lista/lista.component';
import { SalidaComponent } from './salida/salida.component';

@NgModule({
  declarations: [ListaComponent, SalidaComponent],
  imports: [
    CommonModule,
    SharedModule,
    SalidasRoutingModule
  ]
})
export class SalidasModule { }
