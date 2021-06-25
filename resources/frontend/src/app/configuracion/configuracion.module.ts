import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../shared/shared.module';

import { ConfiguracionRoutingModule } from './configuracion-routing.module';
import { ConfiguracionAppsComponent } from './configuracion-apps/configuracion-apps.component';

import { GruposModule } from './grupos/grupos.module';
import { ElementosPedidosModule } from './elementos-pedidos/elementos-pedidos.module';

@NgModule({
  declarations: [ConfiguracionAppsComponent],
  imports: [
    CommonModule,
    SharedModule,
    GruposModule,
    ElementosPedidosModule,
    ConfiguracionRoutingModule
  ]
})
export class ConfiguracionModule { }
