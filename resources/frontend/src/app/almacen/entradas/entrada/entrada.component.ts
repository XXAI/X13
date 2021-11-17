import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
//import { AlmacenService } from '../../almacen.service';
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
    //private almacenService: AlmacenService, 
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

  generarFolio(){}
  concluirMovimiento(){}
  guardarMovimiento(){}
  agregarArticulo(articulo){}
  cerrarBuscadorArticulos(){}
  cargarPaginaArticulos(event?){return event;}
  quitarArticulo(articulo){}
  buscarArticulos(){}
  aplicarFiltroArticulos(){}
  limpiarFiltroArticulos(){}
  abrirBuscadorArticulos(){}
  cleanSearch(){}

}
