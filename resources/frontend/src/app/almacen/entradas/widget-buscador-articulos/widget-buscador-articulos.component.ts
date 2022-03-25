import { HttpClient } from '@angular/common/http';
import { Component, Injectable, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { environment } from 'src/environments/environment';
import { debounceTime, finalize, map, switchMap, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { FormControl } from '@angular/forms';
import { SharedService } from 'src/app/shared/shared.service';
import { DomSanitizer } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class Service {
  url_articulos = `${environment.base_url}/buscar-articulos`;

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
  selector: 'widget-buscador-articulos',
  templateUrl: './widget-buscador-articulos.component.html',
  styleUrls: ['./widget-buscador-articulos.component.css']
})
export class WidgetBuscadorArticulosComponent implements OnInit {
  @Input() mostrarExistencias: boolean ;
  
  @Output() articuloSeleccionado = new EventEmitter<any>();

  constructor( private service: Service, private sharedService: SharedService, private sanitizer: DomSanitizer ){}

  inputBuscadorArticulos = new FormControl();

  isLoadingArticulos:boolean;
  articuloQuery: string;
  resultadoArticulos:any[];
  terminoBusqueda: boolean;

  ngOnInit(): void {
    this.resultadoArticulos = [];
    this.terminoBusqueda = false;

    this.inputBuscadorArticulos.valueChanges
    .pipe(
      tap( () => {
          this.resultadoArticulos = [];
          this.terminoBusqueda = false;
      } ),
      debounceTime(300),
      switchMap(value => {
          this.isLoadingArticulos = true; 
          if(!(typeof value === 'object')){
            if( value && value.length > 3 ){
              let resultado = this.service.buscar({query: value}).pipe(finalize(() => {this.isLoadingArticulos = false; this.terminoBusqueda = true;} ));
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
        } else {
          let articulos_temp = [];
          //let highlight_style = 'background-color: #beed5e !important; font-style: italic !important;';
          let highlight_re = new RegExp(this.inputBuscadorArticulos.value,'gi');

          for(let i in response.data){
            let descripcion:string = response.data[i].especificaciones;
            let articulo:any = {
              id: response.data[i].id,
              clave: (response.data[i].clave_cubs)?response.data[i].clave_cubs:response.data[i].clave_local,
              nombre: response.data[i].articulo,
              descripcion_html: this.sanitizer.bypassSecurityTrustHtml(descripcion.replace(highlight_re, (match) => `<mark>${match}</mark>`)),
              descripcion: response.data[i].especificaciones,
              partida_clave: response.data[i].clave_partida_especifica,
              partida_descripcion: response.data[i].partida_especifica,
              familia: response.data[i].familia,
              tiene_fecha_caducidad: (response.data[i].tiene_fecha_caducidad)?true:false,
              tipo_articulo: response.data[i].tipo_bien_servicio,
              tipo_formulario: response.data[i].clave_form,
              descontinuado: (response.data[i].descontinuado)?true:false,
              normativo: (response.data[i].es_normativo)?true:false,
              en_catalogo: (response.data[i].en_catalogo_unidad)?true:false,
            };
            articulos_temp.push(articulo);
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
      }
    );
  }

  itemSeleccionado(item){
    let articulo = item;
    this.inputBuscadorArticulos.reset();
    this.articuloSeleccionado.emit(articulo);
  }

  displayTerminoFn(item: any) {
    if (item) { return item.nombre; }
  }
}
