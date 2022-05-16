import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../shared/shared.module';

import { CatalogosRoutingModule } from './catalogos-routing.module';
import { CatalogosAppsComponent } from './catalogos-apps/catalogos-apps.component';

import { CatalogosGeneralesModule } from './catalogos-generales/catalogos-generales.module';
import { BienesServiciosModule } from './bienes-servicios/bienes-servicios.module';


@NgModule({
  declarations: [CatalogosAppsComponent],
  imports: [
    CommonModule,
    SharedModule,
    BienesServiciosModule,
    CatalogosGeneralesModule,
    CatalogosRoutingModule
  ]
})
export class CatalogosModule { }
