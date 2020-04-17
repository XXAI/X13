import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReporterRoutingModule } from './reporter-routing.module';
import { MysqlReporterComponent } from './mysql-reporter/mysql-reporter.component';
import { SharedModule } from 'src/app/shared/shared.module';


@NgModule({
  declarations: [MysqlReporterComponent],
  imports: [
    CommonModule,
    SharedModule,
    ReporterRoutingModule
  ]
})
export class ReporterModule { }
