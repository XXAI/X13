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
  url_cancelar = `${environment.base_url}/almacen-entradas-cancelar/`;

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

  guardarEntrada(datos):Observable<any>{
    return this.http.post<any>(this.url_entradas,datos).pipe(
      map( (response) => {
        return response;
      }
    ));
  }

  eliminarEntrada(id):Observable<any>{
    return this.http.delete<any>(this.url_entradas+'/'+id).pipe(
      map( response => {
        return response;
      })
    );
  }

  cancelarEntrada(id):Observable<any>{
    return this.http.put<any>(this.url_cancelar+id,{}).pipe(
      map( response => {
        return response;
      })
    );
  }
  
}