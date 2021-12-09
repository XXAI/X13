import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AlmacenService {
  url_articulos = `${environment.base_url}/buscar-articulos`;
  url_catalogos = `${environment.base_url}/almacen-movimientos-catalogos`;

  constructor(private http: HttpClient) { }

  buscarArticulosCatalogo(payload):Observable<any> {
    return this.http.get<any>(this.url_articulos,{params:payload}).pipe(
      map( response => {
        return response;
      })
    );
  }

  obtenerMovimientoCatalogos(payload:any = {}):Observable<any> {
    return this.http.get<any>(this.url_catalogos,{params:payload}).pipe(
      map( response => {
        return response;
      })
    );
  }
}