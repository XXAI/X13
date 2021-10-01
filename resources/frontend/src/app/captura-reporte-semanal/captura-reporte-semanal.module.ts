import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

import {SharedModule } from '../shared/shared.module';

import { CapturaReporteSemanalRoutingModule } from './captura-reporte-semanal-routing.module';
import { ListaComponent } from './lista/lista.component';
import { DialogoRegistroComponent } from './dialogo-registro/dialogo-registro.component';
import { AdminListaComponent } from './admin-lista/admin-lista.component';
import { DialogoDetallesRegistroComponent } from './dialogo-detalles-registro/dialogo-detalles-registro.component';


@NgModule({
  declarations: [ListaComponent, DialogoRegistroComponent, AdminListaComponent, DialogoDetallesRegistroComponent],
  imports: [
    CommonModule,
    SharedModule,
    CapturaReporteSemanalRoutingModule
  ],
  providers:[
    DatePipe
  ]
})
export class CapturaReporteSemanalModule { }
