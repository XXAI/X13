import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class JsonFilesService {
  url_json_to_csv = `${environment.base_url}/json-csv`;

  constructor(private http: HttpClient) { }

  convertirCSV(payload):Observable<any>{
    //return this.http.get<any>(this.url_json_to_csv, {params:payload, responseType: 'blob' as 'json'});
    return this.http.post<any>(this.url_json_to_csv, payload, {responseType: 'blob' as 'json'});
    //return this.http.post<any>(this.url_json_to_csv, payload, { reportProgress: true, observe: 'events', responseType: 'blob' as 'json' });
    //return this.httpClient.post<any>(this.SERVER_URL, formData, { reportProgress: true, observe: 'events' });
  }
}