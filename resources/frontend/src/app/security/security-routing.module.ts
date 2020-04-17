import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../auth/auth.guard';
import { SecurityComponent } from './security.component';

const routes: Routes = [
  { path: 'seguridad', component: SecurityComponent, canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SecurityRoutingModule { }
