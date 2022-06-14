import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { DashboardUnidadRoutingModule } from './dashboard-unidad-routing.module';
import { PanelComponent } from './panel/panel.component';
import { TotalAbastoEquipamientoComponent } from './widgets/total-abasto-equipamiento/total-abasto-equipamiento.component';
import { DatosUnidadMedicaComponent } from './widgets/datos-unidad-medica/datos-unidad-medica.component';

@NgModule({
  declarations: [PanelComponent, TotalAbastoEquipamientoComponent, DatosUnidadMedicaComponent],
  imports: [
    CommonModule,
    SharedModule,
    DashboardUnidadRoutingModule
  ]
})
export class DashboardUnidadModule { }
