import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { PedidosService } from '../../pedidos.service';
import { PedidosOrdinariosService } from '../pedidos-ordinarios.service';
import { SharedService } from '../../../shared/shared.service';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatInput } from '@angular/material/input';
import { MatDrawer } from '@angular/material/sidenav';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { DialogoArticuloPedidoComponent } from '../dialogo-articulo-pedido/dialogo-articulo-pedido.component';
import { DialogoSeleccionarUnidadesMedicasComponent } from '../dialogo-seleccionar-unidades-medicas/dialogo-seleccionar-unidades-medicas.component';
import { ConfirmActionDialogComponent } from '../../../utils/confirm-action-dialog/confirm-action-dialog.component';

@Component({
  selector: 'app-pedido',
  templateUrl: './pedido.component.html',
  styleUrls: ['./pedido.component.css']
})
export class PedidoComponent implements OnInit {
  @ViewChild(MatPaginator) articulosPaginator: MatPaginator;
  @ViewChild(MatDrawer) articulosDrawer: MatDrawer;
  @ViewChild(MatInput) busquedaArticuloQuery: MatInput;

  constructor(private formBuilder: FormBuilder, private pedidosService: PedidosService, private pedidosOrdinarios: PedidosOrdinariosService, private sharedService: SharedService, private dialog: MatDialog, private route: ActivatedRoute) { }

  mostrarBotonAgregarUnidades:boolean;
  listaUnidadesAsignadas:any[];
  unidadesConArticulos:any;

  unidadesSeleccionadas:any[];
  dataSourceUnidadesSeleccionadas:MatTableDataSource<any>;
  listaFiltroUnidadesSeleccionadas:any[];
  filtroUnidadesSeleccionadas:string;
  pedidoInternoSeleccionado:number;

  unidadMedicaEntrega:any;
  tipoDeElementoPedido:any;

  formPedido:FormGroup;
  catalogos:any;

  clavesTotales: any;
  clavesTotalesFiltro: any;
  clavesTotalesPedido: any;
  
  isLoadingArticulos:boolean;
  articuloQuery:string;
  listadoArticulos:any[];
  //busquedaTipoArticulo:string;
  idArticuloSeleccionado:number;

  controlArticulosModificados:any;
  listadoArticulosEliminados:any[];

  listadoArticulosPedido:any[];
  filtroArticulosPedido:any[];
  controlArticulosAgregados:any;
  selectedItemIndex:number;

  iconoMedicamento:string = 'assets/icons-ui/MED.svg';
  iconoMatCuracion:string = 'assets/icons-ui/MTC.svg';

  filtroArticulos:string;
  filtroTipoArticulo:string;
  filtroAplicado:boolean;

  //mostrarTarjetas:boolean = false;
  mostrarPedidosInternos:boolean = false;

  pageEvent: PageEvent;
  resultsLength: number = 0;
  currentPage: number = 0;
  pageSize: number = 9;
  dataSourceArticulos: MatTableDataSource<any>;

  displayedColumns: string[] = ['clave','nombre','cantidad','actions']; //'monto',

  editable:boolean;
  puedeEditarElementos:boolean;

  verBoton:any;
  isLoading:boolean;
  estatusPedido:string;
  estatusFolio:string;
  listaEstatusIconos: any = { 'BOR':'content_paste',  'CON':'description', 'VAL':'verified', 'PUB':'published_wit_changes', 'CAN':'cancel',    'EXP':'warning'  };
  listaEstatusClaves: any = { 'BOR':'borrador',       'CON':'concluido',   'VAL':'validado', 'PUB':'publicado',             'CAN':'cancelado', 'EXP':'expirado' };
  listaEstatusLabels: any = { 'BOR':'Borrador',       'CON':'Concluido',   'VAL':'Validado', 'PUB':'Publicado',             'CAN':'Cancelado', 'EXP':'Expirado' };
  
