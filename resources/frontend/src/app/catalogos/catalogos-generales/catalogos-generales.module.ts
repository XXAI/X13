import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';

import { CatalogosGeneralesRoutingModule } from './catalogos-generales-routing.module';
import { ListaComponent } from './lista/lista.component';
import { DialogoRegistroComponent } from './dialogo-registro/dialogo-registro.component';


@NgModule({
  declarations: [ListaComponent, DialogoRegistroComponent],
  imports: [
    CommonModule,
    SharedModule,
    CatalogosGeneralesRoutingModule
  ]
})
export class CatalogosGeneralesModule { }
