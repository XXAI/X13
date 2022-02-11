import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

import { SharedModule } from '../shared/shared.module';

import { CapturaReporteSemanalRoutingModule } from './captura-reporte-semanal-routing.module';
import { ListaComponent } from './lista/lista.component';
import { DialogoRegistroComponent } from './dialogo-registro/dialogo-registro.component';
import { AdminListaComponent } from './admin-lista/admin-lista.component';
import { DialogoDetallesRegistroComponent } from './dialogo-detalles-registro/dialogo-detalles-registro.component';
import { DialogoConfigCapturaComponent } from './dialogo-config-captura/dialogo-config-captura.component';
import { DialogoSubirArchivoComponent } from './dialogo-subir-archivo/dialogo-subir-archivo.component';
import { DialogoAdminCapturaCatalogosComponent } from './dialogo-admin-captura-catalogos/dialogo-admin-captura-catalogos.component';


@NgModule({
  declarations: [ListaComponent, DialogoRegistroComponent, AdminListaComponent, DialogoDetallesRegistroComponent, DialogoConfigCapturaComponent, DialogoSubirArchivoComponent, DialogoAdminCapturaCatalogosComponent],
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
