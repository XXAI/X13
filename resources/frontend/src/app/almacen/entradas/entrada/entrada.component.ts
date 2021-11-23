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
import { DatePipe } from '@angular/common';

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
    private datepipe: DatePipe,
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
  isSaving: boolean;
  estatusMovimiento: string;
  listaEstatusIconos: any = { 'NV':'save_as', 'BOR':'content_paste',  'CON':'description', 'CAN':'cancel'  };
  listaEstatusClaves: any = { 'NV':'nuevo',   'BOR':'borrador',       'CON':'concluido',   'CAN':'cancelado' };
  listaEstatusLabels: any = { 'NV':'Nuevo',   'BOR':'Borrador',       'CON':'Concluido',   'CAN':'Cancelado' };
  maxFechaMovimiento: Date;
  
  ngOnInit() {
    this.isLoading = true;

    this.puedeEditarElementos = false;
    this.listadoArticulos = [];
    this.listadoArticulosEliminados = [];
    this.controlArticulosAgregados = {};
    this.controlArticulosModificados = {};
    this.totalClavesRecibidas = 0;
    this.totalArticulosRecibidos = 0;

    this.catalogos = {
      'almacenes':[],
      'programas':[],
    };

    this.maxFechaMovimiento = new Date();
    
    this.formMovimiento = this.formBuilder.group({
      id:[''],
      fecha_movimiento: [new Date(),Validators.required],
      folio: [''],
      descripcion: ['',Validators.required],
      entrega: ['',Validators.required],
      recibe: ['',Validators.required],
      programa_id: [''],
      almacen_id: ['',Validators.required],
      observaciones: ['']
    });

    this.verBoton = {
      concluir:false,
      guardar:false,
      agregar_articulos:false
    };

    this.clavesTotales = {articulos:0};
    this.clavesTotalesFiltro = {articulos:0};
    this.clavesTotalesMovimiento = {articulos:0};

    this.almacenService.obtenerMovimientoCatalogos().subscribe(
      response =>{
        if(response.error) {
          let errorMessage = response.error.message;
          this.sharedService.showSnackBar(errorMessage, null, 3000);
        } else {
          if(response.data.almacenes.length == 1){
            this.formMovimiento.get('almacen_id').patchValue(response.data.almacenes[0].id);
          }
          this.catalogos['almacenes'] = response.data.almacenes;
          this.catalogos['programas'] = response.data.programas;
        }
        this.isLoading = false;
      },
      errorResponse =>{
        var errorMessage = "Ocurrió un error.";
        if(errorResponse.status == 409){
          errorMessage = errorResponse.error.error.message;
        }
        this.sharedService.showSnackBar(errorMessage, null, 3000);
        this.isLoading = false;
      }
    );

    this.route.paramMap.subscribe(params => {
      if(params.get('id')){
        this.entradasService.verEntrada(params.get('id')).subscribe(
          response =>{
            if(response.error) {
              let errorMessage = response.error.message;
              this.sharedService.showSnackBar(errorMessage, null, 3000);
            } else {
              this.formMovimiento.patchValue(response.data);

              if(response.data.estatus == 'ME-BR'){
                this.estatusMovimiento = 'BOR';
                this.puedeEditarElementos = true;
                this.verBoton = {
                  concluir:true,
                  guardar:true,
                  agregar_articulos:true
                };
              }else if(response.data.estatus == 'ME-FI'){
                this.estatusMovimiento = 'CON';
              }else if(response.data.estatus == 'ME-CA'){
                this.estatusMovimiento = 'CAN';
              }

              let articulos_temp = [];
              let lista_articulos = response.data.lista_articulos_borrador;
              for(let i in lista_articulos){
                if(!this.controlArticulosAgregados[lista_articulos[i].articulo.id]){
                  let articulo:any = {
                    id: lista_articulos[i].articulo.id,
                    clave: (lista_articulos[i].articulo.clave_cubs)?lista_articulos[i].articulo.clave_cubs:lista_articulos[i].articulo.clave_local,
                    nombre: lista_articulos[i].articulo.articulo,
                    descripcion: lista_articulos[i].articulo.especificaciones,
                    descontinuado: (lista_articulos[i].articulo.descontinuado)?true:false,
                    partida_clave: lista_articulos[i].articulo.clave_partida_especifica,
                    partida_descripcion: lista_articulos[i].articulo.partida_especifica,
                    familia: lista_articulos[i].articulo.familia,
                    indispensable: (lista_articulos[i].articulo.es_indispensable)?true:false,
                    en_catalogo: (lista_articulos[i].articulo.en_catalogo_unidad)?true:false,
                  };

                  articulo.lotes = [{
                    lote:lista_articulos[i].lote,
                    cantidad:lista_articulos[i].cantidad,
                    fecha_caducidad:lista_articulos[i].fecha_caducidad,
                    codigo_barras:lista_articulos[i].codigo_barras,
                  }];

                  articulo.total_piezas = lista_articulos[i].cantidad;
                  articulos_temp.push(articulo);

                  this.controlArticulosAgregados[articulo.id] = true;
                  this.totalClavesRecibidas += 1;
                }else{
                  let index = articulos_temp.findIndex(x => x.id == lista_articulos[i].articulo.id);
                  let articulo:any = articulos_temp[index];

                  articulo.lotes.push({
                    lote:lista_articulos[i].lote,
                    cantidad:lista_articulos[i].cantidad,
                    fecha_caducidad:lista_articulos[i].fecha_caducidad,
                    codigo_barras:lista_articulos[i].codigo_barras,
                  });

                  articulo.total_piezas += lista_articulos[i].cantidad;
                }
                this.totalArticulosRecibidos += lista_articulos[i].cantidad;
              }

              this.dataSourceArticulos = new MatTableDataSource<any>(articulos_temp);
              this.dataSourceArticulos.paginator = this.articulosPaginator;
            }
            this.isLoading = false;
          },
          errorResponse =>{
            var errorMessage = "Ocurrió un error.";
            if(errorResponse.status == 409){
              errorMessage = errorResponse.error.error.message;
            }
            this.sharedService.showSnackBar(errorMessage, null, 3000);
            this.isLoading = false;
          }
        );
      }else{
        this.estatusMovimiento = 'NV';
        this.dataSourceArticulos = new MatTableDataSource<any>([]);
        this.dataSourceArticulos.paginator = this.articulosPaginator;
        this.puedeEditarElementos = true;
        this.verBoton = {
          concluir:true,
          guardar:true,
          agregar_articulos:true
        };
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

  concluirMovimiento(){
    const dialogRef = this.dialog.open(ConfirmActionDialogComponent, {
      width: '500px',
      data:{dialogTitle:'Concluir Movimiento?',dialogMessage:'Esta seguro de concluir esta entrada? escriba CONCLUIR para confirmar la acción',validationString:'CONCLUIR',btnColor:'primary',btnText:'Concluir'}
    });

    dialogRef.afterClosed().subscribe(valid => {
      if(valid){
        this.guardarMovimiento(true);
      }
    });
  }

  guardarMovimiento(concluir:boolean = false){
    if(this.formMovimiento.valid){
      this.isSaving = true;
      let formData:any = this.formMovimiento.value;
      formData.lista_articulos = this.dataSourceArticulos.data;
      formData.concluir = concluir;

      formData.fecha_movimiento = this.datepipe.transform(formData.fecha_movimiento, 'yyyy-MM-dd');

      this.entradasService.guardarEntrada(formData).subscribe(
        response =>{
          if(response.error) {
            let errorMessage = response.error.message;
            this.sharedService.showSnackBar(errorMessage, null, 3000);
          }else{
            this.formMovimiento.get('id').patchValue(response.data.id);
            if(response.data.estatus == 'ME-BR'){ //Borrador
              this.estatusMovimiento = 'BOR';
            }else if(response.data.estatus == 'ME-FI'){ //Finalizado
              this.estatusMovimiento = 'CON';
            }else if(response.data.estatus == 'ME-CA'){ //Cancelado
              this.estatusMovimiento = 'CAN';
            }

            if(this.estatusMovimiento != 'BOR'){
              this.puedeEditarElementos = false;
                this.verBoton = {
                  concluir:false,
                  guardar:false,
                  agregar_articulos:false
                };
            }
            console.log(response);
          }
          this.isSaving = false;
        },
        errorResponse =>{
          var errorMessage = "Ocurrió un error.";
          if(errorResponse.status == 409){
            errorMessage = errorResponse.error.error.message;
          }
          this.sharedService.showSnackBar(errorMessage, null, 3000);
          this.isSaving = false;
        }
      );
    }
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
  cargarPaginaArticulos(event?){ console.log('cargarPaginaArticulos'); return event;}
}
