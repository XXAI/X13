import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../../shared/shared.module';
import { PermissionsRoutingModule } from './permissions-routing.module';
import { ListComponent } from './list/list.component';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { getEspPaginatorIntl } from 'src/app/esp-paginator-intl';
import { FormComponent } from './form/form.component';
import { ConfirmActionDialogComponent } from '../../utils/confirm-action-dialog/confirm-action-dialog.component';


@NgModule({
  declarations: [ListComponent, FormComponent, ConfirmActionDialogComponent],
  imports: [
    CommonModule,
    PermissionsRoutingModule,
    SharedModule
  ],
  entryComponents:[
    FormComponent,
    ConfirmActionDialogComponent
  ],
  providers:[
    { provide: MatPaginatorIntl, useValue: getEspPaginatorIntl() }
  ]
})
export class PermissionsModule { }
