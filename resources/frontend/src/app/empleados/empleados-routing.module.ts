import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard } from '../auth/auth.guard';
import { ListaComponent } from './lista/lista.component';
import { EditarComponent } from './editar/editar.component';
import { NuevoComponent } from './nuevo/nuevo.component';


const routes: Routes = [
  { path: 'empleados', component: ListaComponent, canActivate: [AuthGuard] },
  { path: 'empleados/editar/:id', component: EditarComponent, canActivate: [AuthGuard] },
  { path: 'empleados/nuevo', component: EditarComponent, canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EmpleadosRoutingModule { }
