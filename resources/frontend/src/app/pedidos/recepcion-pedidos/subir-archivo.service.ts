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
    /*const endpoint = 'your-destination-url';
    const formData: FormData = new FormData();
    formData.append('layout', file, file.name);

    Object.keys(data).forEach( prop => {
      formData.append(prop, data[prop]);
    });*/
      
    let token = localStorage.getItem('token');
    let headers = new HttpHeaders();
    headers.append('Content-Type','application/x-www-form-urlencoded;charset=UTF-8');
        
    return this.http.post(`${this.api}/importar-entradas-excel/?token=${token}`, formData, { headers:headers});
  }
}
