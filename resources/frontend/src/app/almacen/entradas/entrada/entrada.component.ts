import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlmacenService } from '../../almacen.service';
import { EntradasService } from '../entradas.service';
import { SharedService } from '../../../shared/shared.service';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatDrawer } from '@angular/material/sidenav';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmActionDialogComponent } from '../../../utils/confirm-action-dialog/confirm-action-dialog.component';
import { DatePipe } from '@angular/common';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { MatSort } from '@angular/material/sort';
import {animate, state, style, transition, trigger} from '@angular/animations';
import { ReportWorker } from 'src/app/web-workers/report-worker';
import * as FileSaver from 'file-saver';
import { DialogoCancelarResultadoComponent } from '../dialogo-cancelar-resultado/dialogo-cancelar-resultado.component';

@Component({
  selector: 'app-entrada',
  templateUrl: './entrada.component.html',
  styleUrls: ['./entrada.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed, void', style({ height: '0px' })), 
      state('expanded', style({ height: '*' })), 
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')), 
      transition('expanded <=> void', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)'))
    ]),
  ],
})
export class EntradaComponent implements OnInit {
  @ViewChild(MatPaginator) articulosPaginator: MatPaginator;
  @ViewChild(MatTable) articulosTable: MatTable<any>;
  @ViewChild(MatSort) sort: MatSort;

  @ViewChild(MatDrawer) entradaDrawer: MatDrawer;
  
  constructor(
    private datepipe: DatePipe,
    private formBuilder: FormBuilder, 
    private almacenService: AlmacenService, 
    private entradasService: EntradasService, 
    private sharedService: SharedService, 
    private dialog: MatDialog, 
    private route: ActivatedRoute,
    private router: Router
  ) { }

  formMovimiento:FormGroup;
  catalogos:any;

  idArticuloSeleccionado:number;

  controlArticulosAgregados:any;
  controlArticulosModificados:any;
  listadoArticulosEliminados:any[];

  filtroArticulos:string;
  filtroAplicado:boolean;

  filteredProveedores: Observable<any[]>;
  filteredProgramas: Observable<any[]>;

  totalesRecibidos: any;

  pageEvent: PageEvent;
  resultsLength: number = 0;
  currentPage: number = 0;
  pageSize: number = 10;
  pageSizeOptions: number[] = [10, 20, 30, 50];
  dataSourceArticulos: MatTableDataSource<any>;

  displayedColumns: string[] = ['estatus','clave','nombre','no_lotes','total_piezas','total_monto','actions'];
  
  editable: boolean;
  puedeEditarElementos: boolean;

  verBoton: any;
  isLoading: boolean;
  isSaving: boolean;
  estatusMovimiento: string;
  maxFechaMovimiento: Date;

  listaEstatusIconos: any = { 'NV':'save_as', 'BOR':'content_paste',  'FIN':'description', 'CAN':'cancel'  };
  listaEstatusClaves: any = { 'NV':'nuevo',   'BOR':'borrador',       'FIN':'concluido',   'CAN':'cancelado' };
  listaEstatusLabels: any = { 'NV':'Nuevo',   'BOR':'Borrador',       'FIN':'Concluido',   'CAN':'Cancelado' };
  
  estatusArticulosColores = {1:'verde', 2:'ambar', 3:'rojo'};
  estatusArticulosIconos = {1:'check_circle_outline', 2:'notification_important', 3:'warning'};
  
