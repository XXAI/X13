import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AppsListRoutingModule } from './apps-list-routing.module';
import { AppsListComponent } from './apps-list.component';
import { SharedModule } from '../shared/shared.module';


@NgModule({
  declarations: [AppsListComponent],
  imports: [
    CommonModule,
    AppsListRoutingModule,
    SharedModule
  ]
})
export class AppsListModule { }
