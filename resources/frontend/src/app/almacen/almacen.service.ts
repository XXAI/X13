import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AlmacenService {
  private url_articulos = `${environment.base_url}/buscar-articulos`;
  private url_catalogos = `${environment.base_url}/almacen-movimientos-catalogos`;
  private url_admin_mods = `${environment.base_url}/movimientos-administrar-modificacion/`;
  private url_guardar_mods = `${environment.base_url}/guardar-modificacion/`;
  private url_historial_mods = `${environment.base_url}/historial-modificaciones/`;
  private url_conflicto_mods = `${environment.base_url}/conflicto-modificacion/`;
  private url_movimientos_stock = `${environment.base_url}/almacen-existencias/movimientos/`;

  listaIconos: any    = { 'NV':'save_as', 'BOR':'content_paste',  'FIN':'assignment_turned_in',   'CAN':'cancel',     'PERE':'pending_actions',       'SOL':'edit_notifications',        'MOD':'note_alt',                'CONF':'notification_important'};
  listaClaves: any    = { 'NV':'nuevo',   'BOR':'borrador',       'FIN':'concluido',              'CAN':'cancelado',  'PERE':'pendiente-recepcion',   'SOL':'peticion-modificacion',     'MOD':'modificacion-aprobada',   'CONF':'conflicto'};
  listaEtiquetas: any = { 'NV':'Nuevo',   'BOR':'Borrador',       'FIN':'Concluido',              'CAN':'Cancelado',  'PERE':'Pendiente de Recepción','SOL':'Petición de Modificación',  'MOD':'Modificación Activa',     'CONF':'Conflicto'};

  constructor(private http: HttpClient) { }

  buscarArticulosCatalogo(payload):Observable<any> {
    return this.http.get<any>(this.url_articulos,{params:payload}).pipe(
      map( response => {
        return response;
      })
    );
  }

  obtenerMovimientoCatalogos(payload:any = {}):Observable<any> {
    return this.http.get<any>(this.url_catalogos,{params:payload}).pipe(
      map( response => {
        return response;
      })
    );
  }

  administrarModificacion(id,payload):Observable<any> {
    return this.http.put<any>(this.url_admin_mods+id,payload).pipe(
      map( response => {
        return response;
      })
    );
  }

  guardarModificacion(id,payload):Observable<any> {
    return this.http.put<any>(this.url_guardar_mods+id,payload).pipe(
      map( response => {
        return response;
      })
    );
  }

  historialModificaciones(id):Observable<any> {
    return this.http.get<any>(this.url_historial_mods+id,{}).pipe(
      map( response => {
        return response;
      })
    );
  }

  confictoModificacion(id):Observable<any> {
    return this.http.get<any>(this.url_conflicto_mods+id,{}).pipe(
      map( response => {
        return response;
      })
    );
  }

  cargarMovimientosStock(id):Observable<any>{
    return this.http.get<any>(this.url_movimientos_stock+id,{params:{}}).pipe(
      map( response => {
        return response;
      })
    );
  }
}