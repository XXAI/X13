import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ExistenciasService {
  url_existencias = `${environment.base_url}/almacen-existencias`;
  url_movimientos = `${environment.base_url}/almacen-existencias/movimientos`;
  url_detalles = `${environment.base_url}/almacen-existencias/detalles`;
  
  constructor(private http: HttpClient) { }

  obtenerExistencias(payload):Observable<any> {
    return this.http.get<any>(this.url_existencias,{params: payload}).pipe(
      map( response => {
        return response;
      })
    );
  }

  buscarMovimiento(stock_id,payload): Observable<any>{
    return this.http.get(this.url_movimientos+`/${stock_id}`,{params: payload});
  }

  obtenerDetallesStock(id,payload:any={}):Observable<any> {
    return this.http.get<any>(this.url_detalles+`/${id}`,{params: payload}).pipe(
      map( response => {
        return response;
      })
    );
  }
}