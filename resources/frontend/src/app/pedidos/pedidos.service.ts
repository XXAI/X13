import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PedidosService {
  url_insumos = `${environment.base_url}/insumos-medicos`;
  url_datos_cat = `${environment.base_url}/datos-catalogo`;

  constructor(private http: HttpClient) { }

  buscarInsumos(payload):Observable<any> {
    return this.http.get<any>(this.url_insumos,{params:payload}).pipe(
      map( response => {
        return response;
      })
    );
  }

  obtenerDatosCatalogo():Observable<any> {
    return this.http.get<any>(this.url_datos_cat).pipe(
      map( response => {
        return response;
      })
    );
  }
}
