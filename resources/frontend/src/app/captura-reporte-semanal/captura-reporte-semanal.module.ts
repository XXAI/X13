import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import {SharedModule } from '../shared/shared.module';

import { CapturaReporteSemanalRoutingModule } from './captura-reporte-semanal-routing.module';
import { ListaComponent } from './lista/lista.component';
import { DialogoRegistroComponent } from './dialogo-registro/dialogo-registro.component';


@NgModule({
  declarations: [ListaComponent, DialogoRegistroComponent],
  imports: [
    CommonModule,
    SharedModule,
    CapturaReporteSemanalRoutingModule
  ]
})
export class CapturaReporteSemanalModule { }
