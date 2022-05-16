import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CatalogosGeneralesService {
  url_catalogos = `${environment.base_url}/catalogos/catalogos-generales-lista`;
  url_catalogo = `${environment.base_url}/catalogos/catalogos-generales`;

  constructor(private http: HttpClient) { }

  getCatalogos():Observable<any> {
    return this.http.get<any>(this.url_catalogos,{}).pipe(
      map( response => {
        return response;
      })
    );
  }

  getRegistros(payload):Observable<any> {
    return this.http.get<any>(this.url_catalogo,{params: payload}).pipe(
      map( response => {
        return response;
      })
    );
  }

  getRegistro(id) {
    return this.http.get<any>(this.url_catalogo+'/'+id,{}).pipe(
      map( (response: any) => {
        return response;
      }
    ));
  }
  
  saveRegistro(payload) {
    return this.http.post<any>(this.url_catalogo,payload).pipe(
      map( (response) => {
        return response;
      }
    ));
  }

  deleteRegistro(id) {
    return this.http.delete<any>(this.url_catalogo+'/'+id,{}).pipe(
      map( (response) => {
        return response;
      }
    ));
  }
}