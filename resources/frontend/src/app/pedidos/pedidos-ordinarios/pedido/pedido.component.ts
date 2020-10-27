import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PedidosService } from '../../pedidos.service';
import { PedidosOrdinariosService } from '../pedidos-ordinarios.service';
import { SharedService } from '../../../shared/shared.service';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatDrawer, MatInput, MatTableDataSource } from '@angular/material';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { DialogoInsumoPedidoComponent } from '../dialogo-insumo-pedido/dialogo-insumo-pedido.component';
import { DialogoSeleccionarUnidadesMedicasComponent } from '../dialogo-seleccionar-unidades-medicas/dialogo-seleccionar-unidades-medicas.component';
import { ConfirmActionDialogComponent } from '../../../utils/confirm-action-dialog/confirm-action-dialog.component';

@Component({
  selector: 'app-pedido',
  templateUrl: './pedido.component.html',
  styleUrls: ['./pedido.component.css']
})
export class PedidoComponent implements OnInit {
  @ViewChild(MatPaginator, {static: false}) insumosPaginator: MatPaginator;
  @ViewChild(MatDrawer, {static: false}) insumosDrawer: MatDrawer;
  @ViewChild(MatInput, {static: false}) busquedaInsumoQuery: MatInput;

  constructor(private formBuilder: FormBuilder, private pedidosService: PedidosService, private pedidosOrdinarios: PedidosOrdinariosService, private sharedService: SharedService, private dialog: MatDialog, private route: ActivatedRoute) { }

  mostrarBotonAgregarUnidades:boolean;
  listaUnidadesAsignadas:any[];
  unidadesConInsumos:any;

  unidadesSeleccionadas:any[];
  dataSourceUnidadesSeleccionadas:MatTableDataSource<any>;
  listaFiltroUnidadesSeleccionadas:any[];
  filtroUnidadesSeleccionadas:string;
  pedidoInternoSeleccionado:number;

  unidadMedicaEntrega:any;

  formPedido:FormGroup;
  catalogos:any;

  clavesTotales: any;
  clavesTotalesFiltro: any;
  clavesTotalesPedido: any;
  
  isLoadingInsumos:boolean;
  insumoQuery:string;
  listadoInsumos:any[];
  busquedaTipoInsumo:string;
  idInsumoSeleccionado:number;

  controlInsumosModificados:any;
  listadoInsumosEliminados:any[];

  listadoInsumosPedido:any[];
  filtroInsumosPedido:any[];
  controlInsumosAgregados:any;
  selectedItemIndex:number;

  iconoMedicamento:string = 'assets/icons-ui/MED.svg';
  iconoMatCuracion:string = 'assets/icons-ui/MTC.svg';

  filtroInsumos:string;
  filtroTipoInsumos:string;
  filtroAplicado:boolean;

  mostrarTarjetas:boolean = false;
  mostrarPedidosInternos:boolean = false;

  pageEvent: PageEvent;
  resultsLength: number = 0;
  currentPage: number = 0;
  pageSize: number = 9;
  dataSourceInsumos: MatTableDataSource<any>;

  displayedColumns: string[] = ['clave','nombre','cantidad','actions']; //'monto',

