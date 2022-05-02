import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { EntradasRoutingModule } from './entradas-routing.module';
import { ListaComponent } from './lista/lista.component';
import { EntradaComponent } from './entrada/entrada.component';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { OverlayModule } from '@angular/cdk/overlay';
import { InnerArticuloAdminListaLotesComponent } from './inner-articulo-admin-lista-lotes/inner-articulo-admin-lista-lotes.component';
import { DialogoCancelarResultadoComponent } from './dialogo-cancelar-resultado/dialogo-cancelar-resultado.component';
import { DialogoSubirArchivoComponent } from './dialogo-subir-archivo/dialogo-subir-archivo.component';
import { ToolsModule } from '../tools/tools.module';

@NgModule({
  declarations: [ListaComponent, EntradaComponent, InnerArticuloAdminListaLotesComponent, DialogoCancelarResultadoComponent, DialogoSubirArchivoComponent],
  imports: [
    CommonModule,
    SharedModule,
    EntradasRoutingModule,
    ScrollingModule,
    ToolsModule,
    OverlayModule
  ]
})
export class EntradasModule { }
