import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../shared/shared.module';

import { CatalogosRoutingModule } from './catalogos-routing.module';
import { CatalogosAppsComponent } from './catalogos-apps/catalogos-apps.component';


@NgModule({
  declarations: [CatalogosAppsComponent],
  imports: [
    CommonModule,
    SharedModule,
    CatalogosRoutingModule
  ]
})
export class CatalogosModule { }
