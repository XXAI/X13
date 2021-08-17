import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})

export class EstatusAvanceRecepcionService {
  url_estatus = `${environment.base_url}/estatus-avance-recepcion`;
  url_estatus_cats = `${environment.base_url}/estatus-avance-recepcion-catalogos`;
  url_subir_archivo = `${environment.base_url}/importar-entradas-excel`;

  constructor(private http: HttpClient) { }

  obtenerDatosCatalogo(payload):Observable<any> {
    return this.http.get<any>(this.url_estatus_cats,{params:payload}).pipe(
      map( response => {
        return response;
      })
    );
  }

  obtenerListaPedidos(payload):Observable<any> {
    return this.http.get<any>(this.url_estatus,{params: payload}).pipe(
      map( response => {
        return response;
      })
    );
  }

  verPedido(id) {
    return this.http.get<any>(this.url_estatus+'/'+id,{}).pipe(
      map( (response: any) => {        
        return response;
      }
    ));
  }

  subirArchivo(formData){
    return this.http.post<any>(this.url_subir_archivo,formData).pipe(
      map( (response) => {
        return response;
      }
    ));
  }
}

