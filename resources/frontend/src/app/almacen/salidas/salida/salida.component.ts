import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AlmacenService } from '../../almacen.service';
import { SalidasService } from '../salidas.service';
import { SharedService } from '../../../shared/shared.service';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
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

@Component({
  selector: 'app-salida',
  templateUrl: './salida.component.html',
  styleUrls: ['./salida.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed, void', style({ height: '0px' })), 
      state('expanded', style({ height: '*' })), 
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')), 
      transition('expanded <=> void', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)'))
    ]),
  ],
})
export class SalidaComponent implements OnInit {
  @ViewChild(MatPaginator) articulosPaginator: MatPaginator;
  @ViewChild(MatTable) articulosTable: MatTable<any>;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    private datepipe: DatePipe,
    private formBuilder: FormBuilder, 
    private almacenService: AlmacenService, 
    private salidasService: SalidasService, 
    private sharedService: SharedService, 
    private dialog: MatDialog, 
    private route: ActivatedRoute,
    private router: Router
  ) { }

  formMovimiento:FormGroup;
  catalogos:any;

  tipoSalida:any;
  idArticuloSeleccionado:number;

  controlArticulosAgregados:any;
  controlArticulosModificados:any;
  listadoArticulosEliminados:any[];

  filtroArticulos:string;
  filtroAplicado:boolean;

  filteredUnidades: Observable<any[]>;
  filteredProgramas: Observable<any[]>;
  filteredAreasServicios: Observable<any[]>;

  totalesSalida: any;

  pageEvent: PageEvent;
  resultsLength: number = 0;
  currentPage: number = 0;
  pageSize: number = 10;
  pageSizeOptions: number[] = [10, 20, 30, 50];
  dataSourceArticulos: MatTableDataSource<any>;

  displayedColumns: string[] = ['estatus','clave','nombre','existencias','total_piezas','existencias_restantes','actions'];//'no_lotes',
  
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
    //this.listadoArticulosEliminados = [];
    this.controlArticulosAgregados = {};
    //this.controlArticulosModificados = {};

    this.totalesSalida = {
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
      'unidades_medicas':[],
      'tipos_movimiento':[],
      'areas_servicios':[],
    };

    this.maxFechaMovimiento = new Date();
    
    this.formMovimiento = this.formBuilder.group({
      id:[''],
      fecha_movimiento: [new Date(),Validators.required], //Por default la fecha actual
      almacen_id: ['',Validators.required],
      tipo_movimiento_id:['',Validators.required],
      programa: [''],
      programa_id: [''],
      observaciones: [''],
      documento_folio: [''],
    });

    this.verBoton = {
      concluir:false,
      guardar:false,
      agregar_articulos:false
    };

    let lista_catalogos:any = {almacenes:'*',programas:'*',unidades_medicas:'*',tipos_movimiento:'movimiento.SAL',areas_servicios:'*'};
    
    this.almacenService.obtenerMovimientoCatalogos(lista_catalogos).subscribe(
      response =>{
        if(response.error) {
          let errorMessage = response.error.message;
          this.sharedService.showSnackBar(errorMessage, null, 3000);
          this.isLoading = false;
        } else {
          this.catalogos['almacenes'] = response.data.almacenes;
          this.catalogos['programas'] = response.data.programas;
          this.catalogos['unidades_medicas'] = response.data.unidades_medicas;
          this.catalogos['tipos_movimiento'] = response.data.tipos_movimiento;
          this.catalogos['areas_servicios'] = response.data.areas_servicios;

          if(this.catalogos['almacenes'].length == 1){
            this.formMovimiento.get('almacen_id').patchValue(this.catalogos['almacenes'][0].id);
          }

          if(this.catalogos['tipos_movimiento'].length == 1){
            this.formMovimiento.get('tipo_movimiento_id').patchValue(this.catalogos['tipos_movimiento'][0].id);
            this.cambiarTipoSalida();
          }

          this.filteredProgramas = this.formMovimiento.get('programa').valueChanges.pipe( startWith(''), map(value => typeof value === 'string' ? value : (value)?value.descripcion:''),
                                map(descripcion => descripcion ? this._filter('programas',descripcion,'descripcion') : this.catalogos['programas'].slice())
                              );
          
          this.route.paramMap.subscribe(params => {
            if(params.get('id')){
              this.cargarDatosMovimiento(params.get('id'));
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
              this.isLoading = false;
            }
          });
        }
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

  cargarDatosMovimiento(id){
    this.salidasService.verSalida(id).subscribe(
      response =>{
        if(response.error) {
          let errorMessage = response.error.message;
          this.sharedService.showSnackBar(errorMessage, null, 3000);
        } else {
          response.data.fecha_movimiento = new Date(response.data.fecha_movimiento+'T12:00:00');
          if(response.data.referencia_fecha){
            response.data.referencia_fecha = new Date(response.data.referencia_fecha+'T12:00:00');
          }

          this.formMovimiento.get('tipo_movimiento_id').patchValue(response.data.tipo_movimiento_id);
          this.cambiarTipoSalida();

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
            for(let i in lista_articulos){
              if(!this.controlArticulosAgregados[lista_articulos[i].id]){
                let articulo:any = {
                  id: lista_articulos[i].id,
                  estatus: 1,
                  clave: (lista_articulos[i].clave_cubs)?lista_articulos[i].clave_cubs:lista_articulos[i].clave_local,
                  nombre: lista_articulos[i].articulo,
                  descripcion: lista_articulos[i].especificaciones,
                  partida_clave: lista_articulos[i].clave_partida_especifica,
                  partida_descripcion: lista_articulos[i].partida_especifica,
                  familia: lista_articulos[i].familia,
                  tiene_fecha_caducidad: (lista_articulos[i].tiene_fecha_caducidad)?true:false,
                  tipo_articulo: lista_articulos[i].tipo_bien_servicio,
                  tipo_formulario: lista_articulos[i].clave_form,
                  en_catalogo: (lista_articulos[i].en_catalogo_unidad)?true:false,
                  indispensable: (lista_articulos[i].es_indispensable)?true:false,
                  descontinuado: (lista_articulos[i].descontinuado)?true:false,
                  total_piezas: 0,
                  total_monto: 0,
                  total_lotes: 0,
                  existencias: 0,
                  existencias_restantes: 0,
                  existencias_extras: 0,
                  lotes: []
                };

                lista_articulos[i].stocks.forEach(stock => {
                  if(stock.cantidad){
                    articulo.total_piezas += stock.cantidad;
                    articulo.total_lotes++;
                  }
                  articulo.existencias += stock.existencia;
                  articulo.lotes.push({
                    id: stock.id,
                    lote: stock.lote,
                    codigo_barras: stock.codigo_barras,
                    fecha_caducidad: stock.fecha_caducidad,
                    no_serie: stock.no_serie,
                    modelo: stock.modelo,
                    marca: stock.marca,
                    existencia: stock.existencia,
                    salida: stock.cantidad,
                    restante: stock.existencia - stock.cantidad,
                  });
                });

                articulo.existencias_restantes = articulo.existencias - articulo.total_piezas;

                articulos_temp.push(articulo);

                this.controlArticulosAgregados[articulo.id] = true;
                this.totalesSalida.claves += 1;
                this.totalesSalida.articulos += articulo.total_piezas;
              }
            }
          }else{
            lista_articulos = response.data.lista_articulos;
            for(let i in lista_articulos){
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
                  total_piezas: 0,
                  total_monto: lista_articulos[i].total_monto,
                  total_lotes: 0,
                  existencias: 0,
                  existencias_restantes: 0,
                  existencias_extras: 0,
                  lotes: [],
                };

                articulos_temp.push(articulo);

                this.controlArticulosAgregados[articulo.id] = true;
                this.totalesSalida.claves += 1;
                
                /*articulo.no_lotes = 1;*/
              }else{
                let index = articulos_temp.findIndex(x => x.id == lista_articulos[i].articulo.id);
                articulo = articulos_temp[index];
              }
              
              if(lista_articulos[i].stock){
                articulo.lotes.push({
                  id: lista_articulos[i].stock.id,
                  lote: lista_articulos[i].stock.lote,
                  codigo_barras: lista_articulos[i].stock.codigo_barras,
                  fecha_caducidad: lista_articulos[i].stock.fecha_caducidad,
                  no_serie:lista_articulos[i].stock.no_serie,
                  modelo:lista_articulos[i].stock.modelo,
                  marca:lista_articulos[i].stock.marca,
                  existencia: lista_articulos[i].cantidad_anterior,
                  salida: lista_articulos[i].cantidad,
                  restante: +lista_articulos[i].cantidad_anterior - +lista_articulos[i].cantidad,
                });

                this.totalesSalida.articulos += lista_articulos[i].cantidad;
                articulo.total_piezas += lista_articulos[i].cantidad;
                articulo.existencias += lista_articulos[i].cantidad_anterior;
                articulo.existencias_restantes = articulo.existencias - articulo.total_piezas;
                articulo.total_lotes++;
              }
            }
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
  }

  cambiarTipoSalida(){
    this.tipoSalida = this.catalogos['tipos_movimiento'].find(x => x.id === this.formMovimiento.get('tipo_movimiento_id').value);
    let lista_campos_remover:string[] = [
      'unidad_medica_movimiento',
      'unidad_medica_movimiento_id',
      'almacen_movimiento_id',
      'area_servicio_movimiento',
      'area_servicio_movimiento_id',
    ];

    lista_campos_remover.forEach(campo => {
      if(this.formMovimiento.get(campo)){
        this.formMovimiento.removeControl(campo);
      }
    });
    this.filteredUnidades = undefined;
    this.filteredAreasServicios = undefined;
    this.formMovimiento.get('documento_folio').clearValidators();

    if(this.tipoSalida.clave == 'AUM'){
      this.formMovimiento.addControl('unidad_medica_movimiento', new FormControl('', Validators.required));
      this.formMovimiento.addControl('unidad_medica_movimiento_id', new FormControl(''));

      this.filteredUnidades = this.formMovimiento.get('unidad_medica_movimiento').valueChanges.pipe( startWith(''), map(value => typeof value === 'string' ? value : (value)?value.nombre:''),
                                map(nombre => nombre ? this._filter('unidades_medicas',nombre,'nombre') : this.catalogos['unidades_medicas'].slice())
                              );
    }else if(this.tipoSalida.clave == 'TPSO'){
      this.formMovimiento.addControl('almacen_movimiento_id', new FormControl('', Validators.required));
    }else if(this.tipoSalida.clave == 'CTVO'){
      this.formMovimiento.addControl('area_servicio_movimiento', new FormControl('', Validators.required));
      this.formMovimiento.addControl('area_servicio_movimiento_id', new FormControl(''));
      this.formMovimiento.get('documento_folio').setValidators(Validators.required);
      //this.formMovimiento.get('documento_folio').markAllAsTouched();

      this.filteredAreasServicios = this.formMovimiento.get('area_servicio_movimiento').valueChanges.pipe( startWith(''), map(value => typeof value === 'string' ? value : (value)?value.descripcion:''),
                              map(descripcion => descripcion ? this._filter('areas_servicios',descripcion,'descripcion') : this.catalogos['areas_servicios'].slice())
                            );
    }
    this.formMovimiento.updateValueAndValidity();
  }

  agregarArticulo(articulo){
    if(this.controlArticulosAgregados[articulo.id]){
      let index = this.dataSourceArticulos.data.findIndex(x => x.id === articulo.id);
      articulo = this.dataSourceArticulos.data[index];
      this.dataSourceArticulos.data.splice(index,1);
    }else{
      this.controlArticulosAgregados[articulo.id] = true;
      //this.controlArticulosModificados[articulo.id] = '+';
      this.totalesSalida.claves += 1;

      articulo.estatus = 1;
      articulo.total_monto = parseFloat('0');
      articulo.no_lotes = 0;
      articulo.total_piezas = 0;
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
        
        this.totalesSalida.claves -= 1;
        this.totalesSalida.articulos -= articulo.total_piezas;
        this.totalesSalida.monto -= articulo.total_monto;

        let index = this.dataSourceArticulos.data.findIndex(x => x.id === articulo.id);

        //Guardar para papelera
        let articulo_copia = JSON.parse(JSON.stringify(this.dataSourceArticulos.data[index]));
        //this.listadoArticulosEliminados.push(articulo_copia);

        this.dataSourceArticulos.data.splice(index,1);
        this.articulosTable.renderRows();
        this.dataSourceArticulos.paginator = this.articulosPaginator;
        this.dataSourceArticulos.sort = this.sort;

        this.idArticuloSeleccionado = null;
      }
    });
  }

  concluirMovimiento(){
    const dialogRef = this.dialog.open(ConfirmActionDialogComponent, {
      width: '500px',
      data:{dialogTitle:'Concluir Movimiento?',dialogMessage:'Esta seguro de concluir esta salida? escriba CONCLUIR para confirmar la acción',validationString:'CONCLUIR',btnColor:'primary',btnText:'Concluir'}
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

      formData.programa_id = (formData.programa)?formData.programa.id:null;
      formData.unidad_medica_movimiento_id = (formData.unidad_medica_movimiento)?formData.unidad_medica_movimiento.id:null;
      formData.area_servicio_movimiento_id = (formData.area_servicio_movimiento)?formData.area_servicio_movimiento.id:null;

      formData.fecha_movimiento = this.datepipe.transform(formData.fecha_movimiento, 'yyyy-MM-dd');
      
      this.salidasService.guardarSalida(formData).subscribe(
        response =>{
          if(response.error) {
            let errorMessage = response.error;
            this.sharedService.showSnackBar(errorMessage, null, 3000);
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

  cancelarSalida(){
    const dialogRef = this.dialog.open(ConfirmActionDialogComponent, {
      width: '500px',
      data:{dialogTitle:'Cancelar Movimiento?',dialogMessage:'Esta seguro de cancelar esta salida? escriba CANCELAR para confirmar la acción',validationString:'CANCELAR',btnColor:'warn',btnText:'Cancelar'}
    });

    dialogRef.afterClosed().subscribe(valid => {
      if(valid){
        let id = this.formMovimiento.get('id').value;

        this.salidasService.cancelarSalida(id).subscribe(
          response =>{
            if(response.error) {
              let errorMessage = response.error.message;
              this.sharedService.showSnackBar(errorMessage, null, 3000);
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

  eliminarSalida(){
    const dialogRef = this.dialog.open(ConfirmActionDialogComponent, {
      width: '500px',
      data:{dialogTitle:'Eliminar Movimiento?',dialogMessage:'Esta seguro de eliminar esta salida?',btnColor:'warn',btnText:'Eliminar'}
    });

    dialogRef.afterClosed().subscribe(valid => {
      if(valid){
        let id = this.formMovimiento.get('id').value;
        this.salidasService.eliminarSalida(id).subscribe(
          response =>{
            if(response.error) {
              let errorMessage = response.error.message;
              this.sharedService.showSnackBar(errorMessage, null, 3000);
            }else{
              this.sharedService.showSnackBar('Movimiento eliminado con exito', null, 3000);
              this.router.navigateByUrl('/almacen/salidas');
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

  generarPDF(){
    this.isLoading = true;
    let id = this.formMovimiento.get('id').value;
    
    this.salidasService.verSalida(id).subscribe(
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
                FileSaver.saveAs(data.data,'Almacen-Salida '+'('+fecha_reporte+')');
                reportWorker.terminate();
                this.isLoading = false;
            });

            reportWorker.onerror().subscribe(
              (data) => {
                this.sharedService.showSnackBar(data.message, null, 3000);
                console.log(data);
                this.isLoading = false;
                reportWorker.terminate();
              }
            );
            
            let config = {
              title: "SALIDA DE ALMACEN",
            };

            reportWorker.postMessage({data:{items: response.data, config:config, fecha_actual: this.maxFechaMovimiento},reporte:'almacen/salida'});
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

  aplicarFiltroArticulos(event: Event){ 
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceArticulos.filter = filterValue.trim().toLowerCase();
    if(filterValue.trim().toLowerCase() == ''){
      this.filtroAplicado = false;
    }else{
      this.filtroAplicado = true;
    }
  }

  aplicarCambios(config: any){
    if(config.accion == 'ActualizarCantidades'){
      let articulo = this.dataSourceArticulos.data.find(x => x.id == config.value.id);
      this.totalesSalida.articulos -= config.value.total_piezas;
      this.totalesSalida.articulos += articulo.total_piezas;
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

}
