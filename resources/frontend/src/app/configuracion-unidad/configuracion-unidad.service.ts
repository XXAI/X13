import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ConfiguracionUnidadService {

  url = `${environment.base_url}/configuracion-unidad`;

  constructor(private http: HttpClient) { }

  obtenerDatosUnidad() {
    return this.http.get<any>(this.url).pipe(
      map( (response) => {
        return response;
      }
    ));
  }
}
