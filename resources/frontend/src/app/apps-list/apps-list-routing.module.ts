import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppsListComponent } from './apps-list.component';
import { AuthGuard } from '../auth/auth.guard';

const routes: Routes = [
  { path: '', component: AppsListComponent, canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AppsListRoutingModule { }
