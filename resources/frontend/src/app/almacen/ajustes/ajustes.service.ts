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
  url_lotes = `${environment.base_url}/ajustes/articulo-lotes`;
  url_movimientos = `${environment.base_url}/ajustes/lote-movimientos/`;
  url_guardar = `${environment.base_url}/ajustes/guardar-cambios-lote/`;
  url_resguardos = `${environment.base_url}/ajustes/lote-resguardos`;

  constructor(private http: HttpClient) { }

  guardarCambioLote(id,payload) {
    return this.http.put<any>(this.url_guardar+id,payload).pipe(
      map( (response: any) => {
        return response;
      }
    ));
  }

  getMovimientos(id) {
    return this.http.get<any>(this.url_movimientos+id,{}).pipe(
      map( (response: any) => {
        return response;
      }
    ));
  }

  getLotes(payload) {
    return this.http.get<any>(this.url_lotes,{params: payload}).pipe(
      map( (response: any) => {
        return response;
      }
    ));
  }

  getLoteResguardo(id){
    return this.http.get<any>(this.url_resguardos+'/'+id,{}).pipe(
      map( (response: any) => {
        return response;
      }
    ));
  }

  guardarResguardo(id,payload){
    return this.http.put<any>(this.url_resguardos+'/'+id,payload).pipe(
      map( (response: any) => {
        return response;
      }
    ));
  }

  borrarResguardo(id){
    return this.http.delete<any>(this.url_resguardos+'/'+id,{}).pipe(
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