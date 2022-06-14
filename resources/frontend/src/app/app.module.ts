import { BrowserModule } from '@angular/platform-browser';
import { NgModule, LOCALE_ID } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { LocationStrategy, HashLocationStrategy} from '@angular/common';

import { AuthModule } from './auth/auth.module';
import { SharedModule } from './shared/shared.module';
import { UsersModule } from './users/users.module';
import { AppsListModule } from './apps-list/apps-list.module';

import { AppRoutingModule } from './app-routing.module';
import { WildcardRoutingModule } from './wildcard-routing.module';

import { SidenavListComponent } from './navigation/sidenav-list/sidenav-list.component';
import { DrawerListComponent } from './navigation/drawer-list/drawer-list.component';
import { HeaderComponent } from './navigation/header/header.component';
import { WelcomeComponent } from './welcome/welcome.component';

import { AppComponent } from './app.component';
import { AuthService } from './auth/auth.service';

import { SharedService } from './shared/shared.service';
import { TokenInterceptor, ErrorInterceptor } from './token.service';
import { MAT_STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { NotFoundComponent } from './not-found/not-found.component';
import { ForbiddenComponent } from './forbidden/forbidden.component';
import { MAT_DATE_LOCALE } from '@angular/material/core';

import { SecurityModule } from './security/security.module';
import { ProfileModule } from './profile/profile.module';
import { DevToolsModule } from './dev-tools/dev-tools.module';

//Modulos del Sistema
import { AlmacenModule } from './almacen/almacen.module';
import { VisorAbastoSurtimientoModule } from './visores/visor-abasto-surtimiento/visor-abasto-surtimiento.module';
import { DashboardUnidadModule } from './dashboard-unidad/dashboard-unidad.module';
import { CatalogosModule } from './catalogos/catalogos.module';
import { ConfiguracionModule } from './configuracion/configuracion.module';
import { PedidosModule } from './pedidos/pedidos.module';
import { CapturaReporteSemanalModule } from './captura-reporte-semanal/captura-reporte-semanal.module';
import { ConfiguracionUnidadModule } from './configuracion-unidad/configuracion-unidad.module';

//Para el Lenguaje de las Fechas
import { registerLocaleData } from '@angular/common';
import locale from '@angular/common/locales/es-MX';
registerLocaleData(locale);

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    SidenavListComponent,
    WelcomeComponent,
    NotFoundComponent,
    DrawerListComponent,
    ForbiddenComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AuthModule,
    SharedModule,
    AppsListModule,
    UsersModule,
    SecurityModule,
    DevToolsModule,
    AlmacenModule,
    VisorAbastoSurtimientoModule,
    DashboardUnidadModule,
    CatalogosModule,
    ConfiguracionModule,
    PedidosModule,
    CapturaReporteSemanalModule,
    ConfiguracionUnidadModule,
    ProfileModule,
    AppRoutingModule,
    WildcardRoutingModule,
  ],
  providers: [
    AuthService, 
    {
      provide: LocationStrategy,
      useClass: HashLocationStrategy
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorInterceptor,
      multi: true
    },
    {
      provide: MAT_STEPPER_GLOBAL_OPTIONS,
      useValue: { showError: true }
    },
    {
      provide: MAT_DATE_LOCALE, 
      useValue: 'es-MX'
    },
    { 
      provide: LOCALE_ID, 
      useValue: 'es-MX'
    },
    SharedService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
