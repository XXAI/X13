import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { JsonFilesRoutingModule } from './json-files-routing.module';
import { JsonExcelComponent } from './json-excel/json-excel.component';
import { SharedModule } from 'src/app/shared/shared.module';


@NgModule({
  declarations: [JsonExcelComponent],
  imports: [
    CommonModule,
    SharedModule,
    JsonFilesRoutingModule
  ]
})
export class JsonFilesModule { }
