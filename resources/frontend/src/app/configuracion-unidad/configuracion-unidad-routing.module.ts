import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {path:'configuracion-unidad', redirectTo:'configuracion-unidad/catalogo-articulos',pathMatch:'full'}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ConfiguracionUnidadRoutingModule { }
