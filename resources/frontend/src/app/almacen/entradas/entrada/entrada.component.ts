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
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { MatSort } from '@angular/material/sort';
import {animate, state, style, transition, trigger} from '@angular/animations';

@Component({
  selector: 'app-entrada',
  templateUrl: './entrada.component.html',
  styleUrls: ['./entrada.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class EntradaComponent implements OnInit {
  @ViewChild(MatPaginator) articulosPaginator: MatPaginator;
  @ViewChild(MatTable) articulosTable: MatTable<any>;
  @ViewChild(MatSort) sort: MatSort;

  @ViewChild(MatDrawer) entradaDrawer: MatDrawer;
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
  filtroAplicado:boolean;

  filteredProveedores: Observable<any[]>;
  filteredProgramas: Observable<any[]>;

  totalClavesRecibidas:number;
  totalArticulosRecibidos:number;

  pageEvent: PageEvent;
  resultsLength: number = 0;
  currentPage: number = 0;
  pageSize: number = 10;
  pageSizeOptions: number[] = [10, 20, 30, 50];
  dataSourceArticulos: MatTableDataSource<any>;

  displayedColumns: string[] = ['clave','nombre','no_lotes','total_piezas','total_monto','actions'];
  expandedElement: any | null;

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

    this.editable = false;
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
      'proveedores':[],
      'tipos_movimiento':[],
    };

    this.maxFechaMovimiento = new Date();
    
    this.formMovimiento = this.formBuilder.group({
      id:[''],
      tipo_movimiento_id:[''],
      fecha_movimiento: [new Date(),Validators.required], //Por default la fecha actual
      almacen_id: ['',Validators.required],
      programa: [''],
      programa_id: [''],
      pedido_folio:[''],
      //Datos de adquisición
      proveedor:[''],
      proveedor_id: [''],
      referencia_folio:[''],
      referencia_fecha:[''],
      //nombre completo 
      entrega: [''],
      recibe: [''],
      //
      observaciones: [''],
      //
      descripcion: ['',Validators.required],
      almacen_desc: [''],
      programa_desc: [''],
      proveedor_desc: [''],
    });

    this.filteredProveedores = this.formMovimiento.get('proveedor').valueChanges.pipe( startWith(''), map(value => typeof value === 'string' ? value : value.nombre),
                                  map(nombre => nombre ? this._filter('proveedores',nombre) : this.catalogos['proveedores'].slice())
                                );
    this.filteredProgramas = this.formMovimiento.get('programa').valueChanges.pipe( startWith(''), map(value => typeof value === 'string' ? value : value.descripcion),
                                map(descripcion => descripcion ? this._filter('programas',descripcion) : this.catalogos['programas'].slice())
                              );

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
          this.catalogos['almacenes'] = response.data.almacenes;
          this.catalogos['programas'] = response.data.programas;
          this.catalogos['proveedores'] = response.data.proveedores;
          this.catalogos['tipos_movimiento'] = response.data.tipos_movimiento;

          if(this.catalogos['almacenes'].length == 1){
            this.formMovimiento.get('almacen_id').patchValue(this.catalogos['almacenes'][0].id);
          }
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
              response.data.fecha_movimiento = new Date(response.data.fecha_movimiento+'T12:00:00');
              this.formMovimiento.patchValue(response.data);

              if(response.data.estatus == 'ME-BR'){
                this.estatusMovimiento = 'BOR';
                this.editable = true;
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

              if(this.estatusMovimiento != 'BOR'){
                this.formMovimiento.get('programa_desc').patchValue((response.data.programa)?response.data.programa.descripcion:'Sin Programa');
                this.formMovimiento.get('proveedor_desc').patchValue((response.data.proveedor)?response.data.proveedor.nombre:'Sin Proveedor');
                this.formMovimiento.get('almacen_desc').patchValue((response.data.almacen)?response.data.almacen.nombre:'Sin Almacén');
              }

              let articulos_temp = [];
              let lista_articulos;

              if(this.estatusMovimiento == 'BOR'){
                lista_articulos = response.data.lista_articulos_borrador;
              }else{
                lista_articulos = response.data.lista_articulos;
              }

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
                    lote:             (lista_articulos[i].stock)?lista_articulos[i].stock.lote:lista_articulos[i].lote,
                    cantidad:         lista_articulos[i].cantidad,
                    fecha_caducidad:  (lista_articulos[i].stock)?lista_articulos[i].stock.fecha_caducidad:lista_articulos[i].fecha_caducidad,
                    codigo_barras:    (lista_articulos[i].stock)?lista_articulos[i].stock.codigo_barras:lista_articulos[i].codigo_barras,
                  }];
                  
                  articulo.no_lotes = 1;
                  articulo.total_piezas = lista_articulos[i].cantidad;
                  articulos_temp.push(articulo);

                  this.controlArticulosAgregados[articulo.id] = true;
                  this.totalClavesRecibidas += 1;
                }else{
                  let index = articulos_temp.findIndex(x => x.id == lista_articulos[i].articulo.id);
                  let articulo:any = articulos_temp[index];

                  articulo.lotes.push({
                    lote:             (lista_articulos[i].stock)?lista_articulos[i].stock.lote:lista_articulos[i].lote,
                    cantidad:         lista_articulos[i].cantidad,
                    fecha_caducidad:  (lista_articulos[i].stock)?lista_articulos[i].stock.fecha_caducidad:lista_articulos[i].fecha_caducidad,
                    codigo_barras:    (lista_articulos[i].stock)?lista_articulos[i].stock.codigo_barras:lista_articulos[i].codigo_barras,
                  });
                  
                  articulo.no_lotes += 1;
                  articulo.total_piezas += lista_articulos[i].cantidad;
                }
                this.totalArticulosRecibidos += lista_articulos[i].cantidad;
              }

              this.dataSourceArticulos = new MatTableDataSource<any>(articulos_temp);
              this.dataSourceArticulos.paginator = this.articulosPaginator;
              this.dataSourceArticulos.sort = this.sort;
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
        this.dataSourceArticulos.sort = this.sort;
        this.editable = true;
        this.puedeEditarElementos = true;
        this.verBoton = {
          concluir:true,
          guardar:true,
          agregar_articulos:true
        };
      }
    });
  }

  abrirDrawer(){
    this.entradaDrawer.open();//.finally(() => this.busquedaArticuloQuery.focus() );
  }

  cerrarDrawer(){
    this.entradaDrawer.close();
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
    
    configDialog.data = {articulo: articulo, editar: this.puedeEditarElementos};
    
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
        this.dataSourceArticulos.sort = this.sort;
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
        this.dataSourceArticulos.sort = this.sort;
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
              this.editable = false;
              this.puedeEditarElementos = false;
                this.verBoton = {
                  concluir:false,
                  guardar:false,
                  agregar_articulos:false
                };
            }
            this.controlArticulosModificados = {};
            this.sharedService.showSnackBar('Datos almacenados con éxito', null, 3000);
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

  getDisplayFn(label: string){
    return (val) => this.displayFn(val,label);
  }

  displayFn(value: any, valueLabel: string){
    return value ? value[valueLabel] : '';
  }

  private _filter(catalogo: string, nombre: string): any[] {
    const filterValue = nombre.toLowerCase();

    return this.catalogos[catalogo].filter(option => option.nombre.toLowerCase().includes(filterValue));
  }
}
