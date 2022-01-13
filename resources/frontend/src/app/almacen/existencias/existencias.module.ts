import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { ExistenciasRoutingModule } from './existencias-routing.module';
import { ListaComponent } from './lista/lista.component';
import { DialogoDetallesStockComponent } from './dialogo-detalles-stock/dialogo-detalles-stock.component';


@NgModule({
  declarations: [ListaComponent, DialogoDetallesStockComponent],
  imports: [
    CommonModule,
    SharedModule,
    ExistenciasRoutingModule
  ]
})
export class ExistenciasModule { }
