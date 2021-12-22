import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../../shared/shared.module';
import { AlmacenesRoutingModule } from './almacenes-routing.module';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { getEspPaginatorIntl } from 'src/app/esp-paginator-intl';

import { ListaComponent } from './lista/lista.component';
import { FormComponent } from './form/form.component';


@NgModule({
  declarations: [ListaComponent, FormComponent],
  imports: [
    CommonModule,
    SharedModule,
    AlmacenesRoutingModule
  ],
  entryComponents:[
    FormComponent,
  ],
  providers:[
    { provide: MatPaginatorIntl, useValue: getEspPaginatorIntl() }
  ]
})
export class AlmacenesModule { }
