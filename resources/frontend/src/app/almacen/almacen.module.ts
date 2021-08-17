import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../shared/shared.module';

import { EntradasModule } from './entradas/entradas.module';
import { SalidasModule } from './salidas/salidas.module';
import { AlmacenRoutingModule } from './almacen-routing.module';
import { AlmacenAppsComponent } from './almacen-apps/almacen-apps.component';
import { ExistenciasModule } from './existencias/existencias.module';
import { ImportarModule } from "./importar/importar.module";


@NgModule({
  declarations: [AlmacenAppsComponent],
  imports: [
    CommonModule,
    SharedModule,
    EntradasModule,
    SalidasModule,
    AlmacenRoutingModule,
    ExistenciasModule,
    ImportarModule
  ]
})
export class AlmacenModule { }
