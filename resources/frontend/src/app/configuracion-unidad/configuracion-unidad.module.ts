import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ConfiguracionUnidadRoutingModule } from './configuracion-unidad-routing.module';
import { CatalogoArticulosModule } from './catalogo-articulos/catalogo-articulos.module';
import { AlmacenesModule } from './almacenes/almacenes.module';
import { UnidadMedicaComponent } from './unidad-medica/unidad-medica.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [UnidadMedicaComponent],
  imports: [
    CommonModule,
    ConfiguracionUnidadRoutingModule,
    SharedModule
  ],
  exports:[
    CatalogoArticulosModule,
    AlmacenesModule
  ]
})
export class ConfiguracionUnidadModule { }
