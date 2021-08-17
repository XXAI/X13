import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/auth/auth.guard';
import { IndexComponent } from './index/index.component';

const routes: Routes = [
  { path: 'almacen/importar', component: IndexComponent, canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ImportarRoutingModule { }
