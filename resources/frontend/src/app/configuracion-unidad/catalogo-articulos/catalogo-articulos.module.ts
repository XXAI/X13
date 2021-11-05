import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';

import { CatalogoArticulosRoutingModule } from './catalogo-articulos-routing.module';
import { ListaArticulosComponent } from './lista-articulos/lista-articulos.component';
import { DialogoArticuloComponent } from './dialogo-articulo/dialogo-articulo.component';


@NgModule({
  declarations: [ListaArticulosComponent, DialogoArticuloComponent],
  imports: [
    CommonModule,
    CatalogoArticulosRoutingModule,
    SharedModule
  ]
})
export class CatalogoArticulosModule { }
