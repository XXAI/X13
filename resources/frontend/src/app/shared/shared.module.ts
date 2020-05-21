import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from "@angular/flex-layout";
import { MaterialModule } from '../material/material.module';
import { HttpClientModule } from '@angular/common/http';
import { IfHasPermissionDirective } from './if-has-permission.directive';

import { AppHubComponent } from './components/app-hub/app-hub.component';
import { MascaraFechaDirective } from './mascara-fecha.directive'; //Temporal, tengo que mover el componente al folder shared

@NgModule({
  declarations: [IfHasPermissionDirective, AppHubComponent, MascaraFechaDirective],
  imports: [
    CommonModule,
    FormsModule,
    FlexLayoutModule,
    MaterialModule,
    ReactiveFormsModule,
    HttpClientModule,
  ],
  exports: [
    CommonModule,
    FormsModule,
    FlexLayoutModule,
    MaterialModule,
    ReactiveFormsModule,
    HttpClientModule,
    IfHasPermissionDirective,
    MascaraFechaDirective,
    AppHubComponent,
  ],
})
export class SharedModule { }
