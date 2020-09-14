import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PedidosService {
  url_insumos = `${environment.base_url}/insumos-medicos`;

  constructor(private http: HttpClient) { }

  buscarInsumos(payload):Observable<any> {
    return this.http.get<any>(this.url_insumos,{params:payload}).pipe(
      map( response => {
        return response;
      })
    );
  }
}
