import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../auth/auth.guard';
import { CatalogosAppsComponent } from './catalogos-apps/catalogos-apps.component';

const routes: Routes = [
  { path: 'catalogos', component: CatalogosAppsComponent, canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CatalogosRoutingModule { }
