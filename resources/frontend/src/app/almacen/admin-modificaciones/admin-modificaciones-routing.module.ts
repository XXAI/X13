import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../../auth/auth.guard';
import { ListaPeticionesComponent } from './lista-peticiones/lista-peticiones.component';

const routes: Routes = [
  { path: 'almacen/administrar-modificaciones/lista-peticiones', component: ListaPeticionesComponent, canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminModificacionesRoutingModule { }
