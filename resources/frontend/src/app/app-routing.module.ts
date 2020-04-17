import { NgModule } from '@angular/core';
import { Routes, RouterModule, Router } from '@angular/router';

import { WelcomeComponent } from "./welcome/welcome.component";
import { AuthGuard } from './auth/auth.guard';
import { GuessGuard } from './auth/guess.guard';
import { AppsListComponent } from './apps-list/apps-list.component';
import { ProfileComponent } from './profile/profile.component';
import { ForbiddenComponent } from './forbidden/forbidden.component';


const routes: Routes = [
  { path: 'splash', component: WelcomeComponent, canActivate: [GuessGuard] }, 
  { path: 'apps', component: AppsListComponent, canActivate: [AuthGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: 'sin-permiso', component: ForbiddenComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [AuthGuard, GuessGuard]
})
export class AppRoutingModule { }
