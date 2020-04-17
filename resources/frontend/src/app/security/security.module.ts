import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SecurityRoutingModule } from './security-routing.module';
import { PermissionsModule } from './permissions/permissions.module';
import { RolesModule } from './roles/roles.module';
import { SharedModule } from '../shared/shared.module';
import { SecurityComponent } from './security.component';


@NgModule({
  declarations: [SecurityComponent],
  imports: [
    CommonModule,
    SharedModule,
    SecurityRoutingModule
  ],
  exports: [
    PermissionsModule,
    RolesModule
  ]
})
export class SecurityModule { }
