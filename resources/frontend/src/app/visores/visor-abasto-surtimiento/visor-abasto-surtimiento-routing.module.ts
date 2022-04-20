import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/auth/auth.guard';
import { DashboardComponent } from './dashboard/dashboard.component';

const routes: Routes = [
  { path: 'visor-abasto-surtimiento',            component: DashboardComponent, canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VisorAbastoSurtimientoRoutingModule { }
