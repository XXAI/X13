import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/auth/auth.guard';
import { PanelComponent } from './panel/panel.component';

const routes: Routes = [
  { path: 'dashboard-unidad',            component: PanelComponent, canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardUnidadRoutingModule { }
