import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PermissionsService {

  url = `${environment.base_url}/permission`;

  constructor(private http: HttpClient) { }

  getPermissionList(payload):Observable<any> {
    return this.http.get<any>(this.url,{params: payload}).pipe(
      map( response => {
        return response;
      })
    );
  }

  getAllPermissions():Observable<any> {
    return this.http.get<any>(this.url,{}).pipe(
      map( response => {
        return response;
      })
    );
  }

  getPermission(id) {
    return this.http.get<any>(this.url+'/'+id,{}).pipe(
      map( (response: any) => {
        return response;
      }
    ));
  }

  updatePermission(id,payload) {
    return this.http.put<any>(this.url+'/'+id,payload).pipe(
      map( (response) => {
        return response;
      }
    ));
  }

  createPermission(payload) {
    return this.http.post<any>(this.url,payload).pipe(
      map( (response) => {
        return response;
      }
    ));
  }

  deletePermission(id) {
    return this.http.delete<any>(this.url+'/'+id,{}).pipe(
      map( (response) => {
        return response;
      }
    ));
  }
}
