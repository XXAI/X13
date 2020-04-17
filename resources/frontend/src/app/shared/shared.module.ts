import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from "@angular/flex-layout";
import { MaterialModule } from '../material/material.module';
import { HttpClientModule } from '@angular/common/http';
import { IfHasPermissionDirective } from './if-has-permission.directive';

@NgModule({
  declarations: [IfHasPermissionDirective],
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
    IfHasPermissionDirective
  ],
})
export class SharedModule { }
