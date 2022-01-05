import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ConfiguracionUnidadRoutingModule } from './configuracion-unidad-routing.module';
import { CatalogoArticulosModule } from './catalogo-articulos/catalogo-articulos.module';
import { AlmacenesModule } from './almacenes/almacenes.module';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ConfiguracionUnidadRoutingModule
  ],
  exports:[
    CatalogoArticulosModule,
    AlmacenesModule
  ]
})
export class ConfiguracionUnidadModule { }
