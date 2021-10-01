import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../auth/auth.guard';

import { ListaComponent } from './lista/lista.component';
import { AdminListaComponent } from './admin-lista/admin-lista.component';

const routes: Routes = [
  { path: 'captura-reporte-semanal',               component: ListaComponent, canActivate: [AuthGuard] },
  { path: 'admin-captura-reporte-semanal',         component: AdminListaComponent, canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CapturaReporteSemanalRoutingModule { }
