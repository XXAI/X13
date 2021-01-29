import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../../auth/auth.guard';

import { ListaComponent } from './lista/lista.component';
import { PedidoComponent } from './pedido/pedido.component';

const routes: Routes = [
  { path: 'pedidos/recepcion-pedidos',               component: ListaComponent, canActivate: [AuthGuard] },
  { path: 'pedidos/recepcion-pedidos/recibir/:id',    component: PedidoComponent, canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RecepcionPedidosRoutingModule { }