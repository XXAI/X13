import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  url = `${environment.base_url}/user`;
  url_role = `${environment.base_url}/role`;
  url_catalogs = `${environment.base_url}/user-catalogs`;
  url_permission = `${environment.base_url}/permission`;
  url_avatars = `${environment.base_url}/avatar-images`;

  constructor(private http: HttpClient) { }

  getAvatars():Observable<any> {
    return this.http.get<any>(this.url_avatars,{}).pipe(
      map( response => {
        return response;
      })
    );
  }

  getCatalogs():Observable<any> {
    return this.http.get<any>(this.url_catalogs,{}).pipe(
      map( response => {
        return response;
      })
    );
  }

  getAllRoles():Observable<any> {
    return this.http.get<any>(this.url_role,{}).pipe(
      map( response => {
        return response;
      })
    );
  }

  getAllPermissions():Observable<any> {
    return this.http.get<any>(this.url_permission,{}).pipe(
      map( response => {
        return response;
      })
    );
  }

  getUserList(payload):Observable<any> {
    return this.http.get<any>(this.url,{params: payload}).pipe(
      map( response => {
        return response;
      })
    );
  }

  getUser(id) {
    return this.http.get<any>(this.url+'/'+id,{}).pipe(
      map( (response: any) => {        
        //this.profile = response.data;
        //this.profileChange.next({...this.profile});
        return response.data;
      }
    ));
  }

  deleteUser(id){
    return this.http.delete<any>(this.url+'/'+id,{}).pipe(
      map( (response: any) => {
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

  createUser(payload) {
    return this.http.post<any>(this.url,payload).pipe(
      map( (response) => {
        return response;
      }
    ));
  }
}
