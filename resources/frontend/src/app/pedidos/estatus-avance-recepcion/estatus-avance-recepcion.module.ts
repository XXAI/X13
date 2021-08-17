import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import {SharedModule } from '../../shared/shared.module';
import { ScrollingModule } from '@angular/cdk/scrolling';

import { EstatusAvanceRecepcionRoutingModule } from './estatus-avance-recepcion-routing.module';
import { ListaComponent } from './lista/lista.component';
import { DetallesRecepcionPedidoComponent } from './detalles-recepcion-pedido/detalles-recepcion-pedido.component';
import { DialogoSubirArchivoComponent } from './dialogo-subir-archivo/dialogo-subir-archivo.component';


@NgModule({
  declarations: [ListaComponent, DetallesRecepcionPedidoComponent, DialogoSubirArchivoComponent],
  imports: [
    CommonModule,
    SharedModule,
    ScrollingModule,
    EstatusAvanceRecepcionRoutingModule
  ],
  entryComponents: [
    DialogoSubirArchivoComponent
  ]
})
export class EstatusAvanceRecepcionModule { }
