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
import { map, startWith, timeout } from 'rxjs/operators';
import { MatSort } from '@angular/material/sort';
import {animate, state, style, transition, trigger} from '@angular/animations';
import { ReportWorker } from 'src/app/web-workers/report-worker';
import * as FileSaver from 'file-saver';
import { DialogoCancelarMovimientoComponent } from '../../tools/dialogo-cancelar-movimiento/dialogo-cancelar-movimiento.component';
import { DialogoSolicitudRepetidaComponent } from '../dialogo-solicitud-repetida/dialogo-solicitud-repetida.component';
import { DialogoModificarMovimientoComponent } from '../../tools/dialogo-modificar-movimiento/dialogo-modificar-movimiento.component';
import { User } from 'src/app/auth/models/user';
import { AuthService } from 'src/app/auth/auth.service';

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
    private authService: AuthService,
    private almacenService: AlmacenService, 
    private salidasService: SalidasService, 
    private sharedService: SharedService, 
    private dialog: MatDialog, 
    private route: ActivatedRoute,
    private router: Router
  ) { }

  authUser:User;

  datosMovimiento:any;
  formMovimiento:FormGroup;
  catalogos:any;

  puedeSurtirUnidades:boolean;
  tipoSalida:any;
  idArticuloSeleccionado:number;

  movimientoHijo:any;
  tieneSolicitud:boolean;
  movimientoSolicitud:any;

  cargandoDatosReceta:boolean;
  cargandoDatosPaciente:boolean;
  datosPacienteEstatus:string;
  recetaEncontrada:any;
  habilitarDatosPaciente:boolean;

  controlArticulosAgregados:any;
  controlArticulosModificados:any;
  listadoArticulosEliminados:any[];

  filtroArticulos:string;
  filtroAplicado:boolean;

  filteredUnidades: Observable<any[]>;
  filteredProgramas: Observable<any[]>;
  filteredAreasServicios: Observable<any[]>;
  filteredPersonalMedico: Observable<any[]>;

  totalesSalida: any;

  pageEvent: PageEvent;
  resultsLength: number = 0;
  currentPage: number = 0;
  pageSize: number = 10;
  pageSizeOptions: number[] = [10, 20, 30, 50];
  dataSourceArticulos: MatTableDataSource<any>;

  displayedColumns: string[] = ['estatus','clave','nombre','modo_salida','existencias','total_piezas','existencias_restantes','actions'];//'no_lotes',
  
  puedeEditarDatosEncabezado: boolean;
  puedeEditarListaArticulos:  boolean;

  verBoton: any;
  isLoading: boolean;
  isSaving: boolean;
  estatusMovimiento: string;
  maxFechaMovimiento: Date;
  listadoEstatusUsuarios: any[];
  verListadoUsuarios: boolean;

  listaEstatusIconos: any = { 'NV':'save_as', 'BOR':'content_paste',  'FIN':'assignment_turned_in',   'CAN':'cancel',     'PERE':'pending_actions',       'SOL':'edit_notifications',        'MOD':'note_alt'};
  listaEstatusClaves: any = { 'NV':'nuevo',   'BOR':'borrador',       'FIN':'concluido',              'CAN':'cancelado',  'PERE':'pendiente-recepcion',   'SOL':'peticion-modificacion',     'MOD':'modificacion-aprobada'};
  listaEstatusLabels: any = { 'NV':'Nuevo',   'BOR':'Borrador',       'FIN':'Concluido',              'CAN':'Cancelado',  'PERE':'Pendiente de Recepción','SOL':'Petición de Modificación',  'MOD':'Modificación Activa'};

  estatusArticulosColores = {1:'verde', 2:'ambar', 3:'rojo'};
  estatusArticulosIconos = {1:'check_circle_outline', 2:'notification_important', 3:'warning'};

  ngOnInit() {
    this.authUser = this.authService.getUserData();

    this.isLoading = true;
    this.tieneSolicitud = false;
    this.puedeEditarDatosEncabezado = false;
    this.puedeEditarListaArticulos = false;
    this.listadoEstatusUsuarios = [];
    this.verListadoUsuarios = false;

    this.controlArticulosAgregados = {};

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
      'almacenes_destino':[],
      'programas':[],
      'recetas_tipos_uso':[],
      'unidades_medicas':[],
      'tipos_movimiento':[],
      'areas_servicios':[],
      'turnos': [],
      'personal_medico': [],
    };

    this.maxFechaMovimiento = new Date();
    
    this.formMovimiento = this.formBuilder.group({
      id:[''],
      fecha_movimiento: [new Date(),Validators.required], //Por default la fecha actual
      almacen_id: ['',Validators.required],
      tipo_movimiento_id:['',Validators.required],
      programa: [''],
      programa_id: [''],
      turno_id: ['',Validators.required],
      observaciones: [''],
      documento_folio: [''],
    });

    this.verBoton = {
      agregar_articulos:false,
      guardar:false,
      concluir:false,
      concluir_modificacion:false,
      duplicar:false,
      eliminar:false,
      cancelar:false,
      modificar_salida:false,
    };

    let lista_catalogos:any = {almacenes:'*',almacenes_todos:'*',programas:'*',unidades_medicas:'*',areas_servicios:'*',turnos:'*',personal_medico:'*', recetas_tipos_uso:'*',filtro_almacenes_movimiento:'SAL'};
    
    this.almacenService.obtenerMovimientoCatalogos(lista_catalogos).subscribe(
      response =>{
        if(response.error) {
          let errorMessage = response.error.message;
          this.sharedService.showSnackBar(errorMessage, null, 3000);
          this.isLoading = false;
        } else {
          this.catalogos['almacenes'] = response.data.almacenes;
          this.catalogos['almacenes_destino'] = response.data.almacenes_todos;
          this.catalogos['programas'] = response.data.programas;
          this.catalogos['unidades_medicas'] = response.data.unidades_medicas;
          this.catalogos['recetas_tipos_uso'] = response.data.recetas_tipos_uso;
          this.catalogos['areas_servicios'] = response.data.areas_servicios;
          this.catalogos['turnos'] = response.data.turnos;
          this.catalogos['personal_medico'] = response.data.personal_medico;

          if(this.catalogos['almacenes'].length == 1){
            this.formMovimiento.get('almacen_id').patchValue(this.catalogos['almacenes'][0].id);
            this.catalogos['tipos_movimiento'] = this.catalogos['almacenes'][0].tipos_movimiento;
            this.puedeSurtirUnidades = (this.catalogos['almacenes'][0].puede_surtir_unidades == 1);
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
              let datos_recibidos = history.state.data;
              this.estatusMovimiento = 'NV';

              //Si recibimos datos, es por que estamos copiando una salida o el movimiento se esta generando en base a una entrada
              if(datos_recibidos && datos_recibidos.movimiento_id){
                this.isLoading = true;
                this.salidasService.verSalida(datos_recibidos.movimiento_id).subscribe(
                  response =>{
                    console.log('Respuesta:',response);
                    this.formMovimiento.get('almacen_id').patchValue(response.data.almacen_id);
                    this.catalogos['tipos_movimiento'] = (this.catalogos['almacenes'].find(item => item.id == response.data.almacen_id)).tipos_movimiento;
                    this.formMovimiento.get('tipo_movimiento_id').patchValue(response.data.tipo_movimiento_id);
                    this.cambiarTipoSalida();

                    let almacen = this.catalogos['almacenes'].find(item => item.id == response.data.almacen_id);
                    this.puedeSurtirUnidades = almacen.puede_surtir_unidades;

                    let lista_articulos:any[] = this.cargarArticulos(response.data.lista_articulos,true);
                    this.dataSourceArticulos = new MatTableDataSource<any>(lista_articulos);
                    this.dataSourceArticulos.paginator = this.articulosPaginator;
                    this.dataSourceArticulos.sort = this.sort;
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
                this.dataSourceArticulos = new MatTableDataSource<any>([]);
                this.dataSourceArticulos.paginator = this.articulosPaginator;
                this.dataSourceArticulos.sort = this.sort;
              }

              //Movimiento nuevo sin guardar
              this.puedeEditarDatosEncabezado = true;
              this.puedeEditarListaArticulos = true;

              this.verBoton.concluir = true;
              this.verBoton.guardar = true;
              this.verBoton.eliminar = true;
              this.verBoton.agregar_articulos = true;
              
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

          let almacen = this.catalogos['almacenes'].find(item => item.id == response.data.almacen_id);
          this.catalogos['tipos_movimiento'] = almacen.tipos_movimiento;
          this.puedeSurtirUnidades = almacen.puede_surtir_unidades;
          this.formMovimiento.get('tipo_movimiento_id').patchValue(response.data.tipo_movimiento_id);
          this.cambiarTipoSalida();

          this.formMovimiento.patchValue(response.data);
          this.datosMovimiento = response.data;
          //this.datosMovimiento = {id: response.data.id, folio: response.data.folio};
          console.log('Datos del Server:',this.datosMovimiento);

          if(response.data.es_colectivo){
            this.checarTieneSolicitud(true);
          }

          if(response.data.movimiento_hijo){
            this.movimientoHijo = response.data.movimiento_hijo;
          }

          if(response.data.solicitud){
            this.movimientoSolicitud = response.data.solicitud;
          }

          if(response.data.paciente){
            this.formMovimiento.get('expediente_clinico').patchValue(response.data.paciente.expediente_clinico);
            this.formMovimiento.get('paciente').patchValue(response.data.paciente.nombre_completo);
            this.formMovimiento.get('curp').patchValue(response.data.paciente.curp);
            this.datosPacienteEstatus = response.data.paciente.expediente_clinico;
          }

          this.estatusMovimiento = response.data.estatus;
          if(response.data.estatus == 'BOR'){
            this.puedeEditarDatosEncabezado = true;
            this.puedeEditarListaArticulos = true;

            this.verBoton.concluir = true;
            this.verBoton.guardar = true;
            this.verBoton.eliminar = true;
            this.verBoton.agregar_articulos = true; 
          }else{
            this.verBoton.cancelar = (response.data.estatus == 'CAN')?false:true;
            this.verBoton.modificar_salida = (response.data.estatus == 'CAN')?false:true;;
            this.verBoton.duplicar = true;
          }

          if(this.datosMovimiento.modificacion_activa){
            this.cargarDatosModificacion(this.datosMovimiento.modificacion_activa);
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
                  unidad_medida: lista_articulos[i].unidad_medida,
                  tiene_fecha_caducidad: (lista_articulos[i].tiene_fecha_caducidad)?true:false,
                  puede_surtir_unidades: (lista_articulos[i].puede_surtir_unidades)?true:false,
                  surtir_en_unidades: (lista_articulos[i].modo_movimiento == 'UNI')?true:false,
                  tipo_articulo: lista_articulos[i].tipo_bien_servicio,
                  tipo_formulario: lista_articulos[i].clave_form,
                  en_catalogo: (lista_articulos[i].en_catalogo_unidad)?true:false,
                  normativo: (lista_articulos[i].es_normativo)?true:false,
                  descontinuado: (lista_articulos[i].descontinuado)?true:false,
                  cantidad_solicitado:lista_articulos[i].cantidad_solicitado,
                  total_piezas: 0,
                  total_monto: 0,
                  total_lotes: 0,
                  existencias: 0,
                  existencias_restantes: 0,
                  existencias_empaque: 0,
                  existencias_unidades: 0,
                  existencias_extras: 0,
                  lotes: []
                };

                lista_articulos[i].stocks.forEach(stock => {
                  if(stock.cantidad){
                    articulo.total_piezas += stock.cantidad;
                    articulo.total_lotes++;
                  }
                  
                  articulo.existencias_empaque += stock.existencia;
                  articulo.existencias_unidades += stock.existencia_unidades;

                  articulo.lotes.push({
                    id: stock.id,
                    empaque_detalle: stock.empaque_detalle,
                    lote: stock.lote,
                    codigo_barras: stock.codigo_barras,
                    fecha_caducidad: stock.fecha_caducidad,
                    no_serie: stock.no_serie,
                    modelo: stock.modelo,
                    programa: (stock.programa)?stock.programa.descripcion:'Sin Programa',
                    marca: (stock.marca)?stock.marca:'Sin Marca',
                    existencia: stock.existencia,
                    existencia_empaque: stock.existencia,
                    existencia_unidades: stock.existencia_unidades,
                    salida: stock.cantidad,
                    restante: stock.existencia - stock.cantidad,
                  });
                });

                articulo.existencias = (articulo.surtir_en_unidades)?articulo.existencias_unidades:articulo.existencias_empaque;
                articulo.existencias_restantes = articulo.existencias - articulo.total_piezas;

                articulos_temp.push(articulo);

                this.controlArticulosAgregados[articulo.id] = true;
                this.totalesSalida.claves += 1;
                this.totalesSalida.articulos += articulo.total_piezas;
              }
            }
          }else{
            articulos_temp = this.cargarArticulos(response.data.lista_articulos);
          }

          this.dataSourceArticulos = new MatTableDataSource<any>(articulos_temp);
          this.dataSourceArticulos.paginator = this.articulosPaginator;
          this.dataSourceArticulos.sort = this.sort;
        }

        this.cargarDatosUsuarios(response.data);

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

  cerrarListaUsuarios(event){
    if(event.code == 'Escape'){
      this.verListadoUsuarios = false;
    }
  }

  cargarDatosUsuarios(datos_movimiento){
    this.listadoEstatusUsuarios = [];
    if(datos_movimiento.cancelado_por){
      this.listadoEstatusUsuarios.push({
        'etiqueta': 'Cancelado por',
        'nombre': datos_movimiento.cancelado_por.name,
        'fecha': new Date(datos_movimiento.fecha_cancelacion+'T12:00:00'),
      });
    }

    if(datos_movimiento.concluido_por){
      this.listadoEstatusUsuarios.push({
        'etiqueta': 'Concluido por',
        'nombre': datos_movimiento.concluido_por.name,
        'fecha': new Date(datos_movimiento.updated_at),
      });
    }else if(datos_movimiento.modificado_por){
      this.listadoEstatusUsuarios.push({
        'etiqueta': 'Modificado por',
        'nombre': datos_movimiento.modificado_por.name,
        'fecha': new Date(datos_movimiento.updated_at),
      });
    }

    if(datos_movimiento.creado_por){
      this.listadoEstatusUsuarios.push({
        'etiqueta': 'Creado por',
        'nombre': datos_movimiento.creado_por.name,
        'fecha': new Date(datos_movimiento.created_at),
      });
    }
  }

  cargarArticulos(lista_articulos: any[], precarga:boolean = false): any[]{
    let articulos_temp:any[] = [];

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
          unidad_medida: lista_articulos[i].articulo.unidad_medida,
          tiene_fecha_caducidad: (lista_articulos[i].articulo.tiene_fecha_caducidad)?true:false,
          puede_surtir_unidades: (lista_articulos[i].articulo.puede_surtir_unidades)?true:false,
          surtir_en_unidades: (lista_articulos[i].modo_movimiento == 'UNI')?true:false,
          tipo_articulo: lista_articulos[i].articulo.tipo_bien_servicio,
          tipo_formulario: lista_articulos[i].articulo.clave_form,
          en_catalogo: (lista_articulos[i].articulo.en_catalogo_unidad)?true:false,
          normativo: (lista_articulos[i].articulo.es_normativo)?true:false,
          descontinuado: (lista_articulos[i].articulo.descontinuado)?true:false,
          cantidad_solicitado: lista_articulos[i].cantidad_solicitado,
          total_piezas: 0,
          total_monto: lista_articulos[i].total_monto,
          total_lotes: 0,
          existencias: 0,
          existencias_restantes: 0,
          existencias_empaque: 0,
          existencias_unidades: 0,
          existencias_extras: 0,
          lotes: [],
        };

        this.controlArticulosAgregados[articulo.id] = true;
        this.totalesSalida.claves += 1;
        
        articulos_temp.push(articulo);
        /*articulo.no_lotes = 1;*/
      }else{
        let index = articulos_temp.findIndex(x => x.id == lista_articulos[i].articulo.id);
        articulo = articulos_temp[index];
      }
      
      if(lista_articulos[i].stock){
        let lote:any = {
          id: lista_articulos[i].stock.id,
          empaque_detalle: lista_articulos[i].stock.empaque_detalle,
          lote: lista_articulos[i].stock.lote,
          codigo_barras: lista_articulos[i].stock.codigo_barras,
          fecha_caducidad: lista_articulos[i].stock.fecha_caducidad,
          no_serie:lista_articulos[i].stock.no_serie,
          modelo:lista_articulos[i].stock.modelo,
          programa: (lista_articulos[i].stock.programa)?lista_articulos[i].stock.programa.descripcion:'Sin Programa',
          marca: (lista_articulos[i].stock.marca)?lista_articulos[i].stock.marca:'Sin Marca',
          existencia: (!precarga)?lista_articulos[i].cantidad_anterior:lista_articulos[i].stock.existencia,
          existencia_empaque: (!precarga)?lista_articulos[i].cantidad_anterior:lista_articulos[i].stock.existencia,
          existencia_unidades: (!precarga)?lista_articulos[i].cantidad_anterior:lista_articulos[i].stock.existencia_unidades,
          salida: lista_articulos[i].cantidad,
          restante: ((!precarga)?+lista_articulos[i].cantidad_anterior:lista_articulos[i].stock.existencia) - +lista_articulos[i].cantidad,
        };

        if(precarga){
          if((lote.existencia_empaque + lote.existencia_unidades) > 0){
            if(lote.salida > lote.existencia_empaque){
              lote.salida = lote.existencia_empaque;
              lote.restante = 0;
            }
            articulo.lotes.push(lote);
          }else{
            lote.salida = 0;
          }
        }else{
          articulo.lotes.push(lote);
        }
        
        this.totalesSalida.articulos += lote.salida;
        articulo.total_piezas += lote.salida;
        articulo.total_lotes++;
        articulo.existencias_empaque += (!precarga)?lista_articulos[i].cantidad_anterior:lista_articulos[i].stock.existencia;
        articulo.existencias_unidades += (!precarga)?lista_articulos[i].cantidad_anterior:lista_articulos[i].stock.existencia_unidades;  
      }
      articulo.existencias = (articulo.surtir_en_unidades)?articulo.existencias_unidades:articulo.existencias_empaque;
      articulo.existencias_restantes = articulo.existencias - articulo.total_piezas;
    }
    return articulos_temp;
  }

  checarAlmacenSeleccionado(){
    let almacen = this.catalogos['almacenes'].find(item => item.id == this.formMovimiento.get('almacen_id').value);
    this.catalogos['tipos_movimiento'] = almacen.tipos_movimiento;
    this.puedeSurtirUnidades = (almacen.puede_surtir_unidades == 1);
    if(this.catalogos['tipos_movimiento'].length == 1){
      this.formMovimiento.get('tipo_movimiento_id').patchValue(this.catalogos['tipos_movimiento'][0].id);
      this.cambiarTipoSalida();
    }else{
      this.formMovimiento.get('tipo_movimiento_id').reset();
      this.cambiarTipoSalida();
    }

    if(this.tipoSalida && this.tipoSalida.clave == 'LMCN'){
      this.formMovimiento.get('almacen_movimiento_id').reset();
    }
  }

  checarTieneSolicitud(checked){
    this.tieneSolicitud = checked;
    if(checked){
      this.formMovimiento.get('documento_folio').setValidators(Validators.required);
      this.displayedColumns = ['estatus','clave','nombre','modo_salida','cantidad_solicitado','total_piezas','cantidad_sin_surtir','actions'];
    }else{
      this.formMovimiento.get('documento_folio').clearValidators();
      this.displayedColumns = ['estatus','clave','nombre','modo_salida','existencias','total_piezas','existencias_restantes','actions'];
    }
  }

  cambiarTipoSalida(){
    this.tipoSalida = this.catalogos['tipos_movimiento'].find(x => x.id === this.formMovimiento.get('tipo_movimiento_id').value);
    let lista_campos_remover:string[] = [
      'unidad_medica_movimiento',
      'unidad_medica_movimiento_id',
      'almacen_movimiento_id',
      'area_servicio_movimiento',
      'area_servicio_movimiento_id',
      'solicitud_tipo_uso_id',
      'personal_medico',
      'personal_medico_id',
      'paciente_id',
      'expediente_clinico',
      'paciente',
      'curp',
      'es_colectivo',
    ];
    this.datosPacienteEstatus = 'Teclear un No. de Expediente';
    this.habilitarDatosPaciente = false;

    lista_campos_remover.forEach(campo => {
      if(this.formMovimiento.get(campo)){
        this.formMovimiento.removeControl(campo);
      }
    });

    this.filteredUnidades = undefined;
    this.filteredAreasServicios = undefined;
    this.filteredPersonalMedico = undefined;
    this.formMovimiento.get('documento_folio').clearValidators();

    if(this.tipoSalida){
      if(this.tipoSalida.clave == 'UNMD'){
        this.formMovimiento.addControl('unidad_medica_movimiento', new FormControl('', Validators.required));
        this.formMovimiento.addControl('unidad_medica_movimiento_id', new FormControl(''));
        this.tieneSolicitud = false;
        this.filteredUnidades = this.formMovimiento.get('unidad_medica_movimiento').valueChanges.pipe( startWith(''), map(value => typeof value === 'string' ? value : (value)?value.nombre:''),
                                  map(nombre => nombre ? this._filter('unidades_medicas',nombre,'nombre') : this.catalogos['unidades_medicas'].slice())
                                );
      }else if(this.tipoSalida.clave == 'LMCN'){
        this.formMovimiento.addControl('almacen_movimiento_id', new FormControl('', Validators.required));
        this.formMovimiento.addControl('es_colectivo', new FormControl(''));

        if(this.tieneSolicitud){
          this.formMovimiento.get('es_colectivo').patchValue(true);
        }
      }else if(this.tipoSalida.clave == 'SRVC'){
        this.formMovimiento.addControl('area_servicio_movimiento', new FormControl('', Validators.required));
        this.formMovimiento.addControl('area_servicio_movimiento_id', new FormControl(''));
        this.formMovimiento.addControl('es_colectivo', new FormControl(''));

        if(this.tieneSolicitud){
          this.formMovimiento.get('es_colectivo').patchValue(true);
        }
      }else if(this.tipoSalida.clave == 'RCTA'){
        this.formMovimiento.addControl('solicitud_tipo_uso_id', new FormControl('', Validators.required));
        this.formMovimiento.addControl('personal_medico', new FormControl(''));
        this.formMovimiento.addControl('personal_medico_id', new FormControl(''));
        this.formMovimiento.addControl('paciente_id', new FormControl(''));
        this.formMovimiento.addControl('expediente_clinico', new FormControl(''));
        this.formMovimiento.addControl('paciente', new FormControl(''));
        this.formMovimiento.addControl('curp', new FormControl(''));
        this.formMovimiento.addControl('area_servicio_movimiento', new FormControl(''));
        this.formMovimiento.addControl('area_servicio_movimiento_id', new FormControl(''));
        this.formMovimiento.get('documento_folio').setValidators(Validators.required);
        this.tieneSolicitud = true;      
      }else if(this.tipoSalida.clave == 'PSNL'){
        this.formMovimiento.addControl('personal_medico', new FormControl('', Validators.required));
        this.formMovimiento.addControl('personal_medico_id', new FormControl(''));
        this.formMovimiento.addControl('area_servicio_movimiento', new FormControl('', Validators.required));
        this.formMovimiento.addControl('area_servicio_movimiento_id', new FormControl(''));
        this.tieneSolicitud = false;
      }
    }

    if(this.formMovimiento.get('area_servicio_movimiento')){
      this.filteredAreasServicios = this.formMovimiento.get('area_servicio_movimiento').valueChanges.pipe( startWith(''), map(value => typeof value === 'string' ? value : (value)?value.descripcion:''),
                                    map(descripcion => descripcion ? this._filter('areas_servicios',descripcion,'descripcion') : this.catalogos['areas_servicios'].slice())
                                  );
    }

    if(this.formMovimiento.get('personal_medico')){
      this.filteredPersonalMedico = this.formMovimiento.get('personal_medico').valueChanges.pipe( startWith(''), map(value => typeof value === 'string' ? value : (value)?value.nombre_completo:''),
                              map(nombre => nombre ? this._filter('personal_medico',nombre,'nombre_completo') : this.catalogos['personal_medico'].slice())
                            );
    }

    this.formMovimiento.updateValueAndValidity();
    this.checarTieneSolicitud(this.tieneSolicitud);
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

  activarModificacionSalida(){
    let configDialog = {
      width: '400px',
      //minHeight: '470px',
      height: 'auto',
      disableClose: true,
      data:{id:this.datosMovimiento.id, modificacion: null},
      panelClass: 'no-padding-dialog'
    };

    if(this.datosMovimiento && (this.datosMovimiento.estatus == 'FIN' || this.datosMovimiento.estatus == 'PERE')){
      if(this.datosMovimiento.modificacion_activa){
        configDialog.data.modificacion = this.datosMovimiento.modificacion_activa;
      }
      const dialogRef = this.dialog.open(DialogoModificarMovimientoComponent, configDialog);

      dialogRef.afterClosed().subscribe(dialogResponse => {
        if(dialogResponse){
          if(dialogResponse.estatus != 'CAN'){
            this.datosMovimiento.modificacion_activa = dialogResponse;
            this.cargarDatosModificacion(dialogResponse);
          }else{
            this.datosMovimiento.modificacion_activa = null;
            this.habilitarDatosPaciente = false;
            this.puedeEditarDatosEncabezado = false;
            this.verBoton.concluir_modificacion = false;
            this.verBoton.modificar_salida = true;
            this.estatusMovimiento = this.datosMovimiento.estatus;
          }
        }
      });
    }else{
      console.log('no encotnrado');
    }
  }

  cargarDatosModificacion(modificacion){
    this.estatusMovimiento = modificacion.estatus;
    if(modificacion.estatus == 'MOD' && modificacion.solicitado_usuario_id == this.authUser.id){
      this.habilitarDatosPaciente = true;
      this.puedeEditarDatosEncabezado = true;
      this.verBoton.concluir_modificacion = true;
      //this.verBoton.modificar_salida = false;
      this.protegerDatosFormulario();
    }
  }

  protegerDatosFormulario(){
    if(this.formMovimiento.get('tipo_movimiento_id')){
      this.formMovimiento.get('tipo_movimiento_id').disable();
    }

    if(this.formMovimiento.get('programa')){
      this.formMovimiento.get('programa').disable();
      this.formMovimiento.get('programa_id').disable();
    }

    if(this.formMovimiento.get('es_colectivo')){
      this.formMovimiento.get('es_colectivo').disable();
    }

    if(this.datosMovimiento.movimiento_hijo){
      if(this.datosMovimiento.movimiento_hijo.estatus == 'FIN'){
        if(this.formMovimiento.get('almacen_movimiento_id')){
          this.formMovimiento.get('almacen_movimiento_id').disable();
        }
      }
    }
    
  }

  concluirModificacion(){
    const dialogRef = this.dialog.open(ConfirmActionDialogComponent, {
      width: '500px',
      data:{dialogTitle:'Concluir Modificación?',dialogMessage:'Esta seguro de concluir las modificaciones? escriba CONCLUIR para confirmar la acción',validationString:'CONCLUIR',btnColor:'admin',btnText:'Concluir'}
    });

    dialogRef.afterClosed().subscribe(valid => {
      if(valid){
        this.isSaving = true;
        let params:any = this.formMovimiento.value;
        params.fecha_movimiento = this.datepipe.transform(params.fecha_movimiento, 'yyyy-MM-dd');
        params.unidad_medica_movimiento_id = (params.unidad_medica_movimiento)?params.unidad_medica_movimiento.id:null;
        params.area_servicio_movimiento_id = (params.area_servicio_movimiento)?params.area_servicio_movimiento.id:null;

        this.almacenService.guardarModificacion(this.datosMovimiento.id,params).subscribe(
          response =>{
            if(response.error) {
              let errorMessage = response.error;
              this.sharedService.showSnackBar(errorMessage, null, 3000);
              if(response.code == 'solicitud_repetida'){
                let configDialog = {
                  width: '50%',
                  maxHeight: '90vh',
                  height: '343px',
                  data:{error:response.error, data:response.data},
                  panelClass: 'no-padding-dialog'
                };
                const dialogRef = this.dialog.open(DialogoSolicitudRepetidaComponent, configDialog);
              }
            }else{
              this.sharedService.showSnackBar('Datos Guardados con Éxito', null, 3000);
              response.data.modificacion.registro_original = JSON.parse(response.data.modificacion.registro_original);
              response.data.modificacion.registro_modificado = JSON.parse(response.data.modificacion.registro_modificado);
              console.log('Modificacion Guardada:',response.data.modificacion);
              if(response.data.modificacion.estatus == 'FIN'){
                this.datosMovimiento = response.data.movimiento;
                this.estatusMovimiento = response.data.movimiento.estatus;
                this.habilitarDatosPaciente = false;
                this.puedeEditarDatosEncabezado = false;
                this.verBoton.concluir_modificacion = false;
                this.verBoton.modificar_salida = true;
              }
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

  validarOpcionSeleccionada(campo:string){
    setTimeout (() => {
      if(typeof this.formMovimiento.get(campo).value == 'string' && this.formMovimiento.get(campo).value != ''){
        this.formMovimiento.get(campo).setErrors({notSelected:true});
      }
    }, 100);
  }

  guardarMovimiento(concluir:boolean = false){
    if(this.formMovimiento.valid){
      let formData:any = this.formMovimiento.value;
      this.isSaving = true;

      formData.lista_articulos = this.dataSourceArticulos.data;
      formData.concluir = concluir;

      formData.programa_id = (formData.programa)?formData.programa.id:null;
      formData.unidad_medica_movimiento_id = (formData.unidad_medica_movimiento)?formData.unidad_medica_movimiento.id:null;
      formData.area_servicio_movimiento_id = (formData.area_servicio_movimiento)?formData.area_servicio_movimiento.id:null;
      formData.personal_medico_id = (formData.personal_medico)?formData.personal_medico.id:null;
      formData.fecha_movimiento = this.datepipe.transform(formData.fecha_movimiento, 'yyyy-MM-dd');
      
      //Validamos los articulos
      if(this.tieneSolicitud){
        let aritculos_en_cero = 0;

        formData.lista_articulos.forEach(articulo => {
          if(this.tieneSolicitud && (articulo.cantidad_solicitado == undefined || articulo.cantidad_solicitado <= 0)){
            let index = this.dataSourceArticulos.data.findIndex(x => x.id === articulo.id);
            let articulo_encontrado = JSON.parse(JSON.stringify(this.dataSourceArticulos.data[index]));
            this.dataSourceArticulos.data.splice(index,1);
            this.dataSourceArticulos.data.unshift(articulo_encontrado);
            aritculos_en_cero++;
          }
        });

        if(aritculos_en_cero > 0){
          this.articulosTable.renderRows();
          this.dataSourceArticulos.paginator = this.articulosPaginator;
          this.dataSourceArticulos.sort = this.sort;
          this.isSaving = false;
          this.idArticuloSeleccionado = this.dataSourceArticulos.data[0].id;
          this.sharedService.showSnackBar('Se encontraron '+aritculos_en_cero+' articulo(s) sin cantidad solicitada.', null, 6000);
          return false;
        }
      }
      
      this.salidasService.guardarSalida(formData).subscribe(
        response =>{
          if(response.error) {
            let errorMessage = response.error;
            this.sharedService.showSnackBar(errorMessage, null, 3000);
            if(response.code == 'solicitud_repetida'){
              console.log(response.data);
              let configDialog = {
                width: '50%',
                maxHeight: '90vh',
                height: '343px',
                data:{error:response.error, data:response.data},
                panelClass: 'no-padding-dialog'
              };
          
              const dialogRef = this.dialog.open(DialogoSolicitudRepetidaComponent, configDialog);
            }
          }else{
            this.formMovimiento.get('id').patchValue(response.data.id);
            this.estatusMovimiento = response.data.estatus;

            //this.datosMovimiento = {id: response.data.id, folio: response.data.folio};
            this.datosMovimiento = response.data;
            this.cargarDatosUsuarios(response.data);

            if(response.data.movimiento_hijo){
              this.movimientoHijo = response.data.movimiento_hijo;
            }

            if(response.data.solicitud){
              this.movimientoSolicitud = response.data.solicitud;
            }
            
            if(this.estatusMovimiento != 'BOR'){
              this.puedeEditarDatosEncabezado = false;
              this.puedeEditarListaArticulos = false;

              this.verBoton.concluir = false;
              this.verBoton.guardar = false,
              this.verBoton.agregar_articulos = false;
              this.verBoton.eliminar = false;

              this.verBoton.duplicar = true;
              this.verBoton.cancelar = true;
              this.verBoton.modificar_salida = true;
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
          this.sharedService.showSnackBar(errorMessage, null, 5000);
          this.isSaving = false;
        }
      );
    }
  }

  cancelarSalida(){
    let configDialog = {
      width: '350px',
      //maxHeight: '90vh',
      height: 'auto',
      data:{},
      panelClass: 'no-padding-dialog'
    };

    const dialogRef = this.dialog.open(DialogoCancelarMovimientoComponent, configDialog);

    dialogRef.afterClosed().subscribe(dialogResponse => {
      if(dialogResponse){
        let id = this.formMovimiento.get('id').value;
        this.salidasService.cancelarSalida(id,dialogResponse).subscribe(
          response =>{
            if(response.error) {
              let errorMessage = response.error;
              this.sharedService.showSnackBar(errorMessage, null, 3000);
            }else{
              this.sharedService.showSnackBar('Movimiento cancelado con exito', null, 3000);
              this.estatusMovimiento = 'CAN';
              this.verBoton.cancelar = false;
              this.verBoton.modificar_salida = false;
              this.cargarDatosUsuarios(response.data);
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
            console.log('Datos Salida: ',response.data);
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
              mostrar_montos: false,
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

  agregarPersonal(){
    let form_value = this.formMovimiento.get('personal_medico').value;
    if(typeof form_value === 'string'){
      let nuevo_personal:any = {
        id:null,
        nombre_completo: form_value,
        clave:'NEW',
      }
  
      setTimeout (() => {
        this.formMovimiento.get('personal_medico').patchValue(nuevo_personal);
        this.catalogos['personal_medico'].push(nuevo_personal);
      }, 100);
    }else if(typeof form_value === 'object'){
      this.formMovimiento.get('personal_medico').patchValue(form_value);
    }
  }

  buscarExpediente(){
    let expediente_clinico = this.formMovimiento.get('expediente_clinico').value;
    if(expediente_clinico && expediente_clinico != this.datosPacienteEstatus){
      this.cargandoDatosPaciente = true;
      this.formMovimiento.get('paciente_id').reset();
      //this.formMovimiento.get('paciente').reset();
      //this.formMovimiento.get('curp').reset();
      this.datosPacienteEstatus = 'Buscando Expediente...';
      this.salidasService.buscarPaciente(expediente_clinico).subscribe(
        response =>{
          if(response.error) {
            let errorMessage = response.error.message;
            this.sharedService.showSnackBar(errorMessage, null, 3000);
            this.cargandoDatosPaciente = false;
          }else{
            if(response.data){
              if(this.datosMovimiento && this.datosMovimiento.modificacion_activa && this.datosMovimiento.modificacion_activa.estatus == 'MOD'){
                this.habilitarDatosPaciente = true;
              }else{
                this.habilitarDatosPaciente = false;
              }
              this.datosPacienteEstatus = response.data.expediente_clinico;
              this.formMovimiento.get('paciente_id').patchValue(response.data.id);
              this.formMovimiento.get('paciente').patchValue(response.data.nombre_completo);
              this.formMovimiento.get('curp').patchValue(response.data.curp);
            }else{
              this.datosPacienteEstatus = 'Escribir los datos del paciente.';
              this.habilitarDatosPaciente = true;
            }
            this.cargandoDatosPaciente = false;
          }
        },
        errorResponse =>{
          var errorMessage = "Ocurrió un error.";
          if(errorResponse.status == 409){
            errorMessage = errorResponse.error.error.message;
          }
          this.sharedService.showSnackBar(errorMessage, null, 3000);
          this.cargandoDatosPaciente = false;
        }
      );
    }
  };

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

  cargarNuevaSalida(uri:string){
    this.router.navigateByUrl('/', {skipLocationChange: true}).then(()=>
    this.router.navigate([uri]));
  }

}
