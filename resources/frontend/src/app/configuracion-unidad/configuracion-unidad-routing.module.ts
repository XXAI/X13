import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UnidadMedicaComponent } from './unidad-medica/unidad-medica.component';
import { AuthGuard } from '../auth/auth.guard';

const routes: Routes = [
  { path: 'configuracion-unidad', component: UnidadMedicaComponent, canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ConfiguracionUnidadRoutingModule { }
