import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';

import { AjustesRoutingModule } from './ajustes-routing.module';
import { ListaComponent } from './lista/lista.component';


@NgModule({
  declarations: [ListaComponent],
  imports: [
    CommonModule,
    SharedModule,
    AjustesRoutingModule
  ]
})
export class AjustesModule { }
