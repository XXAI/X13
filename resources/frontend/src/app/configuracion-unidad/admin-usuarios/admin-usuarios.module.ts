import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { AdminUsuariosRoutingModule } from './admin-usuarios-routing.module';
import { ListaUsuariosComponent } from './lista-usuarios/lista-usuarios.component';


@NgModule({
  declarations: [ListaUsuariosComponent],
  imports: [
    CommonModule,
    SharedModule,
    AdminUsuariosRoutingModule
  ]
})
export class AdminUsuariosModule { }
