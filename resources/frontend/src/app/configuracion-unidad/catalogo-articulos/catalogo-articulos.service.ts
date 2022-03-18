import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})

export class CatalogoArticulosService {

  url = `${environment.base_url}/configuracion-unidad/catalogo-articulos`;
  url_catalogos = `${environment.base_url}/configuracion-unidad/catalogo-articulos-catalogos`;
  url_cerrar_captura = `${environment.base_url}/configuracion-unidad/catalogo-articulos-cerrar-captura/`;
  url_exportar_excel = `${environment.base_url}/configuracion-unidad/catalogo-articulos-exportar-excel/`;
  
  constructor(private http: HttpClient) { }

  getCatalogos():Observable<any> {
    return this.http.get<any>(this.url_catalogos).pipe(
      map( response => {
        return response;
      })
    );
  }

  cerrarCaptura(id) {
    return this.http.get<any>(this.url_cerrar_captura+id,{}).pipe(
      map( (response: any) => {
        return response;
      }
    ));
  }

  getListaArticulos(payload):Observable<any> {
    return this.http.get<any>(this.url,{params: payload}).pipe(
      map( response => {
        return response;
      })
    );
  }

  getArticulo(id) {
    return this.http.get<any>(this.url+'/'+id,{}).pipe(
      map( (response: any) => {
        return response;
      }
    ));
  }

  updateArticulo(id,payload) {
    return this.http.put<any>(this.url+'/'+id,payload).pipe(
      map( (response) => {
        return response;
      }
    ));
  }

  saveArticulo(payload) {
    return this.http.post<any>(this.url,payload).pipe(
      map( (response) => {
        return response;
      }
    ));
  }

  deleteArticulo(id,payload:any={}) {
    return this.http.delete<any>(this.url+'/'+id,{params: payload}).pipe(
      map( (response) => {
        return response;
      }
    ));
  }

  exportarReporte(id,payload:any={}):Observable<any>{
    return this.http.get<any>(this.url_exportar_excel+id, {params:{payload}, responseType: 'blob' as 'json'});
  }
}

