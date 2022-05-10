import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListaComponent } from './lista/lista.component';
import { AuthGuard } from '../../auth/auth.guard';

const routes: Routes = [
  { path: 'almacen/ajustes',            component: ListaComponent, canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AjustesRoutingModule { }
