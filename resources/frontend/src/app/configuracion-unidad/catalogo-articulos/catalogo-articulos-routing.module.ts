import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../../auth/auth.guard';
import { ListaCatalogosComponent } from './lista-catalogos/lista-catalogos.component';


const routes: Routes = [
  { path: 'configuracion-unidad/catalogo-articulos', component: ListaCatalogosComponent, canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CatalogoArticulosRoutingModule { }
