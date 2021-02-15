import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ExistenciasService {

  

  private api: string
  private resource:string;

  constructor(private http: HttpClient) {
    this.api = environment.base_url;
    this.resource = "almacen-existencias";
   }
/*
  constructor(private http:HttpClient ) {
    this.api = environment.api;
    this.resource = "usuarios";
   }*/
  
  buscar(filter = '', sortOrder = 'asc', orderBy = '', pageNumber=0, pageSize = 3): Observable<any>{
    
    return this.http.get(`${this.api}/${this.resource}`,{
      params: new HttpParams()
        .set('filter',filter)
        .set('sortOrder',sortOrder)
        .set('orderBy',orderBy)
        .set('page', pageNumber.toString())
        .set('pageSize', pageSize.toString())
    });
  }

  buscarMovimiento(stock_id,filter = '', sortOrder = 'asc', orderBy = '', pageNumber=0, pageSize = 3): Observable<any>{
    
    return this.http.get(`${this.api}/${this.resource}/movimientos/${stock_id}`,{
      params: new HttpParams()
        .set('filter',filter)
        .set('sortOrder',sortOrder)
        .set('orderBy',orderBy)
        .set('page', pageNumber.toString())
        .set('pageSize', pageSize.toString())
    });
  }

  /*

  ver(id:Number):Observable<any>{
    return this.http.get(`${this.api}/${this.resource}/${id}`);
  }

  crear(object: any):Observable<any>{
    return this.http.post(`${this.api}/${this.resource}`,object);
  }
  
  editar(id:Number, object: any):Observable<any>{
    return this.http.put(`${this.api}/${this.resource}/${id}`,object);
  }

  borrar(id:Number):Observable<any>{
    return this.http.delete(`${this.api}/${this.resource}/${id}`);
  }*/
}
