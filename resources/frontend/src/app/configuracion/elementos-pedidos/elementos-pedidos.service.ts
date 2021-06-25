import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})

export class ElementosPedidosService {

  url = `${environment.base_url}/configuracion/tipos-elementos-pedidos`;
  url_catalogos = `${environment.base_url}/cargar-catalogos`;

  constructor(private http: HttpClient) { }

  getCatalogos(payload):Observable<any> {
    return this.http.get<any>(this.url_catalogos,{params: payload}).pipe(
      map( response => {
        return response;
      })
    );
  }

  getTiposPedidosList(payload):Observable<any> {
    return this.http.get<any>(this.url,{params: payload}).pipe(
      map( response => {
        return response;
      })
    );
  }

  getTipoPedido(id) {
    return this.http.get<any>(this.url+'/'+id,{}).pipe(
      map( (response: any) => {
        return response;
      }
    ));
  }

  updateTipoPedido(id,payload) {
    return this.http.put<any>(this.url+'/'+id,payload).pipe(
      map( (response) => {
        return response;
      }
    ));
  }

  createTipoPedido(payload) {
    return this.http.post<any>(this.url,payload).pipe(
      map( (response) => {
        return response;
      }
    ));
  }

  deleteTipoPedido(id) {
    return this.http.delete<any>(this.url+'/'+id,{}).pipe(
      map( (response) => {
        return response;
      }
    ));
  }
}
