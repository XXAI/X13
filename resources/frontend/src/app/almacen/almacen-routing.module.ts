import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../auth/auth.guard';
import { AlmacenAppsComponent } from './almacen-apps/almacen-apps.component';

const routes: Routes = [
  { path: 'almacen', component: AlmacenAppsComponent, canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AlmacenRoutingModule { }
