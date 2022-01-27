import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class SalidasService {
  url_salidas = `${environment.base_url}/almacen-salidas`;
  url_cancelar = `${environment.base_url}/almacen-salidas-cancelar/`;

  constructor(private http: HttpClient) { }

  getListadoSalidas(payload):Observable<any> {
    return this.http.get<any>(this.url_salidas,{params:payload}).pipe(
      map( response => {
        return response;
      })
    );
  }

  verSalida(id):Observable<any>{
    return this.http.get<any>(this.url_salidas+'/'+id).pipe(
      map( response => {
        return response;
      })
    );
  }

  guardarSalida(datos):Observable<any>{
    return this.http.post<any>(this.url_salidas,datos).pipe(
      map( (response) => {
        return response;
      }
    ));
  }

  eliminarSalida(id):Observable<any>{
    return this.http.delete<any>(this.url_salidas+'/'+id).pipe(
      map( response => {
        return response;
      })
    );
  }

  cancelarSalida(id):Observable<any>{
    return this.http.put<any>(this.url_cancelar+id,{}).pipe(
      map( response => {
        return response;
      })
    );
  }
}
