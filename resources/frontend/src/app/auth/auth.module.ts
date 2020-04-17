import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { SharedModule } from '../shared/shared.module';
import { AuthRoutingModule } from './auth-routing.module';

import { LoginComponent } from './login/login.component';


@NgModule({
  declarations: [LoginComponent],
  imports: [
    ReactiveFormsModule,
    HttpClientModule,
    SharedModule,
    AuthRoutingModule
  ]
})
export class AuthModule { }
