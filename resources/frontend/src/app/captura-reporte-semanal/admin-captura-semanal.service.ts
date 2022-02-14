import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})

export class AdminCapturaSemanalService {
  url_semanas = `${environment.base_url}/config-cap-abasto-surtimiento`;
  url_lista_unidades = `${environment.base_url}/config-lista-unidades-catalogos`;
  url_config_lista_unidades = `${environment.base_url}/config-lista-unidades-catalogos-editar`;
  url_recalcular_porcentajes = `${environment.base_url}/config-cap-abasto-surtimiento-recalcular`;
  
  constructor(private http: HttpClient) { }

  obtenerListaSemanas(payload):Observable<any> {
    return this.http.get<any>(this.url_semanas,{params: payload}).pipe(
      map( response => {
        return response;
      })
    );
  }

  obtenerListaUnidades():Observable<any> {
    return this.http.get<any>(this.url_lista_unidades).pipe(
      map( response => {
        return response;
      })
    );
  }

  configListaUnidades(payload) {
    return this.http.post<any>(this.url_config_lista_unidades,payload).pipe(
      map( (response) => {
        return response;
      }
    ));
  }

  recalcularPorcentajes(id){
    return this.http.put<any>(this.url_recalcular_porcentajes+'/'+id,{}).pipe(
      map( (response) => {
        return response;
      }
    ));
  }

  borrarSemana(id,payload:any={}){
    return this.http.delete<any>(this.url_semanas+'/'+id,{params:payload}).pipe(
      map( (response: any) => {
        return response;
      }
    ));
  }

  actualizarSemana(payload,id) {
    return this.http.put<any>(this.url_semanas+'/'+id,payload).pipe(
      map( (response) => {
        return response;
      }
    ));
  }

  crearSemana(payload) {
    return this.http.post<any>(this.url_semanas,payload).pipe(
      map( (response) => {
        return response;
      }
    ));
  }
}
