import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../../auth/auth.guard';
import { ListaComponent } from './lista/lista.component';
import { EntradaComponent } from './entrada/entrada.component';

const routes: Routes = [
  { path: 'almacen/entradas',            component: ListaComponent, canActivate: [AuthGuard] },
  { path: 'almacen/entradas/nueva',      component: EntradaComponent, canActivate: [AuthGuard] },
  { path: 'almacen/entradas/editar/id:', component: EntradaComponent, canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EntradasRoutingModule { }
