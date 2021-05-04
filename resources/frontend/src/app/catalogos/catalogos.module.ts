import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../shared/shared.module';

import { AlmacenesModule } from './almacenes/almacenes.module';
import { GruposModule } from './grupos/grupos.module';
import { CatalogosRoutingModule } from './catalogos-routing.module';
import { CatalogosAppsComponent } from './catalogos-apps/catalogos-apps.component';


@NgModule({
  declarations: [CatalogosAppsComponent],
  imports: [
    CommonModule,
    SharedModule,
    AlmacenesModule,
    GruposModule,
    CatalogosRoutingModule
  ]
})
export class CatalogosModule { }
