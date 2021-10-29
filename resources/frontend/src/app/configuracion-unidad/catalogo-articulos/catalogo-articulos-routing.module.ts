import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListaArticulosComponent }  from './lista-articulos/lista-articulos.component';
import { AuthGuard } from '../../auth/auth.guard';


const routes: Routes = [
  { path: 'configuracion-unidad/catalogo-articulos', component: ListaArticulosComponent, canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CatalogoArticulosRoutingModule { }
