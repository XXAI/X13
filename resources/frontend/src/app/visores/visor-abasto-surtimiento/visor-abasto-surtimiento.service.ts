import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class VisorAbastoSurtimientoService {
  url_datos_visor = `${environment.base_url}/visor-abasto-surtimiento/datos-visor`;
  url_datos_excel = `${environment.base_url}/visor-abasto-surtimiento/datos-visor-excel`;

  constructor(private http: HttpClient) { }

  obtenerDatosVisor(payload:any={}):Observable<any> {
    return this.http.get<any>(this.url_datos_visor,{params:payload}).pipe(
      map( response => {
        return response;
      })
    );
  }

  exportarExcel(payload:any={}):Observable<any> {
    return this.http.get<any>(this.url_datos_excel, {params:payload, responseType: 'blob' as 'json'});
  }
}