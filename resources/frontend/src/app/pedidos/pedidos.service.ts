import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PedidosService {
  url_elementos = `${environment.base_url}/busqueda-elementos`;
  url_datos_cat = `${environment.base_url}/datos-catalogo`;

  constructor(private http: HttpClient) { }

  buscarElementos(payload):Observable<any> {
    return this.http.get<any>(this.url_elementos,{params:payload}).pipe(
      map( response => {
        return response;
      })
    );
  }

  obtenerDatosCatalogo(payload):Observable<any> {
    return this.http.get<any>(this.url_datos_cat,{params:payload}).pipe(
      map( response => {
        return response;
      })
    );
  }
}
