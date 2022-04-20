import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { VisorAbastoSurtimientoRoutingModule } from './visor-abasto-surtimiento-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';


@NgModule({
  declarations: [DashboardComponent],
  imports: [
    CommonModule,
    SharedModule,
    VisorAbastoSurtimientoRoutingModule
  ]
})
export class VisorAbastoSurtimientoModule { }
