import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DevToolsRoutingModule } from './dev-tools-routing.module';
import { ReporterModule } from './reporter/reporter.module';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    DevToolsRoutingModule
  ],
  exports:[
    ReporterModule
  ]
})
export class DevToolsModule { }
