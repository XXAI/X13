import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { EntradasRoutingModule } from './entradas-routing.module';
import { ListaComponent } from './lista/lista.component';
import { EntradaComponent } from './entrada/entrada.component';
import { InsumoLoteDialogoComponent } from './insumo-lote-dialogo/insumo-lote-dialogo.component';
import { ScrollingModule } from '@angular/cdk/scrolling';

@NgModule({
  declarations: [ListaComponent, EntradaComponent, InsumoLoteDialogoComponent],
  imports: [
    CommonModule,
    SharedModule,
    EntradasRoutingModule,
    ScrollingModule
  ],
  entryComponents:[
    InsumoLoteDialogoComponent
  ]
})
export class EntradasModule { }
