import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PedidosOrdinariosService {
  url_pedidos = `${environment.base_url}/pedido-ordinario`;

  constructor(private http: HttpClient) { }

  obtenerListaPedidos(payload):Observable<any> {
    return this.http.get<any>(this.url_pedidos,{params: payload}).pipe(
      map( response => {
        return response;
      })
    );
  }

  verPedido(id) {
    return this.http.get<any>(this.url_pedidos+'/'+id,{}).pipe(
      map( (response: any) => {        
        return response;
      }
    ));
  }

  borrarPedido(id){
    return this.http.delete<any>(this.url_pedidos+'/'+id,{}).pipe(
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

  crearPedido(payload) {
    return this.http.post<any>(this.url_pedidos,payload).pipe(
      map( (response) => {
        return response;
      }
    ));
  }
}
