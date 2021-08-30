import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RecepcionPedidosService {
  url_pedidos = `${environment.base_url}/recepcion-pedidos`;
  url_insumos = `${environment.base_url}/lista-insumos-recepcion`;
  url_catalogos = `${environment.base_url}/recepcion-pedidos-catalogos`;
  url_archivo = `${environment.base_url}/importar-entradas-excel`;

  constructor(private http: HttpClient) { }

  obtenerDatosCatalogo(payload):Observable<any> {
    return this.http.get<any>(this.url_catalogos,{params:payload}).pipe(
      map( response => {
        return response;
      })
    );
  }

  obtenerListaPedidos(payload):Observable<any> {
    return this.http.get<any>(this.url_pedidos,{params: payload}).pipe(
      map( response => {
        return response;
      })
    );
  }

  obtenerListaInsumosRecepcion(id):Observable<any> {
    return this.http.get<any>(this.url_insumos+'/'+id,{}).pipe(
      map( (response: any) => {        
        return response;
      }
    ));
  }

  verPedido(id) {
    return this.http.get<any>(this.url_pedidos+'/'+id,{}).pipe(
      map( (response: any) => {        
        return response;
      }
    ));
  }

  actualizarPedido(payload,id) {
    return this.http.put<any>(this.url_pedidos+'/'+id,payload).pipe(
      map( (response) => {
        return response;
      }
    ));
  }

  subirArchivo(payload) {
    const headers = { 'X-File-Upload-Header': 'true' }; //Implementando el fix de Hugo
    return this.http.post<any>(this.url_archivo,payload, {headers}).pipe(
      map( (response) => {
        return response;
      }
    ));
  }
}