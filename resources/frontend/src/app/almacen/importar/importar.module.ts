import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ImportarRoutingModule } from './importar-routing.module';
import { IndexComponent } from './index/index.component';
import { SharedModule } from 'src/app/shared/shared.module';


@NgModule({
  declarations: [IndexComponent],
  imports: [
    CommonModule,
    ImportarRoutingModule,
    SharedModule
  ]
})
export class ImportarModule { }
