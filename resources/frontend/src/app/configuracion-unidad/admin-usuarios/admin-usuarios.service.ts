import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AdminUsuariosService {
  url = `${environment.base_url}/configuracion-unidad/admin-usuarios`;

  constructor(private http: HttpClient) { }

  getUsuarios():Observable<any> {
    return this.http.get<any>(this.url,{}).pipe(
      map( response => {
        return response;
      })
    );
  }

  updateUsuario(id,payload) {
    return this.http.put<any>(this.url+'/'+id,payload).pipe(
      map( (response) => {
        return response;
      }
    ));
  }
}
