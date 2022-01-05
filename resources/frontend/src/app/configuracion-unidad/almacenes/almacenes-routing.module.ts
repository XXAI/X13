import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../../auth/auth.guard';

import { ListaAlmacenesComponent } from './lista-almacenes/lista-almacenes.component';

const routes: Routes = [
    { path: 'configuracion-unidad/almacenes', component: ListaAlmacenesComponent, canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AlmacenesRoutingModule { }
