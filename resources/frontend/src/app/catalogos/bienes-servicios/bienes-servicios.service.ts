import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class BienesServiciosService {
  url_bienes_servicios = `${environment.base_url}/catalogos/bienes-servicios`;
  url_catalogos = `${environment.base_url}/catalogos/bienes-servicios-catalogos`;
  url_lotes = `${environment.base_url}/catalogos/bienes-servicios-lotes/`;

  constructor(private http: HttpClient) { }

  getLotes(id) {
    return this.http.get<any>(this.url_lotes+id,{}).pipe(
      map( (response: any) => {
        return response;
      }
    ));
  }

  getCatalogos():Observable<any> {
    return this.http.get<any>(this.url_catalogos,{}).pipe(
      map( response => {
        return response;
      })
    );
  }

  getListaBienesServicios(payload):Observable<any> {
    return this.http.get<any>(this.url_bienes_servicios,{params: payload}).pipe(
      map( response => {
        return response;
      })
    );
  }

  getBienServicio(id) {
    return this.http.get<any>(this.url_bienes_servicios+'/'+id,{}).pipe(
      map( (response: any) => {
        return response;
      }
    ));
  }
  
  saveBienServicio(payload) {
    return this.http.post<any>(this.url_bienes_servicios,payload).pipe(
      map( (response) => {
        return response;
      }
    ));
  }

  deleteBienServicio(id) {
    return this.http.delete<any>(this.url_bienes_servicios+'/'+id,{}).pipe(
      map( (response) => {
        return response;
      }
    ));
  }
}