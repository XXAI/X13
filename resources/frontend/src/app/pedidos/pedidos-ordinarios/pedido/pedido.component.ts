import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PedidosService } from '../../pedidos.service';
import { PedidosOrdinariosService } from '../pedidos-ordinarios.service';
import { SharedService } from '../../../shared/shared.service';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatDrawer, MatInput, MatTableDataSource } from '@angular/material';
import { MatDialog } from '@angular/material/dialog';
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

  constructor(private formBuilder: FormBuilder, private pedidosService: PedidosService, private pedidosOrdinarios: PedidosOrdinariosService, private sharedService: SharedService, private dialog: MatDialog) { }

  tituloGrupoPedidos: string;
  mostrarBotonAgregarUnidades:boolean;
  unidadesSeleccionadas:any[];
  listaUnidadesAsignadas:any[];
  unidadesConInsumos:any;

  unidadMedicaEntrega:any;

  formPedido:FormGroup;
  catalogos:any;
  clavesTotales: any;
  clavesTotalesFiltro: any;

  isLoadingInsumos:boolean;
  insumoQuery:string;
  listadoInsumos:any[];
  busquedaTipoInsumo:string;
  idInsumoSeleccionado:number;

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

  pageEvent: PageEvent;
  resultsLength: number = 0;
  currentPage: number = 0;
  pageSize: number = 9;
  dataSourceInsumos: MatTableDataSource<any>;

  displayedColumns: string[] = ['clave','nombre','cantidad','actions']; //'monto',

  ngOnInit() {
    let fecha_actual = new Date();

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

    //Si es crear nuevo Pedido
    this.formPedido.get('anio').patchValue(fecha_actual.getFullYear());
    this.formPedido.get('mes').patchValue(fecha_actual.getMonth()+1);

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

          this.tituloGrupoPedidos = response.data.grupo_pedidos.descripcion;
          if(response.data.grupo_pedidos.unidades_medicas.length > 0){
            this.mostrarBotonAgregarUnidades = true;
            this.listaUnidadesAsignadas = response.data.grupo_pedidos.unidades_medicas;
          }else{
            this.mostrarBotonAgregarUnidades = false;
            //this.listaUnidadesAsignadas = response.data.grupo_pedidos.unidades_medicas;
            //this.unidadesSeleccionadas.push(response.data.grupo_pedidos.unidades_medicas[0]);
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

    this.cargarPaginaInsumos();
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
    if(this.dataSourceInsumos){
      this.dataSourceInsumos.disconnect();
    }

    this.dataSourceInsumos = new MatTableDataSource<any>(this.listadoInsumosPedido);
    this.dataSourceInsumos.paginator = this.insumosPaginator;

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

    if(this.clavesTotales.insumos > 0){
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

        if(response.unidadesEliminarInsumos.length){
          for(let i in this.listadoInsumosPedido){
            let insumo = this.listadoInsumosPedido[i];
            let cantidad = 0;
            let ids_a_borrar = [];
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
        this.controlInsumosAgregados[insumo.id] = false;

        this.clavesTotales.insumos -= 1;
        if(insumo.tipo_insumo == 'MED'){
          this.clavesTotales.medicamentos -= 1;
        }else{
          this.clavesTotales.mat_curacion -= 1;
        }

        if(this.unidadesSeleccionadas.length > 1 && insumo.cuadro_distribucion.length > 0){
          for(let i in insumo.cuadro_distribucion){
            let unidad = insumo.cuadro_distribucion[i];
            if(this.unidadesConInsumos[unidad.id]){
              this.unidadesConInsumos[unidad.id] -= 1;
            }
          }
        }

        let index = this.listadoInsumosPedido.findIndex(x => x.id === insumo.id);
        this.listadoInsumosPedido.splice(index,1);

        this.cargarPaginaInsumos();
      }
    });
  }

  agregarInsumo(insumo){
    this.idInsumoSeleccionado = insumo.id;

    if(this.controlInsumosAgregados[insumo.id]){
      let index = this.listadoInsumosPedido.findIndex(x => x.id === insumo.id);
      insumo = this.listadoInsumosPedido[index];
    }

    let configDialog:any = {
      width: '99%',
      maxHeight: '90vh',
      data:{insumoInfo: insumo, listaUnidades: this.unidadesSeleccionadas, unidadEntrega: this.unidadMedicaEntrega},
      panelClass: 'no-padding-dialog'
    };

    if(this.unidadesSeleccionadas.length > 0){
      configDialog.height = '643px';
    }

    const dialogRef = this.dialog.open(DialogoInsumoPedidoComponent, configDialog);

    dialogRef.afterClosed().subscribe(response => {
      if(response){
        if(!this.controlInsumosAgregados[response.id]){
          this.listadoInsumosPedido.unshift(response);
          this.clavesTotales.insumos = this.listadoInsumosPedido.length;
          
          if(response.tipo_insumo == 'MED'){
            this.clavesTotales.medicamentos += 1;
          }else{
            this.clavesTotales.mat_curacion += 1;
          }
          this.controlInsumosAgregados[response.id] = true;
        }else{
          let index = this.listadoInsumosPedido.findIndex(x => x.id === response.id);

          let insumo_anterior = this.listadoInsumosPedido[index];
          if(insumo_anterior.cuadro_distribucion && insumo_anterior.cuadro_distribucion.length > 0){
            for(let i in insumo_anterior.cuadro_distribucion){
              let unidad = insumo_anterior.cuadro_distribucion[i];
              if(this.unidadesConInsumos[unidad.id]){
                this.unidadesConInsumos[unidad.id] -= 1;
              }
            }
          }

          if(index > 0){
            this.listadoInsumosPedido.splice(index,1);
            this.listadoInsumosPedido.unshift(response);
          }else{
            this.listadoInsumosPedido[index] = response;
          }
        }

        if(this.unidadesSeleccionadas.length > 1 && response.cuadro_distribucion.length > 0){
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

  verUnidadesSeleccionadas(){
    console.log('Proximamente');
  }

  guardarPedido(concluir:boolean = false){
    let datosPedido = {
      pedido: this.formPedido.value,
      insumosPedido: this.listadoInsumosPedido,
      unidadesPedido: this.unidadesSeleccionadas,
      concluir: concluir
    };

    if(datosPedido.pedido.id){
      this.pedidosOrdinarios.actualizarPedido(datosPedido,datosPedido.pedido.id).subscribe(
        response=>{
          if(response.guardado){
            this.sharedService.showSnackBar('Datos guardados con éxito', null, 3000);
          }
        }
      );
    }else{
      this.pedidosOrdinarios.crearPedido(datosPedido).subscribe(
        response =>{
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