import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Route, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { APPS} from '../apps-list/apps';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    public router: Router,
    public authService: AuthService
  ) { }
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
      if(!this.authService.getToken()){
        this.router.navigateByUrl('/login');
        return false;
      }else{
        let userApp:any = {children: APPS};
        for(let i in next.url){
          let appIndex = userApp.children.findIndex(item => item.route == next.url[i].path);
          if(appIndex >= 0){
            userApp = userApp.children[appIndex];
            if(!userApp.children){
              break;
            }
          }else{
            break;
          }
        }
        if(userApp.permission){
          let userPermissions = JSON.parse(localStorage.getItem('permissions'));
          if(!userPermissions[userApp.permission]){
            this.router.navigateByUrl('/sin-permiso');
            return false;
          }
        }
      }
    return true;
  }

  canLoad(route: Route): Observable<boolean> | Promise<boolean> | boolean {
    if(!this.authService.getToken()){
      this.router.navigateByUrl('/login');
      return false;
    }
    return true
  }
}
