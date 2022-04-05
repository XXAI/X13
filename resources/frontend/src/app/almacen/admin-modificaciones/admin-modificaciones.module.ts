import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminModificacionesRoutingModule } from './admin-modificaciones-routing.module';
import { ListaPeticionesComponent } from './lista-peticiones/lista-peticiones.component';
import { SharedModule } from 'src/app/shared/shared.module';


@NgModule({
  declarations: [ListaPeticionesComponent],
  imports: [
    CommonModule,
    SharedModule,
    AdminModificacionesRoutingModule
  ]
})
export class AdminModificacionesModule { }
