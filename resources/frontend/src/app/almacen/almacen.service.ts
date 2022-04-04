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
  url_admin_mods = `${environment.base_url}/movimientos-administrar-modificacion/`;
  url_guardar_mods = `${environment.base_url}/guardar-modificacion/`;

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

  administrarModificacion(id,payload):Observable<any> {
    return this.http.put<any>(this.url_admin_mods+id,payload).pipe(
      map( response => {
        return response;
      })
    );
  }

  guardarModificacion(id,payload):Observable<any> {
    return this.http.put<any>(this.url_guardar_mods+id,payload).pipe(
      map( response => {
        return response;
      })
    );
  }
}