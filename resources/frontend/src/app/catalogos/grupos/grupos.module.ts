import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';

import { GruposRoutingModule } from './grupos-routing.module';
import { ListaComponent } from './lista/lista.component';


@NgModule({
  declarations: [ListaComponent],
  imports: [
    CommonModule,
    SharedModule,
    GruposRoutingModule
  ]
})
export class GruposModule { }
