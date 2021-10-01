import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})

export class CapturaReporteSemanalService {
  url_registros = `${environment.base_url}/cap-reporte-abasto-surtimiento`;
  url_data = `${environment.base_url}/get-data-cap-reporte-as`;
  url_export_reporter =  `${environment.base_url}/excel-admin-reporte-abasto`;

  constructor(private http: HttpClient) { }

  exportarAdminExcel(payload:any={}):Observable<any>{
    return this.http.get<any>(this.url_export_reporter, {params:payload, responseType: 'blob' as 'json'});
  }

  obtenerDatosUsuario():Observable<any> {
    return this.http.get<any>(this.url_data,{}).pipe(
      map( response => {
        return response;
      })
    );
  }

  obtenerListaRegistros(payload):Observable<any> {
    return this.http.get<any>(this.url_registros,{params: payload}).pipe(
      map( response => {
        return response;
      })
    );
  }

  verRegistro(id) {
    return this.http.get<any>(this.url_registros+'/'+id,{}).pipe(
      map( (response: any) => {        
        return response;
      }
    ));
  }

  borrarRegistro(id){
    return this.http.delete<any>(this.url_registros+'/'+id,{}).pipe(
      map( (response: any) => {
        return response;
      }
    ));
  }

  actualizarRegistro(payload,id) {
    return this.http.put<any>(this.url_registros+'/'+id,payload).pipe(
      map( (response) => {
        return response;
      }
    ));
  }

  crearRegistro(payload) {
    return this.http.post<any>(this.url_registros,payload).pipe(
      map( (response) => {
        return response;
      }
    ));
  }
}
