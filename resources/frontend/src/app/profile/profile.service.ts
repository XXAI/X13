import { Injectable } from '@angular/core';
//import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  //profileChange = new Subject<any>();  
  
  private url = `${environment.base_url}/profile`;

  constructor(private http: HttpClient) { }

  getProfileData(id) {
    return this.http.get<any>(this.url+'/'+id,{}).pipe(
      map( (response: any) => {        
        //this.profile = response.data;
        //this.profileChange.next({...this.profile});
        return response;
      }
    ));
  }

  updateUser(payload,id) {
    return this.http.put<any>(this.url+'/'+id,payload).pipe(
      map( (response) => {
        return response;
      }
    ));
  }
  
  /*
  getServerProfile():Observable<any> {
    const url = `${environment.base_url}/auth/perfil`;
    return this.http.get<any>(url).pipe(
      map( response => {
        this.profile = response.data;
        this.profileChange.next({...this.profile});
        return response;
      })
    );
  }

  updateIdentity(payload) {
    const url = `${environment.base_url}/jwt/v1/perfil/identidad`;
    return this.http.put<any>(url,payload).pipe(
      map( (response) => {        
        this.profile = response.data;
        this.profileChange.next({...this.profile});        
        return response;
      }
    ));
  }

  updateAccount(payload) {
    const url = `${environment.base_url}/jwt/v1/perfil/cuenta`;
    return this.http.put<any>(url,payload).pipe(
      map( (response) => {        
        this.profile = response.data;
        this.profileChange.next({...this.profile});        
        return response;
      }
    ));
  }

  resetPassword(current_password:string, new_password: string):Observable<any> {
    const url = `${environment.base_url}/jwt/v1/reset-password`;
    return this.http.put<any>(url, {current_password, new_password});
  }*/
}
