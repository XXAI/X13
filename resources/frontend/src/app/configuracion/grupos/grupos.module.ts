import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { ScrollingModule } from '@angular/cdk/scrolling';

import { GruposRoutingModule } from './grupos-routing.module';
import { ListaComponent } from './lista/lista.component';
import { DialogoFormularioGrupoComponent } from './dialogo-formulario-grupo/dialogo-formulario-grupo.component';


@NgModule({
  declarations: [ListaComponent, DialogoFormularioGrupoComponent],
  imports: [
    CommonModule,
    SharedModule,
    GruposRoutingModule,
    ScrollingModule
  ]
})
export class GruposModule { }
