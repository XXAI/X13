import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../../shared/shared.module';
import { AlmacenesRoutingModule } from './almacenes-routing.module';

import { ListaComponent } from './lista/lista.component';


@NgModule({
  declarations: [ListaComponent],
  imports: [
    CommonModule,
    SharedModule,
    AlmacenesRoutingModule
  ]
})
export class AlmacenesModule { }
