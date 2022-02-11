import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';

import { CatalogoArticulosRoutingModule } from './catalogo-articulos-routing.module';
import { ListaCatalogosComponent } from './lista-catalogos/lista-catalogos.component';
import { WidgetBuscadorArticulosComponent } from './widget-buscador-articulos/widget-buscador-articulos.component';


@NgModule({
  declarations: [ListaCatalogosComponent, WidgetBuscadorArticulosComponent],
  imports: [
    CommonModule,
    CatalogoArticulosRoutingModule,
    SharedModule
  ]
})
export class CatalogoArticulosModule { }
