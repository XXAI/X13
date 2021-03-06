import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../../auth/auth.guard';

import { ListaComponent } from './lista/lista.component';
import { PedidoComponent } from './pedido/pedido.component';

const routes: Routes = [
  { path: 'pedidos/pedidos-ordinarios',               component: ListaComponent, canActivate: [AuthGuard] },
  { path: 'pedidos/pedidos-ordinarios/nuevo/:tipo',   component: PedidoComponent, canActivate: [AuthGuard] },
  { path: 'pedidos/pedidos-ordinarios/editar/:id',    component: PedidoComponent, canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PedidosOrdinariosRoutingModule { }
