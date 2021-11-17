import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class EntradasService {
  url_entradas = `${environment.base_url}/almacen-entradas`;
  url_insumos = `${environment.base_url}/insumos-medicos`;

  constructor(private http: HttpClient) { }

  getListadoEntradas(payload):Observable<any> {
    return this.http.get<any>(this.url_entradas,{params:payload}).pipe(
      map( response => {
        return response;
      })
    );
  }

  verEntrada(id):Observable<any>{
    return this.http.get<any>(this.url_entradas+'/'+id).pipe(
      map( response => {
        return response;
      })
    );
  }

  nuevaEntrada(datos):Observable<any>{
    return this.http.put<any>(this.url_entradas,datos).pipe(
      map( (response) => {
        return response;
      }
    ));
  }

  buscarArticulos(payload):Observable<any> {
    return this.http.get<any>(this.url_insumos,{params:payload}).pipe(
      map( response => {
        return response;
      })
    );
  }
}