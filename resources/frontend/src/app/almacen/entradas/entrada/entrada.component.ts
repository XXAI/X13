import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AlmacenService } from '../../almacen.service';
import { EntradasService } from '../entradas.service';
import { SharedService } from '../../../shared/shared.service';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatInput } from '@angular/material/input';
import { MatDrawer } from '@angular/material/sidenav';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { ConfirmActionDialogComponent } from '../../../utils/confirm-action-dialog/confirm-action-dialog.component';

@Component({
  selector: 'app-entrada',
  templateUrl: './entrada.component.html',
  styleUrls: ['./entrada.component.css']
})
export class EntradaComponent implements OnInit {
  @ViewChild(MatPaginator) articulosPaginator: MatPaginator;
  @ViewChild(MatDrawer) articulosDrawer: MatDrawer;
  @ViewChild(MatInput) busquedaArticuloQuery: MatInput;

  constructor(
    private formBuilder: FormBuilder, 
    private almacenService: AlmacenService, 
    private entradasService: EntradasService, 
    private sharedService: SharedService, 
    private dialog: MatDialog, 
    private route: ActivatedRoute
  ) { }

  formMovimiento:FormGroup;
  catalogos:any;

  clavesTotales: any;
  clavesTotalesFiltro: any;
  clavesTotalesMovimiento: any;
  
  isLoadingArticulos:boolean;
  articuloQuery:string;
  listadoArticulos:any[];
  idArticuloSeleccionado:number;

  controlArticulosModificados:any;
  listadoArticulosEliminados:any[];

  listadoArticulosMovimiento:any[];
  filtroArticulosMovimiento:any[];
  controlArticulosAgregados:any;
  selectedItemIndex:number;

  filtroArticulos:string;
  filtroTipoArticulo:string;
  filtroAplicado:boolean;

  pageEvent: PageEvent;
  resultsLength: number = 0;
  currentPage: number = 0;
  pageSize: number = 9;
  dataSourceArticulos: MatTableDataSource<any>;

  displayedColumns: string[] = ['clave','nombre','cantidad','actions']; //'monto',

  editable: boolean;
  puedeEditarElementos: boolean;

  verBoton: any;
  isLoading: boolean;
  estatusMovimiento: string;
  listaEstatusIconos: any = { 'BOR':'content_paste',  'CON':'description', 'CAN':'cancel'  };
  listaEstatusClaves: any = { 'BOR':'borrador',       'CON':'concluido',   'CAN':'cancelado' };
  listaEstatusLabels: any = { 'BOR':'Borrador',       'CON':'Concluido',   'CAN':'Cancelado' };
  
  ngOnInit() {
    this.listadoArticulos = [];
    this.filtroArticulosMovimiento = [];
    this.controlArticulosAgregados = {};
    this.catalogos = {'programas':[]};

    this.formMovimiento = this.formBuilder.group({
      fecha_movimiento: ['',Validators.required],
      folio: [''],
      descripcion: ['',Validators.required],
      actor: ['',Validators.required],
      programa_id: [''],
      observaciones: ['']
    });

    this.verBoton = {
      generar_folio:true,
      concluir:true,
      guardar:true,
      agregar_articulos:true
    };

    this.clavesTotales = {total:0, articulos:0};
    this.clavesTotalesFiltro = {total:0, articulos:0};
    this.clavesTotalesMovimiento = {total:0, articulos:0};



    /*this.mostrarBuscadorInsumos = false;
    this.busquedaTipoInsumo = '*';
    this.filtroTipoInsumos = '*';
    this.filtroInsumos = '';
    this.listadoInsumosMovimiento = [];
    this.controlInsumosAgregados = {};
    this.listadoInsumos = [];

    this.formEntrada = this.formBuilder.group({
      fecha_movimiento:['',[Validators.required,CustomValidator.isValidDate()]],
      programa_id:[''],
      folio:[''],
      descripcion:['',Validators.required],
      actor:['',Validators.required],
      observaciones:[''],
    });

    this.cargarPaginaInsumos();

    this.catalogos = {programas:[]};

    this.totales = {
      insumos: 0,
      medicamentos: 0,
      mat_curacion: 0
    }*/
  }

  abrirBuscadorArticulos(){
    this.articuloQuery = '';
    this.articulosDrawer.open().finally(() => this.busquedaArticuloQuery.focus() );
  }

  cerrarBuscadorArticulos(){
    this.articulosDrawer.close();
    this.cleanSearch();
    this.listadoArticulos = [];
    this.idArticuloSeleccionado = 0;
  }

  cleanSearch(){
    this.articuloQuery = '';
  }

  buscarArticulos(){ 
    this.listadoArticulos = [];
    this.isLoadingArticulos = true;

    let params = {
      query: this.articuloQuery,
    }

    this.almacenService.buscarArticulosCatalogo(params).subscribe(
      response =>{
        if(response.error) {
          let errorMessage = response.error.message;
          this.sharedService.showSnackBar(errorMessage, null, 3000);
        } else {
          //this.listadoArticulos = response.data;
          let articulos_temp = [];
          for(let i in response.data){
            let articulo:any = {
              id: response.data[i].id,
              clave_cubs: response.data[i].clave_cubs,
              clave_local: response.data[i].clave_local,
              nombre: response.data[i].articulo,
              descripcion: response.data[i].especificaciones,
              descontinuado: (response.data[i].descontinuado)?true:false,
              partida_clave: response.data[i].clave_partida_especifica,
              partida_descripcion: response.data[i].partida_especifica,
              familia: response.data[i].familia,
              indispensable: (response.data[i].es_indispensable)?true:false,
              en_catalogo: (response.data[i].en_catalogo_unidad)?true:false,
            };
            articulos_temp.push(articulo);
          }
          this.listadoArticulos = articulos_temp;
        }
        this.isLoadingArticulos = false;
      },
      errorResponse =>{
        var errorMessage = "Ocurrió un error.";
        if(errorResponse.status == 409){
          errorMessage = errorResponse.error.error.message;
        }
        this.sharedService.showSnackBar(errorMessage, null, 3000);
        this.isLoadingArticulos = false;
      }
    );
  }

  generarFolio(){ console.log('generarFolio'); }
  concluirMovimiento(){ console.log('concluirMovimiento'); }
  guardarMovimiento(){ console.log('guardarMovimiento'); }
  agregarArticulo(articulo){ console.log('agregarArticulo'); }
  cargarPaginaArticulos(event?){ console.log('cargarPaginaArticulos'); return event;}
  quitarArticulo(articulo){ console.log('quitarArticulo'); }
  aplicarFiltroArticulos(){ console.log('aplicarFiltroArticulos'); }
  limpiarFiltroArticulos(){ console.log('limpiarFiltroArticulos'); }
}
