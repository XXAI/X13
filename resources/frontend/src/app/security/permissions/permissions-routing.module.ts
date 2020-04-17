import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from 'src/app/auth/auth.guard';

import { ListComponent } from './list/list.component';

const routes: Routes = [
  { path: 'permisos', component: ListComponent, canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PermissionsRoutingModule { }
