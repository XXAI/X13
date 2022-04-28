import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { BienesServiciosRoutingModule } from './bienes-servicios-routing.module';
import { ListaComponent } from './lista/lista.component';
import { DialogoDetallesComponent } from './dialogo-detalles/dialogo-detalles.component';


@NgModule({
  declarations: [ListaComponent, DialogoDetallesComponent],
  imports: [
    CommonModule,
    SharedModule,
    BienesServiciosRoutingModule
  ]
})
export class BienesServiciosModule { }
