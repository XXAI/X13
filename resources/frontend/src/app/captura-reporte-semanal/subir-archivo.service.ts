import { HttpClient, HttpHeaders, HttpBackend } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SubirArchivoService {

  private api: string
  private http: HttpClient;

  constructor( handler: HttpBackend) {
    //To ignore interceptor
    this.http = new HttpClient(handler);
    this.api = environment.base_url;
  }
  
  upload(formData:FormData): Observable<any>{  
    let token = localStorage.getItem('token');
    let headers = new HttpHeaders();
    headers.append('Content-Type','application/x-www-form-urlencoded;charset=UTF-8');
    headers.append('Access-Control-Allow-Origin','*');
    formData.append('token',token);
    
    return this.http.post(`${this.api}/subir-lista-meds-tmp`, formData, { headers:headers});
  }
}
