import { HttpClient, HttpHeaders, HttpBackend } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ImportarService {

  private api: string
  private http: HttpClient;

  constructor( handler: HttpBackend) {
    //To ignore interceptor
    this.http = new HttpClient(handler);
    this.api = environment.base_url;
  }

  catalogos(): Observable<any>{  
    // La obtengo del controlador de existencias porque ya esta hecho   
    let token = localStorage.getItem('token');   
    let headers = new HttpHeaders();
    headers.append('Content-Type','application/json');
    headers.append('Access-Control-Allow-Origin','*');
    return this.http.get(`${this.api}/almacen-existencias/catalogos`,{params:{token: token}, headers:headers});
  }

  upload(data:any,file:File,path:string): Observable<any>{
    const endpoint = 'your-destination-url';
    const formData: FormData = new FormData();
    formData.append('layout', file, file.name);



    Object.keys(data).forEach( prop => {
      formData.append(prop, data[prop]);
    });

   // var headers = new Headers(), authtoken = localStorage.getItem('authtoken');

      /*  if (authtoken) {
            headers.append("Authorization", 'Token ' + authtoken)
        }*/

     //   headers.append("Accept", 'application/json');
      
      let token = localStorage.getItem('token');
      let headers = new HttpHeaders();
			//headers.append('Authorization', 'Bearer ' + localStorage.getItem('token'));
      headers.append('Content-Type','application/x-www-form-urlencoded;charset=UTF-8');
      headers.append('Access-Control-Allow-Origin','*');
      formData.append('token',token);
    return this.http
      .post(`${this.api}/${path}`, formData, { headers:headers});

  }
}
