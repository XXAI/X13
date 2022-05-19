import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';

import { AjustesRoutingModule } from './ajustes-routing.module';
import { ListaComponent } from './lista/lista.component';
import { DialogoDetallesArticuloComponent } from './dialogo-detalles-articulo/dialogo-detalles-articulo.component';
import { DialogoResguardoLoteComponent } from './dialogo-resguardo-lote/dialogo-resguardo-lote.component';


@NgModule({
  declarations: [ListaComponent, DialogoDetallesArticuloComponent, DialogoResguardoLoteComponent],
  imports: [
    CommonModule,
    SharedModule,
    AjustesRoutingModule
  ]
})
export class AjustesModule { }
