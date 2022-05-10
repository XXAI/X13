import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AjustesService {
  url_articulos = `${environment.base_url}/ajustes/articulos`;
  url_lotes = `${environment.base_url}/ajustes/articulo-lotes/`;

  constructor(private http: HttpClient) { }

  getLotes(id) {
    return this.http.get<any>(this.url_lotes+id,{}).pipe(
      map( (response: any) => {
        return response;
      }
    ));
  }

  getListaArticulos(payload):Observable<any> {
    return this.http.get<any>(this.url_articulos,{params: payload}).pipe(
      map( response => {
        return response;
      })
    );
  }
}