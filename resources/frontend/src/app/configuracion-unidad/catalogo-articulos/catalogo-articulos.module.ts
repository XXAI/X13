import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';

import { CatalogoArticulosRoutingModule } from './catalogo-articulos-routing.module';
import { ListaArticulosComponent } from './lista-articulos/lista-articulos.component';


@NgModule({
  declarations: [ListaArticulosComponent],
  imports: [
    CommonModule,
    CatalogoArticulosRoutingModule,
    SharedModule
  ]
})
export class CatalogoArticulosModule { }
