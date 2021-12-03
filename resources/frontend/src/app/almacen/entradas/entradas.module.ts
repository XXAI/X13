import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { EntradasRoutingModule } from './entradas-routing.module';
import { ListaComponent } from './lista/lista.component';
import { EntradaComponent } from './entrada/entrada.component';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { DialogoLotesArticuloComponent } from './dialogo-lotes-articulo/dialogo-lotes-articulo.component';
import { InnerArticuloAdminListaLotesComponent } from './inner-articulo-admin-lista-lotes/inner-articulo-admin-lista-lotes.component';
import { WidgetBuscadorArticulosComponent } from './widget-buscador-articulos/widget-buscador-articulos.component';

@NgModule({
  declarations: [ListaComponent, EntradaComponent, DialogoLotesArticuloComponent, InnerArticuloAdminListaLotesComponent, WidgetBuscadorArticulosComponent],
  imports: [
    CommonModule,
    SharedModule,
    EntradasRoutingModule,
    ScrollingModule
  ]
})
export class EntradasModule { }
