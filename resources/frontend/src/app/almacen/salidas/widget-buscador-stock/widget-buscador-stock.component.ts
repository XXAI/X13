import { HttpClient } from '@angular/common/http';
import { Component, Injectable, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { environment } from 'src/environments/environment';
import { catchError, debounceTime, finalize, map, switchMap, tap } from 'rxjs/operators';
import { EMPTY, Observable } from 'rxjs';
import { FormControl } from '@angular/forms';
import { SharedService } from 'src/app/shared/shared.service';

@Injectable({
  providedIn: 'root'
})
export class Service {
  url_articulos = `${environment.base_url}/almacen-buscar-stock`;

  constructor(private http: HttpClient) { }

  buscar(payload):Observable<any[]> {
    return this.http.get<any>(this.url_articulos,{params:payload}).pipe(
      map( response => {
        return response;
      })
    );
  }
}

@Component({
  selector: 'widget-buscador-stock',
  templateUrl: './widget-buscador-stock.component.html',
  styleUrls: ['./widget-buscador-stock.component.css']
})
export class WidgetBuscadorStockComponent implements OnInit {
  @Input() mostrarExistencias: boolean;
  @Input() almacenId: Number;
  @Input() programaId: Number;
  
  @Output() articuloSeleccionado = new EventEmitter<any>();

  constructor( private service: Service, private sharedService: SharedService ){}

  inputBuscadorArticulos = new FormControl();

  articuloQuery: string;
  resultadoArticulos:any[];
  isLoadingArticulos:boolean;
  terminoBusqueda: boolean;
  mostrarError: boolean;

  ngOnInit(): void {
    this.resultadoArticulos = [];
    this.terminoBusqueda = false;
    this.mostrarError = false;

    this.inputBuscadorArticulos.valueChanges
    .pipe(
      tap( () => {
          this.resultadoArticulos = [];
          this.terminoBusqueda = false;
          this.mostrarError = false;
      } ),
      debounceTime(300),
      switchMap(value => {
          this.isLoadingArticulos = true; 
          if(!(typeof value === 'object')){
            if( value && value.length > 3 && this.almacenId){
              let params:any = {query: value};
              if(this.programaId){
                params.programa_id = this.programaId;
              }
              if(this.almacenId){
                params.almacen_id = this.almacenId;
              }
              let resultado = this.service.buscar(params).pipe(
                                                                finalize(() => {
                                                                  this.isLoadingArticulos = false; 
                                                                  this.terminoBusqueda = true;
                                                                } ),
                                                                catchError(error => {
                                                                  this.mostrarError = true;
                                                                  return EMPTY;
                                                                })
                                                              );
              return resultado;
            }else{
              this.terminoBusqueda = false;
              this.isLoadingArticulos = false;
              return []; 
            }
          }else{
            this.terminoBusqueda = false;
            this.isLoadingArticulos = false; 
            return [];
          }
        }
      ),
    ).subscribe(
      response => {
        if(response.error) {
          let errorMessage = response.error.message;
          this.sharedService.showSnackBar(errorMessage, null, 3000);
          this.isLoadingArticulos = false;
          this.terminoBusqueda = true;
        } else {
          let articulos_temp = [];
          for(let i in response.data){
            let stock:any = {
              id: response.data[i].id,
              clave: (response.data[i].clave_cubs)?response.data[i].clave_cubs:response.data[i].clave_local,
              nombre: response.data[i].articulo,
              descripcion: response.data[i].especificaciones,
              partida_clave: response.data[i].clave_partida_especifica,
              partida_descripcion: response.data[i].partida_especifica,
              familia: response.data[i].familia,
              tiene_fecha_caducidad: (response.data[i].tiene_fecha_caducidad)?true:false,
              puede_surtir_unidades: (response.data[i].puede_surtir_unidades)?true:false,
              surtir_en_unidades: false,
              tipo_articulo: response.data[i].tipo_bien_servicio,
              tipo_formulario: response.data[i].clave_form,
              descontinuado: (response.data[i].descontinuado)?true:false,
              normativo: (response.data[i].es_normativo)?true:false,
              en_catalogo: (response.data[i].en_catalogo_unidad)?true:false,
              total_lotes: response.data[i].total_lotes,
              existencias: +response.data[i].existencias,
              existencias_restantes: +response.data[i].existencias,
              existencias_empaque: +response.data[i].existencias,
              existencias_unidades: +response.data[i].existencias_unidades,
              existencias_extras: 0,
              lotes: (response.data[i].lotes)?response.data[i].lotes:[]
            };
            articulos_temp.push(stock);
          }
          this.resultadoArticulos = articulos_temp;
        }
      },
      errorResponse =>{
        var errorMessage = "Ocurrió un error.";
        if(errorResponse.status == 409){
          errorMessage = errorResponse.error.error.message;
        }
        this.sharedService.showSnackBar(errorMessage, null, 3000);
        this.isLoadingArticulos = false;
        this.terminoBusqueda = true;
      }
    );
  }

  itemSeleccionado(item){
    this.inputBuscadorArticulos.reset();
    console.log('Articulo Seleccionado',item);
    this.articuloSeleccionado.emit(item);
  }

  displayTerminoFn(item: any) {
    if (item) { return item.nombre; }
  }
}
