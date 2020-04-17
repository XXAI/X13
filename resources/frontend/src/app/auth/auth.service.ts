import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, Subject, of } from 'rxjs';

import { User } from './models/user';
import { map } from 'rxjs/operators';

import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  authChange = new Subject<boolean>();  
  constructor(private http: HttpClient, private router: Router) {   }

  getToken(): string {
    return localStorage.getItem('token');
  }

  getUserData(): User{
    //console.log('####################################################################################### GetUserData()');
    let user = new User();
    user = JSON.parse(localStorage.getItem('user'));
    return user;
  }

  updateUserData(userData){
    let user = new User();
    user = userData;
    localStorage.setItem('user', JSON.stringify(user));
    this.authChange.next(true);
  }

  isAuth(): boolean {
    return !!this.getToken();
  }
  
  logIn(username: string, password: string):Observable<any> {
    const url = `${environment.base_url}/signin`;
    return this.http.post<any>(url, { username, password}).pipe(
      map( (response) => {
        if(response.access_token){
          localStorage.setItem('token', response.access_token);

          let user = JSON.stringify(response.user_data);
          localStorage.setItem('user', user);

          let permissions = JSON.stringify(response.permissions);
          localStorage.setItem('permissions', permissions);

          this.authChange.next(true);
        }
        return response;
      }
    ));
  }

  refreshToken():Observable<any>{
    const url = `${environment.base_url}/refresh`;
    return this.http.post<any>(url, {}).pipe(
      map( (response) => {
        if(response.access_token){
          localStorage.setItem('token', response.access_token);
          this.authChange.next(true);
        }
        return response;
      }
    ));
  }

  signUp(payload) {
    const url = `${environment.base_url}/signup`;
    return this.http.post<any>(url,payload).pipe(
      map( (response) => {
        if(response.access_token){
          localStorage.setItem('token', response.access_token);
          
          let user = JSON.stringify(response);
          localStorage.setItem('user', user);

          let permissions = JSON.stringify(response.permissions);
          localStorage.setItem('permissions', permissions);
          
          this.authChange.next(true);
        }
        return response;
      }
    ));
  }

  forgotPassword(email: string):Observable<any> {
    const url = `${environment.base_url}/forgot-password`;
    return this.http.post<any>(url, { email });
  }

  resetPassword(email:string, password: string, token: string):Observable<any> {
    const url = `${environment.base_url}/reset-password`;
    return this.http.post<any>(url, {email, password, token}).pipe(
      map( (response) => {
        if(response.token){
          localStorage.setItem('token', response.token);
          this.authChange.next(true);
        }
        return response;
      }
    ));
  }

  logout() {
    //this.user = null;
    localStorage.removeItem('token');
    localStorage.removeItem('userApps');
    localStorage.removeItem('permissions');
    this.authChange.next(false);
    this.router.navigate(['/login']);
  }
}