  ngOnInit() {
    this.isLoading = true;

    this.editable = false;
    this.puedeEditarElementos = false;
    this.listadoArticulosEliminados = [];
    this.controlArticulosAgregados = {};
    this.controlArticulosModificados = {};

    this.totalesRecibidos = {
      claves: 0,
      lotes: 0,
      articulos: 0,
      monto: parseFloat('0'),
      por_caducar: {
        claves: 0,
        lotes: 0,
        articulos: 0,
        monto: parseFloat('0'),
      },
      caducados:{
        claves: 0,
        lotes: 0,
        articulos: 0,
        monto: parseFloat('0'),
      }
    }
    
    this.catalogos = {
      'almacenes':[],
      'programas':[],
      'proveedores':[],
      'tipos_movimiento':[],
      'marcas':[],
    };

    this.maxFechaMovimiento = new Date();
    
    this.formMovimiento = this.formBuilder.group({
      id:[''],
      tipo_movimiento_id:['',Validators.required],
      fecha_movimiento: [new Date(),Validators.required], //Por default la fecha actual
      almacen_id: ['',Validators.required],
      documento_folio:[''],
      programa: [''],
      programa_id: [''],
      proveedor:[''],
      proveedor_id: [''],
      referencia_folio:[''],
      referencia_fecha:[''],
      observaciones: [''],
    });

    this.verBoton = {
      concluir:false,
      guardar:false,
      agregar_articulos:false
    };

    let lista_catalogos:any = {almacenes:'*',programas:'*',proveedores:'*',marcas:'*',tipos_movimiento:'movimiento.ENT'};

    this.almacenService.obtenerMovimientoCatalogos(lista_catalogos).subscribe(
      response =>{
        if(response.error) {
          let errorMessage = response.error.message;
          this.sharedService.showSnackBar(errorMessage, null, 3000);
        } else {
          this.catalogos['almacenes'] = response.data.almacenes;
          this.catalogos['programas'] = response.data.programas;
          this.catalogos['proveedores'] = response.data.proveedores;
          this.catalogos['tipos_movimiento'] = response.data.tipos_movimiento;
          this.catalogos['marcas'] = response.data.marcas;

          if(this.catalogos['almacenes'].length == 1){
            this.formMovimiento.get('almacen_id').patchValue(this.catalogos['almacenes'][0].id);
          }

          this.filteredProveedores = this.formMovimiento.get('proveedor').valueChanges.pipe( startWith(''), map(value => typeof value === 'string' ? value : (value)?value.nombre:''),
                                  map(nombre => nombre ? this._filter('proveedores',nombre,'nombre') : this.catalogos['proveedores'].slice())
                                );
          this.filteredProgramas = this.formMovimiento.get('programa').valueChanges.pipe( startWith(''), map(value => typeof value === 'string' ? value : (value)?value.descripcion:''),
                                map(descripcion => descripcion ? this._filter('programas',descripcion,'descripcion') : this.catalogos['programas'].slice())
                              );
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
              if(response.data.referencia_fecha){
                response.data.referencia_fecha = new Date(response.data.referencia_fecha+'T12:00:00');
              }
              this.formMovimiento.patchValue(response.data);

              if(response.data.estatus == 'BOR'){
                this.estatusMovimiento = 'BOR';
                this.editable = true;
                this.puedeEditarElementos = true;
                this.verBoton = {
                  concluir:true,
                  guardar:true,
                  agregar_articulos:true
                };
              }else if(response.data.estatus == 'FIN'){
                this.estatusMovimiento = 'FIN';
              }else if(response.data.estatus == 'CAN'){
                this.estatusMovimiento = 'CAN';
              }

              let articulos_temp = [];
              let lista_articulos;

              if(this.estatusMovimiento == 'BOR'){
                lista_articulos = response.data.lista_articulos_borrador;
              }else{
                lista_articulos = response.data.lista_articulos;
              }

              for(let i in lista_articulos){
                lista_articulos[i].total_monto = parseFloat(lista_articulos[i].total_monto||0);
                let articulo:any;

                if(!this.controlArticulosAgregados[lista_articulos[i].articulo.id]){
                  articulo = {
                    id: lista_articulos[i].articulo.id,
                    estatus: 1,
                    clave: (lista_articulos[i].articulo.clave_cubs)?lista_articulos[i].articulo.clave_cubs:lista_articulos[i].articulo.clave_local,
                    nombre: lista_articulos[i].articulo.articulo,
                    descripcion: lista_articulos[i].articulo.especificaciones,
                    partida_clave: lista_articulos[i].articulo.clave_partida_especifica,
                    partida_descripcion: lista_articulos[i].articulo.partida_especifica,
                    familia: lista_articulos[i].articulo.familia,
                    tiene_fecha_caducidad: (lista_articulos[i].articulo.tiene_fecha_caducidad)?true:false,
                    tipo_articulo: lista_articulos[i].articulo.tipo_bien_servicio,
                    tipo_formulario: lista_articulos[i].articulo.clave_form,
                    en_catalogo: (lista_articulos[i].articulo.en_catalogo_unidad)?true:false,
                    indispensable: (lista_articulos[i].articulo.es_indispensable)?true:false,
                    descontinuado: (lista_articulos[i].articulo.descontinuado)?true:false,
                    total_monto: lista_articulos[i].total_monto,
                    no_lotes: 1,
                    total_piezas: lista_articulos[i].cantidad,
                    lotes: [],
                  };
                  
                  articulos_temp.push(articulo);

                  this.controlArticulosAgregados[articulo.id] = true;
                  this.totalesRecibidos.claves += 1;
                }else{
                  let index = articulos_temp.findIndex(x => x.id == lista_articulos[i].articulo.id);
                  articulo = articulos_temp[index];

                  articulo.no_lotes += 1;
                  articulo.total_piezas += lista_articulos[i].cantidad;
                  articulo.total_monto += lista_articulos[i].total_monto;
                }

                articulo.lotes.push({
                  lote:             (lista_articulos[i].stock)?lista_articulos[i].stock.lote:lista_articulos[i].lote,
                  fecha_caducidad:  (lista_articulos[i].stock)?lista_articulos[i].stock.fecha_caducidad:lista_articulos[i].fecha_caducidad,
                  codigo_barras:    (lista_articulos[i].stock)?lista_articulos[i].stock.codigo_barras:lista_articulos[i].codigo_barras,
                  no_serie:         (lista_articulos[i].stock)?lista_articulos[i].stock.no_serie:lista_articulos[i].no_serie,
                  modelo:           (lista_articulos[i].stock)?lista_articulos[i].stock.modelo:lista_articulos[i].modelo,
                  marca_id:         (lista_articulos[i].stock)?lista_articulos[i].stock.marca_id:lista_articulos[i].marca_id,
                  marca:            (lista_articulos[i].stock && lista_articulos[i].stock.marca_id)?lista_articulos[i].stock.marca:(lista_articulos[i].marca_id)?lista_articulos[i].marca:'',
                  cantidad:         lista_articulos[i].cantidad,
                  precio_unitario:  lista_articulos[i].precio_unitario,
                  iva:              lista_articulos[i].iva,
                  total_monto:      lista_articulos[i].total_monto,
                  memo_folio:       (lista_articulos[i].carta_canje)?lista_articulos[i].carta_canje.memo_folio:lista_articulos[i].memo_folio,
                  memo_fecha:       (lista_articulos[i].carta_canje)?lista_articulos[i].carta_canje.memo_fecha:lista_articulos[i].memo_fecha,
                  vigencia_meses:   (lista_articulos[i].carta_canje)?lista_articulos[i].carta_canje.vigencia_meses:lista_articulos[i].vigencia_meses,
                });

                this.totalesRecibidos.articulos += lista_articulos[i].cantidad;
                this.totalesRecibidos.monto += lista_articulos[i].total_monto;
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
  
  agregarArticulo(articulo){ 
    //console.log(articulo);
    if(this.controlArticulosAgregados[articulo.id]){
      let index = this.dataSourceArticulos.data.findIndex(x => x.id === articulo.id);
      articulo = this.dataSourceArticulos.data[index];
      this.dataSourceArticulos.data.splice(index,1);
    }else{
      this.controlArticulosAgregados[articulo.id] = true;
      this.controlArticulosModificados[articulo.id] = '+';
      this.totalesRecibidos.claves += 1;

      articulo.estatus = 1;
      articulo.total_monto = parseFloat('0');
      articulo.no_lotes = 0;
      articulo.total_piezas = 0;
      articulo.lotes = [];
    }

    if(!this.controlArticulosModificados[articulo.id]){
      this.controlArticulosModificados[articulo.id] = '*';
    }

    this.idArticuloSeleccionado = null;
    this.dataSourceArticulos.data.unshift(articulo);
    
    this.articulosTable.renderRows();
    this.dataSourceArticulos.paginator = this.articulosPaginator;
    this.dataSourceArticulos.sort = this.sort;

    this.expandirRow(articulo);
  }

  quitarArticulo(articulo){ 
    const dialogRef = this.dialog.open(ConfirmActionDialogComponent, {
      width: '500px',
      data:{dialogTitle:'Eliminar Articulo?',dialogMessage:'Esta seguro de eliminar este articulo?',btnColor:'warn',btnText:'Eliminar'}
    });

    dialogRef.afterClosed().subscribe(valid => {
      if(valid){
        this.controlArticulosAgregados[articulo.id] = false;
        
        this.totalesRecibidos.claves -= 1;
        this.totalesRecibidos.articulos -= articulo.total_piezas;
        this.totalesRecibidos.monto -= articulo.total_monto;

        let index = this.dataSourceArticulos.data.findIndex(x => x.id === articulo.id);

        //Guardar para papelera
        let articulo_copia = JSON.parse(JSON.stringify(this.dataSourceArticulos.data[index]));
        this.listadoArticulosEliminados.push(articulo_copia);

        this.dataSourceArticulos.data.splice(index,1);
        this.articulosTable.renderRows();
        this.dataSourceArticulos.paginator = this.articulosPaginator;
        this.dataSourceArticulos.sort = this.sort;

        this.idArticuloSeleccionado = null;
      }
    });
  }

  aplicarCambios(config:any){
    console.log(config);
    if(config.accion == 'EliminarArticulo'){
      let articulo = this.dataSourceArticulos.data.find(x => x.id == config.value);
      this.quitarArticulo(articulo);
    }else if(config.accion == 'ActualizarCantidades'){
      let articulo = this.dataSourceArticulos.data.find(x => x.id == config.value.id);
      this.totalesRecibidos.monto -= config.value.total_monto;
      this.totalesRecibidos.articulos -= config.value.total_piezas;

      this.totalesRecibidos.monto += articulo.total_monto;
      this.totalesRecibidos.articulos += articulo.total_piezas;
    }
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

      formData.proveedor_id = (formData.proveedor)?formData.proveedor.id:null;
      formData.programa_id = (formData.programa)?formData.programa.id:null;

      formData.fecha_movimiento = this.datepipe.transform(formData.fecha_movimiento, 'yyyy-MM-dd');
      if(formData.referencia_fecha){
        formData.referencia_fecha = this.datepipe.transform(formData.referencia_fecha, 'yyyy-MM-dd');
      }
      
      this.entradasService.guardarEntrada(formData).subscribe(
        response =>{
          if(response.error) {
            let errorMessage = response.error;
            this.sharedService.showSnackBar(errorMessage, null, 4000);
          }else{
            this.formMovimiento.get('id').patchValue(response.data.id);

            if(response.data.estatus == 'BOR'){ //Borrador
              this.estatusMovimiento = 'BOR';
            }else if(response.data.estatus == 'FIN'){ //Finalizado
              this.estatusMovimiento = 'FIN';
            }else if(response.data.estatus == 'CAN'){ //Cancelado
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

  expandirRow(row){
    this.idArticuloSeleccionado = this.idArticuloSeleccionado === row.id ? null : row.id;
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

  private _filter(catalogo: string, value: string, field: string): any[] {
    const filterValue = value.toLowerCase();

    return this.catalogos[catalogo].filter(option => option[field].toLowerCase().includes(filterValue));
  }

  cancelarEntrada(){
    let id = this.formMovimiento.get('id').value;

    const dialogRef = this.dialog.open(ConfirmActionDialogComponent, {
      width: '500px',
      data:{dialogTitle:'Cancelar Movimiento?',dialogMessage:'Esta seguro de cancelar esta entrada? escriba CANCELAR para confirmar la acción',validationString:'CANCELAR',btnColor:'warn',btnText:'Cancelar'}
    });

    dialogRef.afterClosed().subscribe(valid => {
      if(valid){
        this.entradasService.cancelarEntrada(id).subscribe(
          response =>{
            if(response.error) {
              let configDialog = {
                width: '50%',
                maxHeight: '90vh',
                height: '343px',
                data:{error:response.error, data:response.data},
                panelClass: 'no-padding-dialog'
              };
          
              const dialogRef = this.dialog.open(DialogoCancelarResultadoComponent, configDialog);
            }else{
              this.sharedService.showSnackBar('Movimiento cancelado con exito', null, 3000);
              this.estatusMovimiento = 'CAN';
            }
          },
          errorResponse =>{
            var errorMessage = "Ocurrió un error.";
            if(errorResponse.status == 409){
              errorMessage = errorResponse.error.error.message;
            }
            this.sharedService.showSnackBar(errorMessage, null, 3000);
            //this.isLoadingPDF = false;
          }
        );
      }
    });
  }

  eliminarEntrada(){
    let id = this.formMovimiento.get('id').value;

    const dialogRef = this.dialog.open(ConfirmActionDialogComponent, {
      width: '500px',
      data:{dialogTitle:'Eliminar Movimiento?',dialogMessage:'Esta seguro de eliminar esta entrada?',btnColor:'warn',btnText:'Eliminar'}
    });

    dialogRef.afterClosed().subscribe(valid => {
      if(valid){
        this.isLoading = true;
        this.entradasService.eliminarEntrada(id).subscribe(
          response =>{
            if(response.error) {
              let errorMessage = response.error.message;
              this.sharedService.showSnackBar(errorMessage, null, 3000);
            }else{
              this.sharedService.showSnackBar('Movimiento eliminado con exito', null, 3000);
              this.router.navigateByUrl('/almacen/entradas');
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
      }
    });
  }

  generarPDF(){
    this.isLoading = true;
    let id = this.formMovimiento.get('id').value;
    
    this.entradasService.verEntrada(id).subscribe(
      response =>{
        if(response.error) {
          let errorMessage = response.error.message;
          this.sharedService.showSnackBar(errorMessage, null, 3000);
        }else{
          if(response.data){
            let fecha_reporte = new Intl.DateTimeFormat('es-ES', {year: 'numeric', month: 'numeric', day: '2-digit'}).format(new Date());

            const reportWorker = new ReportWorker();
            reportWorker.onmessage().subscribe(
              data => {
                FileSaver.saveAs(data.data,'Almacen-Entrada '+'('+fecha_reporte+')');
                reportWorker.terminate();
                this.isLoading = false;
            });

            reportWorker.onerror().subscribe(
              (data) => {
                this.sharedService.showSnackBar(data.message, null, 3000);
                this.isLoading = false;
                reportWorker.terminate();
              }
            );
            
            let config = {
              title: "ENTRADA DE ALMACEN",
            };

            reportWorker.postMessage({data:{items: response.data, config:config, fecha_actual: this.maxFechaMovimiento},reporte:'almacen/entrada'});
            //this.isLoading = false;
          }
        }
      },
      errorResponse =>{
        var errorMessage = "Ocurrió un error.";
        if(errorResponse.status == 409){
          errorMessage = errorResponse.error.error.message;
        }
        this.sharedService.showSnackBar(errorMessage, null, 3000);
        //this.isLoadingPDF = false;
      }
    );
  }
}
