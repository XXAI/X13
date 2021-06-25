import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DevToolsRoutingModule } from './dev-tools-routing.module';
import { ReporterModule } from './reporter/reporter.module';
import { JsonFilesModule } from './json-files/json-files.module';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    DevToolsRoutingModule
  ],
  exports:[
    ReporterModule,
    JsonFilesModule
  ]
})
export class DevToolsModule { }