  ngOnInit() {
    let fecha_actual = new Date();

    this.editable = true;
    this.puedeEditarElementos = true;
    
    this.controlArticulosModificados = {};
    this.listadoArticulosEliminados = [];

    this.filtroTipoArticulo = '*';
    this.filtroArticulos = '';
    this.listadoArticulosPedido = [];
    this.controlArticulosAgregados = {};

    this.unidadesSeleccionadas = [];
    this.unidadesConArticulos = {};
    
    this.listadoArticulos = [];
    //this.busquedaTipoArticulo = '*';
    this.catalogos = {programas:[]};

    this.clavesTotales = { articulos: 0 };
    this.clavesTotalesPedido = { articulos: 0 };
    this.clavesTotalesFiltro = { articulos: 0 };

    this.verBoton = {'guardar':true, 'concluir':true, 'generar_folio':false, 'agregar_articulos':true, 'agregar_unidad':true};
    this.estatusPedido = 'NVO';
    
    this.catalogos.meses = [
      {clave:1,  etiqueta:'Enero'},
      {clave:2,  etiqueta:'Febrero'},
      {clave:3,  etiqueta:'Marzo'},
      {clave:4,  etiqueta:'Abril'},
      {clave:5,  etiqueta:'Mayo'},
      {clave:6,  etiqueta:'Junio'},
      {clave:7,  etiqueta:'Julio'},
      {clave:8,  etiqueta:'Agosto'},
      {clave:9,  etiqueta:'Septiembre'},
      {clave:10, etiqueta:'Octubre'},
      {clave:11, etiqueta:'Noviembre'},
      {clave:12, etiqueta:'Diciembre'},
    ];

    this.formPedido = this.formBuilder.group({
      unidad_medica_id:['',Validators.required],
      descripcion:['',Validators.required],
      mes:['',Validators.required],
      anio:['',Validators.required],
      programa_id:[''],
      observaciones:[''],
      tipo_elemento_pedido_id:[''],
      id:['']
    });

    this.pedidosService.obtenerDatosCatalogo({grupo_pedidos:true, programas:true}).subscribe(
      response =>{
        if(response.error) {
          let errorMessage = response.error.message;
          this.sharedService.showSnackBar(errorMessage, null, 3000);
        } else {
          if(response.data.grupo_pedidos.unidad_medica_principal){
            this.unidadMedicaEntrega = response.data.grupo_pedidos.unidad_medica_principal;
            this.formPedido.get('unidad_medica_id').patchValue(this.unidadMedicaEntrega.id);
          }

          if(response.data.grupo_pedidos.unidades_medicas.length > 1){
            this.mostrarBotonAgregarUnidades = true;
            this.listaUnidadesAsignadas = response.data.grupo_pedidos.unidades_medicas;
          }else{
            this.mostrarBotonAgregarUnidades = false;
          }
          
          if(response.data.catalogos){
            if(response.data.catalogos.programas && response.data.catalogos.programas.length){
              this.catalogos.programas = response.data.catalogos.programas;
            }
          }
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

    this.route.paramMap.subscribe(params => {
      if(params.get('id')){
        this.isLoading = true;
        let id = params.get('id');
        this.pedidosOrdinarios.verPedido(id).subscribe(
          response =>{
            this.formPedido.patchValue(response.data);
            if(response.data.tipo_elemento_pedido){
              this.tipoDeElementoPedido = response.data.tipo_elemento_pedido;
            }

            this.clavesTotalesPedido.articulos = response.data.lista_articulos.length;
            for(let i in response.data.lista_articulos){
              let articulo_server = response.data.lista_articulos[i];
              let articulo_raw = JSON.parse(JSON.stringify(articulo_server.articulo));

              let articulo:any = {
                id: articulo_raw.id,
                clave_cubs: articulo_raw.clave_cubs,
                clave_local: articulo_raw.clave_local,
                nombre: articulo_raw.articulo,
                descripcion: articulo_raw.especificaciones,
                descontinuado: (articulo_raw.descontinuado)?true:false,
                partida_clave: articulo_raw.partida_especifica.clave,
                partida_descripcion: articulo_raw.partida_especifica.descripcion,
                familia: articulo_raw.nombre_familia,
              };

              articulo.cantidad = articulo_server.cantidad;
              articulo.monto = articulo_server.monto;
              articulo.pedido_articulo_id = articulo_server.id;

              if(articulo_server.lista_articulos_unidades.length > 0){
                articulo.cuadro_distribucion = [];
                for(let j in articulo_server.lista_articulos_unidades){
                  articulo.cuadro_distribucion.push(
                    {id: articulo_server.lista_articulos_unidades[j].unidad_medica_id, cantidad: articulo_server.lista_articulos_unidades[j].cantidad}
                  );
                  if(!this.unidadesConArticulos[articulo_server.lista_articulos_unidades[j].unidad_medica_id]){
                    this.unidadesConArticulos[articulo_server.lista_articulos_unidades[j].unidad_medica_id] = 1;
                  }else{
                    this.unidadesConArticulos[articulo_server.lista_articulos_unidades[j].unidad_medica_id] += 1;
                  }
                }
              }

              this.listadoArticulosPedido.push(articulo);
              this.controlArticulosAgregados[articulo.id] = true;
            }

            if(response.data.lista_unidades_medicas.length > 0){
              for(let i in response.data.lista_unidades_medicas){
                this.unidadesSeleccionadas.push(response.data.lista_unidades_medicas[i].unidad_medica);
              }
            }

            this.cargarPaginaArticulos();
            this.isLoading = false;

            this.estatusPedido = response.data.estatus;
            if(response.data.estatus == 'CON' || response.data.estatus == 'PUB'){
              this.verBoton['concluir'] = false;
              this.verBoton['generar_folio'] = (response.data.estatus != 'PUB');
              this.verBoton['guardar'] = false;
              this.verBoton['agregar_articulos'] = false;
              this.verBoton['agregar_unidad'] = false;
              this.editable = false;
              this.puedeEditarElementos = false;

              this.estatusFolio = response.data.folio;

              let mes = this.catalogos.meses[response.data.mes-1];
              this.formPedido.addControl('mes_value',new FormControl(mes.etiqueta));

              let programa = 'Sin Programa';
              if(response.data.programa){
                programa = response.data.programa.descripcion;
              }
              this.formPedido.addControl('programa_value',new FormControl(programa));
            }
          }
        );
      }else{
        let tipo_pedido = 'MED';
        if(params.get('tipo')){
          tipo_pedido = params.get('tipo');
        }

        //mover arriba
        this.pedidosService.obtenerDatosCatalogo({tipos_pedido:true}).subscribe(
          response =>{
            if(response.error) {
              let errorMessage = response.error.message;
              this.sharedService.showSnackBar(errorMessage, null, 3000);
            } else {
              if(response.data.catalogos && response.data.catalogos['tipos_pedido']){
                let index = response.data.catalogos['tipos_pedido'].findIndex(x => x.clave === tipo_pedido);
                this.tipoDeElementoPedido = response.data.catalogos['tipos_pedido'][index];
                this.formPedido.get('tipo_elemento_pedido_id').patchValue(this.tipoDeElementoPedido.id);
              }
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

        this.formPedido.get('anio').patchValue(fecha_actual.getFullYear());
        this.formPedido.get('mes').patchValue(fecha_actual.getMonth()+1);
      }
    });
  }

  buscarArticulos(){
    this.listadoArticulos = [];
    this.isLoadingArticulos = true;
    let params = {
      query: this.articuloQuery,
      tipo_elemento: this.tipoDeElementoPedido.clave
    }

    this.pedidosService.buscarElementos(params).subscribe(
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
              partida_clave: response.data[i].partida_especifica.clave,
              partida_descripcion: response.data[i].partida_especifica.descripcion,
              familia: response.data[i].nombre_familia,
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

  cleanSearch(){
    this.articuloQuery = '';
  }

  cargarPaginaArticulos(event = null){
    let pedido_interno:any = {}
    if(this.pedidoInternoSeleccionado){
      pedido_interno = this.generarPedidoInterno();
    }

    if(pedido_interno.total_claves){
      this.clavesTotales = pedido_interno.total_claves;
    }else{
      this.clavesTotales = this.clavesTotalesPedido;
    }

    let listado_articulos_tabla:any[];
    if(pedido_interno.listado_articulos){
      listado_articulos_tabla = pedido_interno.listado_articulos;
    }else{
      listado_articulos_tabla = this.listadoArticulosPedido;
    }
    
    if(!this.dataSourceArticulos){
      this.dataSourceArticulos = new MatTableDataSource<any>(listado_articulos_tabla);
      
      this.dataSourceArticulos.filterPredicate = (data:any, filter:string) => {
        let filtroTexto:boolean;
        let filtros = filter.split('|');

        //index:0 = texto a buscar
        if(filtros[0]){
          let filtro_query = filtros[0].toLowerCase();
          let clave = (this.tipoDeElementoPedido.origen_articulo == 2)?data.clave_local:data.clave_cubs;
          filtroTexto = clave.toLowerCase().includes(filtro_query) || data.nombre.toLowerCase().includes(filtro_query) || data.descripcion.toLowerCase().includes(filtro_query);
        }else{
          filtroTexto = true;
        }

        if(filtroTexto){
          this.clavesTotalesFiltro.articulos += 1
        }

        return filtroTexto;
      };
    }else{
      this.dataSourceArticulos.data = listado_articulos_tabla;
    }
    this.dataSourceArticulos.paginator = this.articulosPaginator;
    this.aplicarFiltroArticulos();

    this.filtroArticulosPedido = this.dataSourceArticulos.connect().value;

    return event;
  }

  limpiarFiltroArticulos(){
    this.filtroArticulos = '';
    this.aplicarFiltroArticulos();
  }

  aplicarFiltroArticulos(){
    let filter_value;

    if(this.filtroArticulos){
      filter_value = this.filtroArticulos;
    }
    
    if(filter_value){
      this.filtroAplicado = true;
    }else{
      this.filtroAplicado = false;
    }

    this.clavesTotalesFiltro = { articulos: 0 };
    if(this.dataSourceArticulos){
      this.dataSourceArticulos.filter = filter_value;
      this.filtroArticulosPedido = this.dataSourceArticulos.connect().value;
    }
  }

  cerrarBuscadorArticulos(){
    this.articulosDrawer.close();
    this.cleanSearch();
    this.listadoArticulos = [];
    this.idArticuloSeleccionado = 0;
  }

  abrirBuscadorArticulos(){
    this.articuloQuery = '';
    this.articulosDrawer.open().finally(() => this.busquedaArticuloQuery.focus() );
  }

  seleccionarUnidades(){
    let hayArticulosCapturados:boolean = false;

    if(this.clavesTotalesPedido.articulos > 0){
      hayArticulosCapturados = true;
    }

    let configDialog = {
      width: '99%',
      maxHeight: '90vh',
      height: '643px',
      data:{listaUnidades: this.listaUnidadesAsignadas, listaSeleccionadas: this.unidadesSeleccionadas, unidadesConArticulos: this.unidadesConArticulos, hayArticulosCapturados: hayArticulosCapturados},
      panelClass: 'no-padding-dialog'
    };

    const dialogRef = this.dialog.open(DialogoSeleccionarUnidadesMedicasComponent, configDialog);

    dialogRef.afterClosed().subscribe(response => {
      if(response){
        this.unidadesSeleccionadas = response.unidadesSeleccionadas;

        //Al agregar unidades medicas con articulos capturados anteriormente.
        if(response.accion){
          if(response.accion.tipo_accion == 'DIV' || response.accion.tipo_accion == 'MUL'){
            for(let i in this.listadoArticulosPedido){
              let articulo = this.listadoArticulosPedido[i];

              let cantidad_unidades = 0;
              let residuo = 0;

              //((x - (x % y)) / y)
              if(response.accion.tipo_accion == 'DIV'){
                cantidad_unidades = ((articulo.cantidad - (articulo.cantidad % this.unidadesSeleccionadas.length)) / this.unidadesSeleccionadas.length);
                residuo = (articulo.cantidad % this.unidadesSeleccionadas.length);
              }else if(response.accion.tipo_accion == 'MUL'){
                cantidad_unidades = articulo.cantidad;
                articulo.cantidad = articulo.cantidad * this.unidadesSeleccionadas.length;
              }

              if(articulo.cuadro_distribucion && articulo.cuadro_distribucion.length){
                for(let j in articulo.cuadro_distribucion){
                  let unidad = articulo.cuadro_distribucion[j];
                  unidad.cantidad = 0;
                  this.unidadesConArticulos[unidad.id] -= 1;
                }
              }else{
                articulo.cuadro_distribucion = [];
              }

              for(let j in this.unidadesSeleccionadas){
                let unidad = JSON.parse(JSON.stringify(this.unidadesSeleccionadas[j]));
                unidad.cantidad = cantidad_unidades;
                articulo.cuadro_distribucion.push(unidad);

                if(!this.unidadesConArticulos[unidad.id]){
                  this.unidadesConArticulos[unidad.id] = 1;
                }else{
                  this.unidadesConArticulos[unidad.id] += 1;
                }
              }
              
              if(residuo > 0){
                for (let index = 0; index < residuo; index++) {
                  articulo.cuadro_distribucion[index].cantidad += 1;
                }
              }
            }
          }else if(response.accion.tipo_accion == 'SEL'){
            let unidad_seleccionada = response.accion.unidad_seleccionada;

            if(this.unidadesSeleccionadas.length > 0){
              let index = this.unidadesSeleccionadas.findIndex(x => x.id === unidad_seleccionada.id);

              for(let i in this.listadoArticulosPedido){
                let articulo = this.listadoArticulosPedido[i];

                articulo.cuadro_distribucion = [];
                let unidad = JSON.parse(JSON.stringify(this.unidadesSeleccionadas[index]));
                unidad.cantidad = articulo.cantidad;
                articulo.cuadro_distribucion.push(unidad);

                if(!this.unidadesConArticulos[unidad.id]){
                  this.unidadesConArticulos[unidad.id] = 1;
                }else{
                  this.unidadesConArticulos[unidad.id] += 1;
                }
              }
            }
          }
        }

        if(response.unidadesEliminarArticulos.length){
          let articulos_en_cero:number[] = [];

          for(let i in this.listadoArticulosPedido){
            let articulo = this.listadoArticulosPedido[i];
            let cantidad = 0;
            let ids_a_borrar = [];

            if(this.unidadesSeleccionadas.length > 0){
              for(let j in articulo.cuadro_distribucion){
                let unidad = articulo.cuadro_distribucion[j];
                let index = response.unidadesEliminarArticulos.indexOf(unidad.id);
                if(index >= 0){
                  cantidad += unidad.cantidad;
                  ids_a_borrar.push(unidad.id);
                }
              }
  
              if(cantidad > 0){
                articulo.cantidad -= cantidad;
                for(let j in ids_a_borrar){
                  let index = articulo.cuadro_distribucion.findIndex(x => x.id === ids_a_borrar[j]);
                  articulo.cuadro_distribucion.splice(index,1);
                }
              }
            }else{
              if(response.accion.tipo_accion == 'SEL'){
                let index = articulo.cuadro_distribucion.findIndex(x => x.id === response.accion.unidad_seleccionada.id);
                if(index >= 0){
                  cantidad = articulo.cuadro_distribucion[index].cantidad;
                }
                
                articulo.cuadro_distribucion = [];
                articulo.cantidad = cantidad;
              }else if(response.accion.tipo_accion == 'MAN'){
                articulo.cuadro_distribucion = [];
              }
            }

            if(articulo.cantidad == 0){
              articulos_en_cero.push(articulo.id);
            }
          }

          for(let i in articulos_en_cero){
            let articulo_index = this.listadoArticulosPedido.findIndex(x => x.id === articulos_en_cero[i]);

            let articulo_cero = JSON.parse(JSON.stringify(this.listadoArticulosPedido[articulo_index]));
            this.listadoArticulosPedido.splice(articulo_index,1);
            this.listadoArticulosPedido.unshift(articulo_cero);

            this.cargarPaginaArticulos();
          }

          for(let i in response.unidadesEliminarArticulos){
            let unidad_id = response.unidadesEliminarArticulos[i];
            this.unidadesConArticulos[unidad_id] = 0;
          }
        }
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
        if(this.pedidoInternoSeleccionado){
          let index = this.listadoArticulosPedido.findIndex(x => x.id === articulo.id);
          let articulo_pedido = this.listadoArticulosPedido[index];

          let index_unidad = articulo_pedido.cuadro_distribucion.findIndex(x => x.id === this.pedidoInternoSeleccionado);
          articulo_pedido.cuadro_distribucion.splice(index_unidad,1);
          articulo_pedido.cantidad -= articulo.cantidad;
          this.unidadesConArticulos[this.pedidoInternoSeleccionado] -= 1;
          
          if(articulo_pedido.cantidad == 0){
            this.controlArticulosAgregados[articulo_pedido.id] = false;

            this.clavesTotalesPedido.articulos -= 1;
            
            //Guardar para papelera
            let articulo_copia = JSON.parse(JSON.stringify(this.listadoArticulosPedido[index]));
            this.listadoArticulosEliminados.push(articulo_copia);
            
            this.listadoArticulosPedido.splice(index,1);
          }
        }else{
          this.controlArticulosAgregados[articulo.id] = false;

          this.clavesTotalesPedido.articulos -= 1;
          
          if(this.unidadesSeleccionadas.length > 0 && articulo.cuadro_distribucion.length > 0){
            for(let i in articulo.cuadro_distribucion){
              let unidad = articulo.cuadro_distribucion[i];
              if(this.unidadesConArticulos[unidad.id]){
                this.unidadesConArticulos[unidad.id] -= 1;
              }
            }
          }

          let index = this.listadoArticulosPedido.findIndex(x => x.id === articulo.id);

          //Guardar para papelera
          let articulo_copia = JSON.parse(JSON.stringify(this.listadoArticulosPedido[index]));
          this.listadoArticulosEliminados.push(articulo_copia);

          this.listadoArticulosPedido.splice(index,1);
        }
        
        this.cargarPaginaArticulos();
      }
    });
  }

  agregarArticulo(articulo){
    this.idArticuloSeleccionado = articulo.id;

    let configDialog:any = {
      width: '99%',
      maxHeight: '90vh',
      //data:{},
      panelClass: 'no-padding-dialog'
    };

    if(this.pedidoInternoSeleccionado){
      let index = this.unidadesSeleccionadas.findIndex(x => x.id === this.pedidoInternoSeleccionado);
      configDialog.data = {articuloInfo: articulo, listaUnidades: [], unidadEntrega: this.unidadesSeleccionadas[index]};
    }else{
      if(this.controlArticulosAgregados[articulo.id]){
        let index = this.listadoArticulosPedido.findIndex(x => x.id === articulo.id);
        articulo = this.listadoArticulosPedido[index];
      }
      
      if(this.unidadesSeleccionadas.length > 0){
        configDialog.height = '643px';
      }
      configDialog.data = {articuloInfo: articulo, listaUnidades: this.unidadesSeleccionadas, unidadEntrega: this.unidadMedicaEntrega};
    }
    
    const dialogRef = this.dialog.open(DialogoArticuloPedidoComponent, configDialog);

    dialogRef.afterClosed().subscribe(response => {
      if(response){

        if(!this.controlArticulosAgregados[response.id]){
          this.controlArticulosModificados[response.id] = '(+)';
          this.listadoArticulosPedido.unshift(response);
          this.clavesTotalesPedido.articulos = this.listadoArticulosPedido.length;
          
          this.controlArticulosAgregados[response.id] = true;
        }else{
          let index = this.listadoArticulosPedido.findIndex(x => x.id === response.id);
          
          if(!this.pedidoInternoSeleccionado){
            let modificado:boolean = false;
            let articulo_anterior = this.listadoArticulosPedido[index];

            if(articulo_anterior.cantidad != response.cantidad ){
              modificado = true;
            }else if(articulo_anterior.cuadro_distribucion && response.cuadro_distribucion){
              if(JSON.stringify(articulo_anterior.cuadro_distribucion) != JSON.stringify(response.cuadro_distribucion)){
                modificado = true;
              }
            }
            
            if(articulo_anterior.cuadro_distribucion && articulo_anterior.cuadro_distribucion.length > 0){
              for(let i in articulo_anterior.cuadro_distribucion){
                let unidad = articulo_anterior.cuadro_distribucion[i];
                if(this.unidadesConArticulos[unidad.id]){
                  this.unidadesConArticulos[unidad.id] -= 1;
                }
              }
            }

            if(modificado && !this.controlArticulosModificados[response.id]){
              this.controlArticulosModificados[response.id] = '(*)';
            }
  
            if(index > 0){
              this.listadoArticulosPedido.splice(index,1);
              this.listadoArticulosPedido.unshift(response);
            }else{
              this.listadoArticulosPedido[index] = response;
            }
          }else{
            let articulo_pedido = this.listadoArticulosPedido[index];

            let unidad_index = articulo_pedido.cuadro_distribucion.findIndex(x => x.id === this.pedidoInternoSeleccionado);
            let cantidad_anterior = articulo_pedido.cuadro_distribucion[unidad_index].cantidad;

            if(cantidad_anterior != response.cantidad){
              articulo_pedido.cuadro_distribucion[unidad_index].cantidad = response.cantidad;
              articulo_pedido.cantidad -= cantidad_anterior;
              articulo_pedido.cantidad += response.cantidad;

              if(!this.controlArticulosModificados[articulo_pedido.id]){
                this.controlArticulosModificados[articulo_pedido.id] = '(*)';
              }
            }
          }
        }

        if(this.unidadesSeleccionadas.length > 0 && response.cuadro_distribucion.length > 0){
          for(let i in response.cuadro_distribucion){
            let unidad = response.cuadro_distribucion[i];
            if(!this.unidadesConArticulos[unidad.id]){
              this.unidadesConArticulos[unidad.id] = 0;
            }
            this.unidadesConArticulos[unidad.id] += 1;
          }
        }

        this.cargarPaginaArticulos();
      }else{
        console.log('Cancelar');
      }
    });
  }

  aplicarFiltroUnidadesSeleccionadas(){
    this.dataSourceUnidadesSeleccionadas.filter = this.filtroUnidadesSeleccionadas;
    this.listaFiltroUnidadesSeleccionadas = this.dataSourceUnidadesSeleccionadas.connect().value;
  }

  generarPedidoInterno(){
    let pedido_interno:any = {
      listado_articulos: [],
      total_claves: { articulos:0 }
    }

    if(this.pedidoInternoSeleccionado){
      for(let i in this.listadoArticulosPedido){
        let articulo = JSON.parse(JSON.stringify(this.listadoArticulosPedido[i]));
        let unidad_index = articulo.cuadro_distribucion.findIndex(x => x.id === this.pedidoInternoSeleccionado);
        if(unidad_index >= 0){
          let cantidad = articulo.cuadro_distribucion[unidad_index].cantidad;
          articulo.cuadro_distribucion = [];
          articulo.cantidad = cantidad;
          
          pedido_interno.listado_articulos.unshift(articulo);
          pedido_interno.total_claves.articulos += 1;
        }
      }
    }
    return pedido_interno;
  }

  verPedidosInternos(){
    if(!this.dataSourceUnidadesSeleccionadas){
      this.dataSourceUnidadesSeleccionadas = new MatTableDataSource<any>(this.unidadesSeleccionadas);
      this.dataSourceUnidadesSeleccionadas.filterPredicate = (data:any, filter:string) => {
        let filtroTexto:boolean;
        let filtro = filter.trim();

        if(filtro && filtro != ''){
          filtro = filtro.toLowerCase()
          filtroTexto = data.clues.toLowerCase().includes(filtro) || data.nombre.toLowerCase().includes(filtro);
        }else{
          filtroTexto = true;
        }
        
        return filtroTexto;
      };
    }else{
      this.dataSourceUnidadesSeleccionadas.data = this.unidadesSeleccionadas;
    }
    this.listaFiltroUnidadesSeleccionadas = this.dataSourceUnidadesSeleccionadas.connect().value;
    this.mostrarPedidosInternos = true;
  }

  cerrarPedidosInternos(){
    this.mostrarPedidosInternos = false;
    this.filtroUnidadesSeleccionadas = '';
    this.listaFiltroUnidadesSeleccionadas = [];
    if(this.pedidoInternoSeleccionado){
      this.pedidoInternoSeleccionado = 0;
      this.cargarPaginaArticulos();
    }
  }

  mostrarArticulosPedidoInterno(unidad){
    if(this.unidadesConArticulos[unidad.id]){
      this.pedidoInternoSeleccionado = unidad.id;
      this.cargarPaginaArticulos();
    }    
  }

  ocultarArticulosPedidoInterno(){
    this.pedidoInternoSeleccionado = 0;
    this.cargarPaginaArticulos();
  }

  concluirPedido(){
    const dialogRef = this.dialog.open(ConfirmActionDialogComponent, {
      width: '500px',
      data:{dialogTitle:'¿Desea concluir la captura del pedido?', dialogMessage:'Al concluir la captura del pedido no se podrán realizar mas cambios, escriba CONCLUIR para aceptar el proceso.', validationString:'CONCLUIR', btnColor:'primary', btnText:'Aceptar'}
    });

    dialogRef.afterClosed().subscribe(valid => {
      if(valid){
        this.guardarPedido(true);
      }
    });
  }

  generarFolio(){
    const dialogRef = this.dialog.open(ConfirmActionDialogComponent, {
      width: '500px',
      data:{dialogTitle:'¿Desea generar el folio?', dialogMessage:'Al generar el folio de este pedido no se podrán realizar mas cambios, escriba GENERAR para continuar.', validationString:'GENERAR', btnColor:'primary', btnText:'Aceptar'}
    });

    dialogRef.afterClosed().subscribe(valid => {
      if(valid){
        this.guardarPedido(true,true);
      }
    });
  }

  guardarPedido(concluir:boolean = false, generar_folio:boolean = false){
    let datosPedido:any = {
      pedido: this.formPedido.value,
      articulos_pedido: this.listadoArticulosPedido,
      unidades_pedido: this.unidadesSeleccionadas,
      concluir: concluir
    };

    if(generar_folio){
      datosPedido.generar_folio = true;
    }

    this.isLoading = true;
    if(datosPedido.pedido.id){
      this.pedidosOrdinarios.actualizarPedido(datosPedido,datosPedido.pedido.id).subscribe(
        response=>{
          this.formPedido.patchValue(response.data);
          
          for(let id in this.controlArticulosModificados){
            if(this.controlArticulosModificados[id]){
              let index_servidor = response.data.lista_articulos.findIndex(x => x.bien_servicio_id == id);
              let pedido_articulo_id = response.data.lista_articulos[index_servidor].id;

              let index_local = this.listadoArticulosPedido.findIndex(x => x.id == id);
              this.listadoArticulosPedido[index_local].pedido_articulo_id = pedido_articulo_id;
            }
          }
          this.controlArticulosModificados = {};
          this.listadoArticulosEliminados = [];
          
          this.sharedService.showSnackBar('Datos guardados con éxito', null, 3000);

          this.estatusPedido = response.data.estatus;
          if(response.data.estatus == 'CON' || response.data.estatus == 'PUB'){
            this.verBoton['concluir'] = false;
            this.verBoton['generar_folio'] = (response.data.estatus != 'PUB');
            this.verBoton['guardar'] = false;
            this.verBoton['agregar_articulos'] = false;
            this.verBoton['agregar_unidad'] = false;
            this.editable = false;
            this.puedeEditarElementos = false;

            let mes = this.catalogos.meses[response.data.mes-1];
            this.formPedido.addControl('mes_value',new FormControl(mes.etiqueta));

            let programa = 'Sin Programa';
            if(response.data.programa){
              programa = response.data.programa.descripcion;
            }
            this.formPedido.addControl('programa_value',new FormControl(programa));
          }
          this.isLoading = false;
        }
      );
    }else{
      this.pedidosOrdinarios.crearPedido(datosPedido).subscribe(
        response =>{
          this.formPedido.patchValue(response.data);

          for(let id in this.controlArticulosModificados){
            if(this.controlArticulosModificados[id]){
              let index_servidor = response.data.lista_articulos.findIndex(x => x.bien_servicio_id == id);
              let pedido_articulo_id = response.data.lista_articulos[index_servidor].id;

              let index_local = this.listadoArticulosPedido.findIndex(x => x.id == id);
              this.listadoArticulosPedido[index_local].pedido_articulo_id = pedido_articulo_id;
            }
          }
          this.controlArticulosModificados = {};
          this.listadoArticulosEliminados = [];
          this.sharedService.showSnackBar('Datos guardados con éxito', null, 3000);
          this.isLoading = false;
        }
      );
    }
  }
}
