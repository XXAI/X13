import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../auth/auth.guard';
import { ConfiguracionAppsComponent } from './configuracion-apps/configuracion-apps.component';

const routes: Routes = [
  { path: 'configuracion', component: ConfiguracionAppsComponent, canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ConfiguracionRoutingModule { }
