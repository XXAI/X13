import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';

import { AjustesRoutingModule } from './ajustes-routing.module';
import { ListaComponent } from './lista/lista.component';
import { DialogoDetallesArticuloComponent } from './dialogo-detalles-articulo/dialogo-detalles-articulo.component';


@NgModule({
  declarations: [ListaComponent, DialogoDetallesArticuloComponent],
  imports: [
    CommonModule,
    SharedModule,
    AjustesRoutingModule
  ]
})
export class AjustesModule { }
