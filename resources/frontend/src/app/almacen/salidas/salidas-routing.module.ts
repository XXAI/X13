import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../../auth/auth.guard';
import { ListaComponent } from './lista/lista.component';
import { SalidaComponent } from './salida/salida.component';

const routes: Routes = [
  { path: 'almacen/salidas', component: ListaComponent, canActivate: [AuthGuard] },
  { path: 'almacen/salidas/nueva',      component: SalidaComponent, canActivate: [AuthGuard] },
  { path: 'almacen/salidas/editar/:id', component: SalidaComponent, canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SalidasRoutingModule { }
