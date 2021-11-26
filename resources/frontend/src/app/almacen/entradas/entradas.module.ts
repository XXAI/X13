import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { EntradasRoutingModule } from './entradas-routing.module';
import { ListaComponent } from './lista/lista.component';
import { EntradaComponent } from './entrada/entrada.component';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { DialogoLotesArticuloComponent } from './dialogo-lotes-articulo/dialogo-lotes-articulo.component';

@NgModule({
  declarations: [ListaComponent, EntradaComponent, DialogoLotesArticuloComponent],
  imports: [
    CommonModule,
    SharedModule,
    EntradasRoutingModule,
    ScrollingModule
  ]
})
export class EntradasModule { }
