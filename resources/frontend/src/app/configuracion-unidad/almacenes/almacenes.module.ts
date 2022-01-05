import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../../shared/shared.module';
import { AlmacenesRoutingModule } from './almacenes-routing.module';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { getEspPaginatorIntl } from 'src/app/esp-paginator-intl';

import { ListaAlmacenesComponent } from './lista-almacenes/lista-almacenes.component';
import { FormAlmacenesComponent } from './form-almacenes/form-almacenes.component';


@NgModule({
  declarations: [ListaAlmacenesComponent, FormAlmacenesComponent],
  imports: [
    CommonModule,
    SharedModule,
    AlmacenesRoutingModule
  ],
  entryComponents:[
    FormAlmacenesComponent,
  ],
  providers:[
    { provide: MatPaginatorIntl, useValue: getEspPaginatorIntl() }
  ]
})
export class AlmacenesModule { }