  ngOnInit() {
    let fecha_actual = new Date();
    
    this.controlInsumosModificados = {};
    this.listadoInsumosEliminados = [];

    this.filtroTipoInsumos = '*';
    this.filtroInsumos = '';
    this.listadoInsumosPedido = [];
    this.controlInsumosAgregados = {};

    this.unidadesSeleccionadas = [];
    this.unidadesConInsumos = {};
    
    this.listadoInsumos = [];
    this.busquedaTipoInsumo = '*';
    this.catalogos = {programas:[]};

    this.clavesTotales = { insumos: 0, medicamentos: 0, mat_curacion: 0 };
    this.clavesTotalesPedido = { insumos: 0, medicamentos: 0, mat_curacion: 0 };
    this.clavesTotalesFiltro = { insumos: 0, medicamentos: 0, mat_curacion: 0 };
    
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
      id:['']
    });

    this.pedidosService.obtenerDatosCatalogo().subscribe(
      response =>{
        if(response.error) {
          let errorMessage = response.error.message;
          this.sharedService.showSnackBar(errorMessage, null, 3000);
        } else {
          if(response.data.grupo_pedidos.unidad_medica_principal){
            this.unidadMedicaEntrega = response.data.grupo_pedidos.unidad_medica_principal;
            this.formPedido.get('unidad_medica_id').patchValue(this.unidadMedicaEntrega.id);
          }

          if(response.data.grupo_pedidos.unidades_medicas.length > 0){
            this.mostrarBotonAgregarUnidades = true;
            this.listaUnidadesAsignadas = response.data.grupo_pedidos.unidades_medicas;
          }else{
            this.mostrarBotonAgregarUnidades = false;
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
        let id = params.get('id');
        this.pedidosOrdinarios.verPedido(id).subscribe(
          response =>{
            console.log(response);
            this.formPedido.patchValue(response.data);
            this.clavesTotalesPedido.insumos = response.data.lista_insumos_medicos.length;
            for(let i in response.data.lista_insumos_medicos){
              let insumo_server = response.data.lista_insumos_medicos[i];
              let insumo = JSON.parse(JSON.stringify(insumo_server.insumo_medico));

              insumo.cantidad = insumo_server.cantidad;
              insumo.monto = insumo_server.monto;
              insumo.pedido_insumo_id = insumo_server.id;

              this.listadoInsumosPedido.push(insumo);
              this.controlInsumosAgregados[insumo.id] = true;

              if(insumo.tipo_insumo == 'MED'){
                this.clavesTotalesPedido.medicamentos += 1;
              }else{
                this.clavesTotalesPedido.mat_curacion += 1;
              }
            }
            this.cargarPaginaInsumos();
          }
        );
      }else{
        this.formPedido.get('anio').patchValue(fecha_actual.getFullYear());
        this.formPedido.get('mes').patchValue(fecha_actual.getMonth()+1);
      }
    });
  }

  applySearch(){
    this.listadoInsumos = [];
    this.isLoadingInsumos = true;
    let params = {
      query: this.insumoQuery,
      tipo_insumo: this.busquedaTipoInsumo
    }

    this.pedidosService.buscarInsumos(params).subscribe(
      response =>{
        if(response.error) {
          let errorMessage = response.error.message;
          this.sharedService.showSnackBar(errorMessage, null, 3000);
        } else {
          this.listadoInsumos = response.data;
        }
        this.isLoadingInsumos = false;
      },
      errorResponse =>{
        var errorMessage = "Ocurrió un error.";
        if(errorResponse.status == 409){
          errorMessage = errorResponse.error.error.message;
        }
        this.sharedService.showSnackBar(errorMessage, null, 3000);
        this.isLoadingInsumos = false;
      }
    );
  }

  cleanSearch(){
    this.insumoQuery = '';
  }

  cargarPaginaInsumos(event = null){
    /*if(this.dataSourceInsumos){
      this.dataSourceInsumos.disconnect();
    }*/
    let pedido_interno:any = {}
    if(this.pedidoInternoSeleccionado){
      pedido_interno = this.generarPedidoInterno();
    }

    if(pedido_interno.total_claves){
      this.clavesTotales = pedido_interno.total_claves;
    }else{
      this.clavesTotales = this.clavesTotalesPedido;
    }

    let listado_insumos_tabla:any[];
    if(pedido_interno.listado_insumos){
      listado_insumos_tabla = pedido_interno.listado_insumos;
    }else{
      listado_insumos_tabla = this.listadoInsumosPedido;
    }
    
    if(!this.dataSourceInsumos){
      this.dataSourceInsumos = new MatTableDataSource<any>(listado_insumos_tabla);
      
      this.dataSourceInsumos.filterPredicate = (data:any, filter:string) => {
        let filtroTexto:boolean;
        let filtroTipo:boolean;
        let filtros = filter.split('|');

        //index:0 = tipo insumo
        if(filtros[0] != '*'){
          filtroTipo = data.tipo_insumo == filtros[0];
        }else{
          filtroTipo = true;
        }
        
        //index:1 = texto a buscar
        if(filtros[1]){
          filtros[1] = filtros[1].toLowerCase()
          filtroTexto = data.clave.toLowerCase().includes(filtros[1]) || data.nombre_generico.toLowerCase().includes(filtros[1]) || data.descripcion.toLowerCase().includes(filtros[1]);
        }else{
          filtroTexto = true;
        }

        if(filtroTexto){
          this.clavesTotalesFiltro.insumos += 1
          if(data.tipo_insumo == 'MED'){
            this.clavesTotalesFiltro.medicamentos += 1;
          }else{
            this.clavesTotalesFiltro.mat_curacion += 1;
          }
        }

        return filtroTexto && filtroTipo;
      };
    }else{
      this.dataSourceInsumos.data = listado_insumos_tabla;
    }
    this.dataSourceInsumos.paginator = this.insumosPaginator;
    this.aplicarFiltroInsumos();

    this.filtroInsumosPedido = this.dataSourceInsumos.connect().value;

    return event;
  }

  limpiarFiltroInsumos(){
    this.filtroInsumos = '';
    this.filtroTipoInsumos = '*';
    this.aplicarFiltroInsumos();
  }

  aplicarFiltroInsumos(){
    let filter_value;

    if(this.filtroInsumos || this.filtroTipoInsumos != '*'){
      filter_value = this.filtroTipoInsumos + '|' + this.filtroInsumos;
    }
    
    if(filter_value){
      this.filtroAplicado = true;
    }else{
      this.filtroAplicado = false;
    }

    this.clavesTotalesFiltro = { insumos: 0, medicamentos: 0, mat_curacion: 0 };
    this.dataSourceInsumos.filter = filter_value;
    this.filtroInsumosPedido = this.dataSourceInsumos.connect().value;
  }

  cerrarBuscadorInsumos(){
    this.insumosDrawer.close();
    this.cleanSearch();
    this.listadoInsumos = [];
    this.busquedaTipoInsumo = '*';
    this.idInsumoSeleccionado = 0;
  }

  abrirBuscadorInsumos(){
    this.insumosDrawer.open().finally(() => this.busquedaInsumoQuery.focus() );
  }

  seleccionarUnidades(){
    let hayInsumosCapturados:boolean = false;

    if(this.clavesTotalesPedido.insumos > 0){
      hayInsumosCapturados = true;
    }

    let configDialog = {
      width: '99%',
      maxHeight: '90vh',
      height: '643px',
      data:{listaUnidades: this.listaUnidadesAsignadas, listaSeleccionadas: this.unidadesSeleccionadas, unidadesConInsumos: this.unidadesConInsumos, hayInsumosCapturados: hayInsumosCapturados},
      panelClass: 'no-padding-dialog'
    };

    const dialogRef = this.dialog.open(DialogoSeleccionarUnidadesMedicasComponent, configDialog);

    dialogRef.afterClosed().subscribe(response => {
      if(response){
        this.unidadesSeleccionadas = response.unidadesSeleccionadas;

        //Al agregar unidades medicas con insumos capturados anteriormente.
        if(response.accion){
          if(response.accion.tipo_accion == 'DIV' || response.accion.tipo_accion == 'MUL'){
            for(let i in this.listadoInsumosPedido){
              let insumo = this.listadoInsumosPedido[i];

              let cantidad_unidades = 0;
              let residuo = 0;

              //((x - (x % y)) / y)
              if(response.accion.tipo_accion == 'DIV'){
                cantidad_unidades = ((insumo.cantidad - (insumo.cantidad % this.unidadesSeleccionadas.length)) / this.unidadesSeleccionadas.length);
                residuo = (insumo.cantidad % this.unidadesSeleccionadas.length);
              }else if(response.accion.tipo_accion == 'MUL'){
                cantidad_unidades = insumo.cantidad;
                insumo.cantidad = insumo.cantidad * this.unidadesSeleccionadas.length;
              }

              if(insumo.cuadro_distribucion && insumo.cuadro_distribucion.length){
                for(let j in insumo.cuadro_distribucion){
                  let unidad = insumo.cuadro_distribucion[j];
                  unidad.cantidad = 0;
                  this.unidadesConInsumos[unidad.id] -= 1;
                }
              }else{
                insumo.cuadro_distribucion = [];
              }

              for(let j in this.unidadesSeleccionadas){
                let unidad = JSON.parse(JSON.stringify(this.unidadesSeleccionadas[j]));
                unidad.cantidad = cantidad_unidades;
                insumo.cuadro_distribucion.push(unidad);

                if(!this.unidadesConInsumos[unidad.id]){
                  this.unidadesConInsumos[unidad.id] = 1;
                }else{
                  this.unidadesConInsumos[unidad.id] += 1;
                }
              }
              
              if(residuo > 0){
                for (let index = 0; index < residuo; index++) {
                  insumo.cuadro_distribucion[index].cantidad += 1;
                }
              }
            }
          }else if(response.accion.tipo_accion == 'SEL'){
            let unidad_seleccionada = response.accion.unidad_seleccionada;

            if(this.unidadesSeleccionadas.length > 0){
              let index = this.unidadesSeleccionadas.findIndex(x => x.id === unidad_seleccionada.id);

              for(let i in this.listadoInsumosPedido){
                let insumo = this.listadoInsumosPedido[i];

                insumo.cuadro_distribucion = [];
                let unidad = JSON.parse(JSON.stringify(this.unidadesSeleccionadas[index]));
                unidad.cantidad = insumo.cantidad;
                insumo.cuadro_distribucion.push(unidad);

                if(!this.unidadesConInsumos[unidad.id]){
                  this.unidadesConInsumos[unidad.id] = 1;
                }else{
                  this.unidadesConInsumos[unidad.id] += 1;
                }
              }
            }
          }
        }

        if(response.unidadesEliminarInsumos.length){
          let insumos_en_cero:number[] = [];

          for(let i in this.listadoInsumosPedido){
            let insumo = this.listadoInsumosPedido[i];
            let cantidad = 0;
            let ids_a_borrar = [];

            if(this.unidadesSeleccionadas.length > 0){
              for(let j in insumo.cuadro_distribucion){
                let unidad = insumo.cuadro_distribucion[j];
                let index = response.unidadesEliminarInsumos.indexOf(unidad.id);
                if(index >= 0){
                  cantidad += unidad.cantidad;
                  ids_a_borrar.push(unidad.id);
                }
              }
  
              if(cantidad > 0){
                insumo.cantidad -= cantidad;
                //this.listadoInsumosPedido[i] = insumo;
                for(let j in ids_a_borrar){
                  let index = insumo.cuadro_distribucion.findIndex(x => x.id === ids_a_borrar[j]);
                  insumo.cuadro_distribucion.splice(index,1);
                }
              }
            }else{
              if(response.accion.tipo_accion == 'SEL'){
                let index = insumo.cuadro_distribucion.findIndex(x => x.id === response.accion.unidad_seleccionada.id);
                if(index >= 0){
                  cantidad = insumo.cuadro_distribucion[index].cantidad;
                }
                
                insumo.cuadro_distribucion = [];
                insumo.cantidad = cantidad;
              }else if(response.accion.tipo_accion == 'MAN'){
                insumo.cuadro_distribucion = [];
              }
            }

            if(insumo.cantidad == 0){
              insumos_en_cero.push(insumo.id);
            }
          }

          for(let i in insumos_en_cero){
            let insumo_index = this.listadoInsumosPedido.findIndex(x => x.id === insumos_en_cero[i]);

            let insumo_cero = JSON.parse(JSON.stringify(this.listadoInsumosPedido[insumo_index]));
            this.listadoInsumosPedido.splice(insumo_index,1);
            this.listadoInsumosPedido.unshift(insumo_cero);

            this.cargarPaginaInsumos();
          }

          for(let i in response.unidadesEliminarInsumos){
            let unidad_id = response.unidadesEliminarInsumos[i];
            this.unidadesConInsumos[unidad_id] = 0;
          }
        }
      }else{
        console.log('Cancelar');
      }
    });
  }

  quitarInsumo(insumo){
    const dialogRef = this.dialog.open(ConfirmActionDialogComponent, {
      width: '500px',
      data:{dialogTitle:'Eliminar Insumo',dialogMessage:'Esta seguro de eliminar este insumo?',btnColor:'warn',btnText:'Eliminar'}
    });

    dialogRef.afterClosed().subscribe(valid => {
      if(valid){
        if(this.pedidoInternoSeleccionado){
          let index = this.listadoInsumosPedido.findIndex(x => x.id === insumo.id);
          let insumo_pedido = this.listadoInsumosPedido[index];

          let index_unidad = insumo_pedido.cuadro_distribucion.findIndex(x => x.id === this.pedidoInternoSeleccionado);
          insumo_pedido.cuadro_distribucion.splice(index_unidad,1);
          insumo_pedido.cantidad -= insumo.cantidad;
          this.unidadesConInsumos[this.pedidoInternoSeleccionado] -= 1;
          
          if(insumo_pedido.cantidad == 0){
            this.controlInsumosAgregados[insumo_pedido.id] = false;

            this.clavesTotalesPedido.insumos -= 1;
            if(insumo_pedido.tipo_insumo == 'MED'){
              this.clavesTotalesPedido.medicamentos -= 1;
            }else{
              this.clavesTotalesPedido.mat_curacion -= 1;
            }

            //Guardar para papelera
            let insumo_copia = JSON.parse(JSON.stringify(this.listadoInsumosPedido[index]));
            this.listadoInsumosEliminados.push(insumo_copia);
            
            this.listadoInsumosPedido.splice(index,1);
          }
        }else{
          this.controlInsumosAgregados[insumo.id] = false;

          this.clavesTotalesPedido.insumos -= 1;
          if(insumo.tipo_insumo == 'MED'){
            this.clavesTotalesPedido.medicamentos -= 1;
          }else{
            this.clavesTotalesPedido.mat_curacion -= 1;
          }

          if(this.unidadesSeleccionadas.length > 0 && insumo.cuadro_distribucion.length > 0){
            for(let i in insumo.cuadro_distribucion){
              let unidad = insumo.cuadro_distribucion[i];
              if(this.unidadesConInsumos[unidad.id]){
                this.unidadesConInsumos[unidad.id] -= 1;
              }
            }
          }

          let index = this.listadoInsumosPedido.findIndex(x => x.id === insumo.id);

          //Guardar para papelera
          let insumo_copia = JSON.parse(JSON.stringify(this.listadoInsumosPedido[index]));
          this.listadoInsumosEliminados.push(insumo_copia);

          this.listadoInsumosPedido.splice(index,1);
        }
        
        this.cargarPaginaInsumos();
      }
    });
  }

  agregarInsumo(insumo){
    this.idInsumoSeleccionado = insumo.id;

    let configDialog:any = {
      width: '99%',
      maxHeight: '90vh',
      //data:{},
      panelClass: 'no-padding-dialog'
    };

    if(this.pedidoInternoSeleccionado){
      let index = this.unidadesSeleccionadas.findIndex(x => x.id === this.pedidoInternoSeleccionado);
      configDialog.data = {insumoInfo: insumo, listaUnidades: [], unidadEntrega: this.unidadesSeleccionadas[index]};
    }else{
      if(this.controlInsumosAgregados[insumo.id]){
        let index = this.listadoInsumosPedido.findIndex(x => x.id === insumo.id);
        insumo = this.listadoInsumosPedido[index];
      }
      
      if(this.unidadesSeleccionadas.length > 0){
        configDialog.height = '643px';
      }
      configDialog.data = {insumoInfo: insumo, listaUnidades: this.unidadesSeleccionadas, unidadEntrega: this.unidadMedicaEntrega};
    }
    

    const dialogRef = this.dialog.open(DialogoInsumoPedidoComponent, configDialog);

    dialogRef.afterClosed().subscribe(response => {
      if(response){

        if(!this.controlInsumosAgregados[response.id]){
          this.controlInsumosModificados[response.id] = '(+)';
          this.listadoInsumosPedido.unshift(response);
          this.clavesTotalesPedido.insumos = this.listadoInsumosPedido.length;
          
          if(response.tipo_insumo == 'MED'){
            this.clavesTotalesPedido.medicamentos += 1;
          }else{
            this.clavesTotalesPedido.mat_curacion += 1;
          }
          this.controlInsumosAgregados[response.id] = true;
        }else{
          let index = this.listadoInsumosPedido.findIndex(x => x.id === response.id);
          
          if(!this.pedidoInternoSeleccionado){
            let modificado:boolean = false;
            let insumo_anterior = this.listadoInsumosPedido[index];

            if(insumo_anterior.cantidad != response.cantidad ){
              modificado = true;
            }else if(insumo_anterior.cuadro_distribucion && response.cuadro_distribucion){
              if(JSON.stringify(insumo_anterior.cuadro_distribucion) != JSON.stringify(response.cuadro_distribucion)){
                modificado = true;
              }
            }
            
            if(insumo_anterior.cuadro_distribucion && insumo_anterior.cuadro_distribucion.length > 0){
              for(let i in insumo_anterior.cuadro_distribucion){
                let unidad = insumo_anterior.cuadro_distribucion[i];
                if(this.unidadesConInsumos[unidad.id]){
                  this.unidadesConInsumos[unidad.id] -= 1;
                }
              }
            }

            if(modificado && !this.controlInsumosModificados[response.id]){
              this.controlInsumosModificados[response.id] = '(*)';
            }
  
            if(index > 0){
              this.listadoInsumosPedido.splice(index,1);
              this.listadoInsumosPedido.unshift(response);
            }else{
              this.listadoInsumosPedido[index] = response;
            }
          }else{
            let insumo_pedido = this.listadoInsumosPedido[index];

            let unidad_index = insumo_pedido.cuadro_distribucion.findIndex(x => x.id === this.pedidoInternoSeleccionado);
            let cantidad_anterior = insumo_pedido.cuadro_distribucion[unidad_index].cantidad;

            if(cantidad_anterior != response.cantidad){
              insumo_pedido.cuadro_distribucion[unidad_index].cantidad = response.cantidad;
              insumo_pedido.cantidad -= cantidad_anterior;
              insumo_pedido.cantidad += response.cantidad;

              if(!this.controlInsumosModificados[insumo_pedido.id]){
                this.controlInsumosModificados[insumo_pedido.id] = '(*)';
              }
            }
          }
        }

        if(this.unidadesSeleccionadas.length > 0 && response.cuadro_distribucion.length > 0){
          for(let i in response.cuadro_distribucion){
            let unidad = response.cuadro_distribucion[i];
            if(!this.unidadesConInsumos[unidad.id]){
              this.unidadesConInsumos[unidad.id] = 0;
            }
            this.unidadesConInsumos[unidad.id] += 1;
          }
        }

        this.cargarPaginaInsumos();
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
      listado_insumos: [],
      total_claves: {insumos:0, medicamentos:0, mat_curacion:0}
    }

    if(this.pedidoInternoSeleccionado){
      for(let i in this.listadoInsumosPedido){
        let insumo = JSON.parse(JSON.stringify(this.listadoInsumosPedido[i]));
        let unidad_index = insumo.cuadro_distribucion.findIndex(x => x.id === this.pedidoInternoSeleccionado);
        if(unidad_index >= 0){
          let cantidad = insumo.cuadro_distribucion[unidad_index].cantidad;
          insumo.cuadro_distribucion = [];
          insumo.cantidad = cantidad;
          
          pedido_interno.listado_insumos.unshift(insumo);

          pedido_interno.total_claves.insumos += 1;
          if(insumo.tipo_insumo == 'MED'){
            pedido_interno.total_claves.medicamentos += 1;
          }else{
            pedido_interno.total_claves.mat_curacion += 1;
          }
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
      this.cargarPaginaInsumos();
    }
  }

  mostrarInsumosPedidoInterno(unidad){
    if(this.unidadesConInsumos[unidad.id]){
      this.pedidoInternoSeleccionado = unidad.id;
      this.cargarPaginaInsumos();
    }    
  }

  ocultarInsumosPedidoInterno(){
    this.pedidoInternoSeleccionado = 0;
    this.cargarPaginaInsumos();
  }

  guardarPedido(concluir:boolean = false){
    let datosPedido = {
      pedido: this.formPedido.value,
      insumos_pedido: this.listadoInsumosPedido,
      unidades_pedido: this.unidadesSeleccionadas,
      concluir: concluir
    };

    if(datosPedido.pedido.id){
      this.pedidosOrdinarios.actualizarPedido(datosPedido,datosPedido.pedido.id).subscribe(
        response=>{
          this.formPedido.patchValue(response.data);
          
          for(let id in this.controlInsumosModificados){
            if(this.controlInsumosModificados[id]){
              let index_servidor = response.data.lista_insumos_medicos.findIndex(x => x.insumo_medico_id == id);
              let pedido_insumo_id = response.data.lista_insumos_medicos[index_servidor].id;

              let index_local = this.listadoInsumosPedido.findIndex(x => x.id == id);
              this.listadoInsumosPedido[index_local].pedido_insumo_id = pedido_insumo_id;
            }
          }
          this.controlInsumosModificados = {};
          this.listadoInsumosEliminados = [];
          
          this.sharedService.showSnackBar('Datos guardados con éxito', null, 3000);
        }
      );
    }else{
      this.pedidosOrdinarios.crearPedido(datosPedido).subscribe(
        response =>{
          this.formPedido.patchValue(response.data);

          for(let id in this.controlInsumosModificados){
            if(this.controlInsumosModificados[id]){
              let index_servidor = response.data.lista_insumos_medicos.findIndex(x => x.insumo_medico_id == id);
              let pedido_insumo_id = response.data.lista_insumos_medicos[index_servidor].id;

              let index_local = this.listadoInsumosPedido.findIndex(x => x.id == id);
              this.listadoInsumosPedido[index_local].pedido_insumo_id = pedido_insumo_id;
            }
          }
          this.controlInsumosModificados = {};
          this.listadoInsumosEliminados = [];
          this.sharedService.showSnackBar('Datos guardados con éxito', null, 3000);
        }
      );
    }
  }
}


/* Creando insumos fixticios, solo para fines de pruebas */
/*
    let total_resultados = Math.floor(Math.random() * (150 - 1 + 1) + 1);
    for (let index = 0; index < total_resultados; index++) {
      let tipo_insumo = 0;

      if(this.busquedaTipoInsumo == 'MED'){
        tipo_insumo = 10;
      }else if(this.busquedaTipoInsumo == 'MTC'){
        tipo_insumo = 1;
      }else{
        tipo_insumo = Math.floor(Math.random() * (10 - 1 + 1)) + 1;
      }

      let id = Math.floor(Math.random() * (1000 - 1 + 1) + 1);

      let clave = id+"";
      while (clave.length < 4) clave = "0" + clave;

      this.listadoInsumos.push({
        id:id,
        icono:(tipo_insumo < 5)?this.iconoMatCuracion:this.iconoMedicamento,
        tipo_insumo:(tipo_insumo < 5)?'MTC':'MED',
        clave:'0052.0136.0025.'+clave,
        //color:(tipo_insumo < 5)?'coral':'cornflowerblue',
        nombre:'REACTIVOS Y JUEGOS DE REACTIVOS',
        info:'informacion del medicamento',
        descripcion:'The Shiba Inu is the smallest of the six original and distinct spitz breeds of dog from Japan. A small, agile dog that copes very well with mountainous terrain, the Shiba Inu was originally bred for hunting.'
      });
    }
    */