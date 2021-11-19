import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AlmacenService } from '../../almacen.service';
import { EntradasService } from '../entradas.service';
import { SharedService } from '../../../shared/shared.service';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatInput } from '@angular/material/input';
import { MatDrawer } from '@angular/material/sidenav';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { DialogoLotesArticuloComponent } from '../dialogo-lotes-articulo/dialogo-lotes-articulo.component';
import { ConfirmActionDialogComponent } from '../../../utils/confirm-action-dialog/confirm-action-dialog.component';

@Component({
  selector: 'app-entrada',
  templateUrl: './entrada.component.html',
  styleUrls: ['./entrada.component.css']
})
export class EntradaComponent implements OnInit {
  @ViewChild(MatPaginator) articulosPaginator: MatPaginator;
  @ViewChild(MatTable) articulosTable: MatTable<any>;

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
  //filtroArticulosMovimiento:any[];
  controlArticulosAgregados:any;
  selectedItemIndex:number;

  filtroArticulos:string;
  filtroTipoArticulo:string;
  filtroAplicado:boolean;

  totalClavesRecibidas:number;
  totalArticulosRecibidos:number;

  pageEvent: PageEvent;
  resultsLength: number = 0;
  currentPage: number = 0;
  pageSize: number = 10;
  pageSizeOptions: number[] = [10, 20, 30, 50];
  dataSourceArticulos: MatTableDataSource<any>;

  displayedColumns: string[] = ['clave','nombre','no_lotes','cantidad','actions']; //'monto',

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
    this.listadoArticulosEliminados = [];
    //this.filtroArticulosMovimiento = [];
    this.controlArticulosAgregados = {};
    this.controlArticulosModificados = {};
    this.totalClavesRecibidas = 0;
    this.totalArticulosRecibidos = 0;
    this.catalogos = {'programas':[]};

    this.formMovimiento = this.formBuilder.group({
      fecha_movimiento: ['',Validators.required],
      folio: [''],
      descripcion: ['',Validators.required],
      entrega: ['',Validators.required],
      recibe: ['',Validators.required],
      programa_id: [''],
      observaciones: ['']
    });

    this.verBoton = {
      generar_folio:true,
      concluir:true,
      guardar:true,
      agregar_articulos:true
    };

    this.clavesTotales = {articulos:0};
    this.clavesTotalesFiltro = {articulos:0};
    this.clavesTotalesMovimiento = {articulos:0};

    this.route.paramMap.subscribe(params => {
      if(params.get('id')){
        console.log('Editar Entrada');
        this.cargarPaginaArticulos();
      }else{
        this.dataSourceArticulos = new MatTableDataSource<any>([]);
        this.dataSourceArticulos.paginator = this.articulosPaginator;
        this.puedeEditarElementos = true;
      }
    });
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
              //clave_cubs: response.data[i].clave_cubs,
              //clave_local: response.data[i].clave_local,
              clave: (response.data[i].clave_cubs)?response.data[i].clave_cubs:response.data[i].clave_local,
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

  agregarArticulo(articulo){ 
    let configDialog:any = {
      width: '99%',
      maxHeight: '90vh',
      height: '643px',
      panelClass: 'no-padding-dialog'
    };

    if(this.controlArticulosAgregados[articulo.id]){
      let index = this.dataSourceArticulos.data.findIndex(x => x.id === articulo.id);
      articulo = this.dataSourceArticulos.data[index];
    }
    
    configDialog.data = {articulo: articulo, editar: true};
    
    const dialogRef = this.dialog.open(DialogoLotesArticuloComponent, configDialog);

    dialogRef.afterClosed().subscribe(response => {
      if(response){
        console.log(response);
        if(response.total_piezas > 0){
          if(!this.controlArticulosAgregados[response.id]){
            this.controlArticulosAgregados[response.id] = true;
            this.controlArticulosModificados[response.id] = '+';
            this.totalClavesRecibidas++;
          }
          if(!this.controlArticulosModificados[response.id]){
            this.controlArticulosModificados[response.id] = '*';
            //this.totalClavesRecibidas++;
          }
        }else{
          this.controlArticulosAgregados[response.id] = undefined;
          this.controlArticulosModificados[response.id] = undefined;
          this.totalClavesRecibidas--;
        }

        let index = this.dataSourceArticulos.data.findIndex(x => x.id === response.id);

        if(index >= 0){
          let articulo = this.dataSourceArticulos.data[index];
          if(articulo.total_piezas > 0){
            this.totalArticulosRecibidos -= articulo.total_piezas;
          }
          this.dataSourceArticulos.data.splice(index,1);
        }
        this.totalArticulosRecibidos += response.total_piezas;
        
        this.dataSourceArticulos.data.unshift(response);
        this.articulosTable.renderRows();
        this.dataSourceArticulos.paginator = this.articulosPaginator;
        
        //this.cargarFiltroArticulos();
        //this.cargarPaginaArticulos();
      }else{
        console.log('Cancelar');
      }
    });
  }

  quitarArticulo(articulo){ 
    const dialogRef = this.dialog.open(ConfirmActionDialogComponent, {
      width: '500px',
      data:{dialogTitle:'Eliminar Articulo?',dialogMessage:'Esta seguro de eliminar este articulo?',btnColor:'warn',btnText:'Eliminar'}
    });

    dialogRef.afterClosed().subscribe(valid => {
      if(valid){
        this.controlArticulosAgregados[articulo.id] = false;
        this.totalClavesRecibidas -= 1;
        this.totalArticulosRecibidos -= articulo.total_piezas;
        
        let index = this.dataSourceArticulos.data.findIndex(x => x.id === articulo.id);

        //Guardar para papelera
        let articulo_copia = JSON.parse(JSON.stringify(this.dataSourceArticulos.data[index]));
        this.listadoArticulosEliminados.push(articulo_copia);

        this.dataSourceArticulos.data.splice(index,1);
        this.articulosTable.renderRows();
        this.dataSourceArticulos.paginator = this.articulosPaginator;
      }
    });
  }

  aplicarFiltroArticulos(event: Event){ 
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceArticulos.filter = filterValue.trim().toLowerCase();

    if(filterValue.trim().toLowerCase() == ''){
      this.filtroAplicado = false;
    }else{
      this.filtroAplicado = true;
    }
    
  }
  
  limpiarFiltroArticulos(){ 
    this.filtroArticulos = '';
    this.dataSourceArticulos.filter = '';
    this.filtroAplicado = false;
  }

  generarFolio(){ console.log('generarFolio'); }
  concluirMovimiento(){ console.log('concluirMovimiento'); }
  guardarMovimiento(){ console.log('guardarMovimiento'); }
  cargarPaginaArticulos(event?){ console.log('cargarPaginaArticulos'); return event;}
}
