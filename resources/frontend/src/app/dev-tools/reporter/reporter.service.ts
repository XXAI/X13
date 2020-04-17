import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ReporterService {

  url_execute_reporter = `${environment.base_url}/ejecutar-query`;
  url_export_reporter =  `${environment.base_url}/exportar-query`;

  constructor(private http: HttpClient) { }

  ejecutarReporte(payload):Observable<any>{
    return this.http.get<any>(this.url_execute_reporter,{params:payload}).pipe(
      map( response => {
        return response;
      })
    );
  }

  exportarReporte(payload):Observable<any>{
    return this.http.get<any>(this.url_export_reporter, {params:payload, responseType: 'blob' as 'json'});
  }
}
