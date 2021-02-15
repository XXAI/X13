import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ExistenciasRoutingModule } from './existencias-routing.module';
import { IndexComponent } from './index/index.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { MovimientosDialogComponent } from './movimientos-dialog/movimientos-dialog.component';


@NgModule({
  entryComponents: [
    MovimientosDialogComponent,
  ],
  declarations: [IndexComponent, MovimientosDialogComponent],
  imports: [
    CommonModule,
    ExistenciasRoutingModule,
    SharedModule
  ]
})
export class ExistenciasModule { }
