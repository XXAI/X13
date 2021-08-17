import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../../auth/auth.guard';

import { ListaComponent } from './lista/lista.component';
import { DetallesRecepcionPedidoComponent } from './detalles-recepcion-pedido/detalles-recepcion-pedido.component';

const routes: Routes = [
  { path: 'pedidos/estatus-avance',               component: ListaComponent,                   canActivate: [AuthGuard] },
  { path: 'pedidos/estatus-avance/detalles/:id',  component: DetallesRecepcionPedidoComponent, canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EstatusAvanceRecepcionRoutingModule { }