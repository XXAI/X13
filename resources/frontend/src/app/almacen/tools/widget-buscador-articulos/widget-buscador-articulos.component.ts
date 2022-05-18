import { HttpClient } from '@angular/common/http';
import { Component, Injectable, Input, OnInit, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
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
  url_stock = `${environment.base_url}/almacen-buscar-stock`;

  constructor(private http: HttpClient) { }

  buscar(payload):Observable<any> {
    let url = this.url_articulos;
    if(payload.buscar_stock){
      url = this.url_stock;
    }

    return this.http.get<any>(url,{params:payload}).pipe(
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
  @Input() mostrarExistencias: boolean;
  @Input() buscarStock: boolean;
  @Input() almacenId: Number;
  @Input() programaId: Number;
  
  @Output() articuloSeleccionado = new EventEmitter<any>();

  @ViewChild('inputQuery') inputQuery: ElementRef;

  constructor( private service: Service, private sharedService: SharedService, private sanitizer: DomSanitizer ){}

  inputBuscadorArticulos = new FormControl();

  isLoadingArticulos: boolean;
  articuloQuery: string;
  resultadoArticulos: any[];
  terminoBusqueda: boolean;

  estatusBusqueda: string;

  modoBusqueda: string;
  claveModoBusqueda: string;

  requestBusqueda: any;

  ngOnInit(): void {
    this.resultadoArticulos = [];
    this.terminoBusqueda = false;
    this.estatusBusqueda = 'idle';
  }

  limpiarBusqueda(){
    this.inputBuscadorArticulos.setValue('');
    this.articuloQuery = '';
    this.resultadoArticulos = [];
    this.estatusBusqueda = 'idle';
    if(this.requestBusqueda){
      this.requestBusqueda.unsubscribe();
    }
  }

  tecleandoTermino(event){
    if(this.inputBuscadorArticulos.value !=  this.articuloQuery && this.estatusBusqueda == 'over'){
      this.resultadoArticulos = [];
      this.estatusBusqueda = 'idle';
    }else if (this.inputBuscadorArticulos.value !=  this.articuloQuery && this.estatusBusqueda == 'searching'){
      this.requestBusqueda.unsubscribe();
      this.resultadoArticulos = [];
      this.estatusBusqueda = 'idle';
    }
  }

  prepararBuscarArticulo(){
    setTimeout(() => {
      if(this.inputQuery){
      this.inputQuery.nativeElement.focus();  
      }
    }, 100);
  }

  buscarArticulo(){
    if(this.buscarStock){
      if(this.inputBuscadorArticulos.value == 'l:' || this.inputBuscadorArticulos.value == 'L:'){
        this.modoBusqueda = '[ por Lote ]';
        this.claveModoBusqueda = 'L:';
        this.inputBuscadorArticulos.setValue('');
      }
  
      if(this.inputBuscadorArticulos.value == 'cb:' || this.inputBuscadorArticulos.value == 'CB:'){
        this.modoBusqueda = '[ por Código de Barras ]';
        this.claveModoBusqueda = 'CB:';
        this.inputBuscadorArticulos.setValue('');
      }
  
      if(this.inputBuscadorArticulos.value == 'n:' || this.inputBuscadorArticulos.value == 'N:'){
        this.modoBusqueda = '';
        this.claveModoBusqueda = '';
        this.inputBuscadorArticulos.setValue('');
      }
    }
    
    if(this.inputBuscadorArticulos.value == 'pero' || this.inputBuscadorArticulos.value == 'para' || this.inputBuscadorArticulos.value == 'desde'){
      return false;
    }

    if(this.buscarStock && !this.almacenId){
      return false;
    }

    if(this.estatusBusqueda != 'searching' && this.inputBuscadorArticulos.value  && this.inputBuscadorArticulos.value.length >= 4){
      this.estatusBusqueda = 'searching';
      this.articuloQuery = this.inputBuscadorArticulos.value;

      if(this.claveModoBusqueda){
        if(this.articuloQuery.toUpperCase().includes('L:') === false && this.articuloQuery.toUpperCase().includes('CB:') === false){
          this.articuloQuery = this.claveModoBusqueda+this.articuloQuery
        }
      }

      let params:any = {query: encodeURIComponent(this.articuloQuery)};

      if(this.buscarStock){
        params.buscar_stock = true;
      }

      if(this.programaId){
        params.programa_id = this.programaId;
      }

      if(this.almacenId){
        params.almacen_id = this.almacenId;
      }

      this.requestBusqueda = this.service.buscar(params).subscribe(
        response => {
          if(response.error) {
            let errorMessage = response.error.message;
            this.sharedService.showSnackBar(errorMessage, null, 3000);
            this.estatusBusqueda = 'error';
          } else {
            let articulos_temp = [];
            //let highlight_style = 'background-color: #beed5e !important; font-style: italic !important;';
            let search_criteria = this.articuloQuery.replace(new RegExp('\\+','gi'),'|');
            let highlight_re = new RegExp(search_criteria,'gi');

            for(let i in response.data){
              let descripcion:string = response.data[i].especificaciones;
              let nombre:string = response.data[i].articulo;

              let articulo:any = {
                id: response.data[i].id,
                clave: (response.data[i].clave_cubs)?response.data[i].clave_cubs:response.data[i].clave_local,
                nombre_html: this.sanitizer.bypassSecurityTrustHtml(nombre.replace(highlight_re, (match) => `<mark>${match}</mark>`)),
                nombre: response.data[i].articulo,
                descripcion_html: this.sanitizer.bypassSecurityTrustHtml(descripcion.replace(highlight_re, (match) => `<mark>${match}</mark>`)),
                descripcion: response.data[i].especificaciones,
                partida_clave: response.data[i].clave_partida_especifica,
                partida_descripcion: response.data[i].partida_especifica,
                familia: response.data[i].familia,
                empaque_detalle: response.data[i].empaque_detalle,
                tiene_fecha_caducidad: (response.data[i].tiene_fecha_caducidad)?true:false,
                tipo_articulo: response.data[i].tipo_bien_servicio,
                tipo_formulario: response.data[i].clave_form,
                descontinuado: (response.data[i].descontinuado)?true:false,
                normativo: (response.data[i].es_normativo)?true:false,
                en_catalogo: (response.data[i].en_catalogo_unidad)?true:false,
              };

              if(this.buscarStock){
                articulo.unidad_medida = response.data[i].unidad_medida;
                articulo.puede_surtir_unidades = (response.data[i].puede_surtir_unidades)?true:false;
                articulo.surtir_en_unidades = false;
                articulo.total_lotes = response.data[i].total_lotes;
                articulo.existencias = +response.data[i].existencias;
                articulo.existencias_restantes = +response.data[i].existencias;
                articulo.existencias_empaque = +response.data[i].existencias;
                articulo.existencias_unidades = +response.data[i].existencias_unidades;
                articulo.existencias_extras = 0;
                articulo.lotes = (response.data[i].lotes)?response.data[i].lotes:[];
              }

              articulos_temp.push(articulo);
            }
            this.resultadoArticulos = articulos_temp;
            this.estatusBusqueda = 'over';
          }
        },
        errorResponse =>{
          this.estatusBusqueda = 'error';
          var errorMessage = "Ocurrió un error.";
          if(errorResponse.status == 409){
            errorMessage = errorResponse.error.error.message;
          }
          this.sharedService.showSnackBar(errorMessage, null, 3000);
        }
      );
    }
  }

  itemSeleccionado(item){
    let articulo = item;
    articulo.seleccionado = true;

    delete articulo.descripcion_html;
    delete articulo.nombre_html;

    this.inputBuscadorArticulos.reset();
    this.resultadoArticulos = [];
    this.estatusBusqueda = 'idle';

    this.articuloSeleccionado.emit(articulo);
  }

  displayTerminoFn(item: any) {
    if (item) { return item.nombre; }
  }
}

