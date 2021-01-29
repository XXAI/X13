import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { CustomValidator } from '../../../utils/classes/custom-validator';
import { PedidosService } from '../../pedidos.service';
import { RecepcionPedidosService } from '../recepcion-pedidos.service';
import { SharedService } from '../../../shared/shared.service';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatDrawer, MatInput, MatTableDataSource } from '@angular/material';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { DialogoLotesInsumoComponent } from '../dialogo-lotes-insumo/dialogo-lotes-insumo.component';
//import { DialogoInsumoPedidoComponent } from '../dialogo-insumo-pedido/dialogo-insumo-pedido.component';
//import { DialogoSeleccionarUnidadesMedicasComponent } from '../dialogo-seleccionar-unidades-medicas/dialogo-seleccionar-unidades-medicas.component';
import { ConfirmActionDialogComponent } from '../../../utils/confirm-action-dialog/confirm-action-dialog.component';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-pedido',
  templateUrl: './pedido.component.html',
  styleUrls: ['./pedido.component.css']
})
export class PedidoComponent implements OnInit {
  @ViewChild(MatPaginator, {static: false}) insumosPaginator: MatPaginator;

  constructor(private formBuilder: FormBuilder, private recepcionPedidosService: RecepcionPedidosService, private sharedService: SharedService, private dialog: MatDialog, private route: ActivatedRoute) { }

  recepcionActiva:boolean;
  listaRecepcionesAnteriores:any[];
  unidadMedicaEntrega:any;
  totalAvanceRecepcion:number;
  totalInsumosRecibidos:number;
  totalClavesRecibidas:number;

  mostrarBotonAgregarUnidades:boolean;
  listaUnidadesAsignadas:any[];
  unidadesConInsumos:any;

  unidadesSeleccionadas:any[];
  dataSourceUnidadesSeleccionadas:MatTableDataSource<any>;
  listaFiltroUnidadesSeleccionadas:any[];
  filtroUnidadesSeleccionadas:string;
  pedidoInternoSeleccionado:number;

  formRecepcion:FormGroup;
  dataPedido:any;
  catalogos:any;

  clavesTotales: any;
  clavesTotalesFiltro: any;
  clavesTotalesPedido: any;
  
  idInsumoSeleccionado:number;

  controlInsumosModificados:any;

  listadoInsumosPedido:any[];
  filtroInsumosPedido:any[];

  iconoMedicamento:string = 'assets/icons-ui/MED.svg';
  iconoMatCuracion:string = 'assets/icons-ui/MTC.svg';

  filtroInsumos:string;
  filtroTipoInsumos:string;
  filtroAplicado:boolean;

  mostrarRecepcionesAnteriores:boolean = false;

  pageEvent: PageEvent;
  resultsLength: number = 0;
  currentPage: number = 0;
  pageSize: number = 9;
  dataSourceInsumos: MatTableDataSource<any>;

  displayedColumns: string[] = ['clave','nombre','cantidad','total','actions']; //'monto',

  isLoading:boolean;
  
  ngOnInit() {
    this.recepcionActiva = false;
    this.dataPedido = {};
    this.listaRecepcionesAnteriores = [];
    this.totalAvanceRecepcion = 0;
    this.totalInsumosRecibidos = 0;
    this.totalClavesRecibidas = 0;
    
    this.controlInsumosModificados = {};

    this.filtroTipoInsumos = '*';
    this.filtroInsumos = '';
    this.listadoInsumosPedido = [];
    
    this.unidadesSeleccionadas = [];
    
    this.catalogos = {almacenes:[]};

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

    let fecha_hoy = formatDate(new Date(), 'yyyy-MM-dd', 'en');

    this.formRecepcion = this.formBuilder.group({
      almacen_id:['',Validators.required],
      fecha_movimiento:[fecha_hoy,[Validators.required, CustomValidator.isValidDate()]],
      entrega:['',Validators.required],
      recibe:['',Validators.required],
      id:['']
    });
    
    this.route.paramMap.subscribe(params => {
      this.isLoading = true;
      let id = params.get('id');

      this.recepcionPedidosService.verPedido(id).subscribe(
        response =>{
          this.dataPedido.id = response.data.id;
          this.dataPedido.descripcion = response.data.descripcion;
          this.dataPedido.observaciones = response.data.observaciones;
          this.dataPedido.anio = response.data.anio;

          this.dataPedido.mes = this.catalogos.meses[response.data.mes-1].etiqueta;
          this.dataPedido.programa = (response.data.programa)?response.data.programa.descripcion:'Sin Programa';

          this.unidadMedicaEntrega = response.data.unidad_medica;
          this.listaRecepcionesAnteriores = response.data.recepciones_anteriores;

          if(response.data.avance_recepcion){
            this.totalAvanceRecepcion = response.data.avance_recepcion.porcentaje_insumos;
          }

          this.catalogos.almacenes = response.data.unidad_medica.almacenes;
          if(this.catalogos.almacenes.length == 1){
            this.formRecepcion.get('almacen_id').patchValue(this.catalogos.almacenes[0].id);
          }

          this.clavesTotalesPedido.insumos = response.data.lista_insumos_medicos.length;

          for(let i in response.data.lista_insumos_medicos){
            let insumo_server = response.data.lista_insumos_medicos[i];
            let insumo = JSON.parse(JSON.stringify(insumo_server.insumo_medico));

            insumo.cantidad = insumo_server.cantidad;
            insumo.monto = insumo_server.monto;
            insumo.pedido_insumo_id = insumo_server.id;

            this.listadoInsumosPedido.push(insumo);
            
            if(insumo.tipo_insumo == 'MED'){
              this.clavesTotalesPedido.medicamentos += 1;
            }else{
              this.clavesTotalesPedido.mat_curacion += 1;
            }
          }

          if(response.data.recepcion_actual.length > 0){
            this.formRecepcion.patchValue(response.data.recepcion_actual[0]);
            this.recepcionActiva = true;

            if(response.data.recepcion_actual[0].lista_insumos_borrador.length > 0){
              for(let i in response.data.recepcion_actual[0].lista_insumos_borrador){
                let insumo_borrador = response.data.recepcion_actual[0].lista_insumos_borrador[i];
                let index = this.listadoInsumosPedido.findIndex(x => x.id === insumo_borrador.insumo_medico_id);
                let insumo = this.listadoInsumosPedido[index];
                if(!insumo.lotes){
                  insumo.lotes = [];
                  insumo.total_piezas = 0;
                }
                insumo.lotes.push(insumo_borrador);
                insumo.total_piezas += insumo_borrador.cantidad;
                this.totalInsumosRecibidos += insumo_borrador.cantidad;

                if(!this.controlInsumosModificados[insumo.id]){
                  this.controlInsumosModificados[insumo.id] = '*';
                  this.listadoInsumosPedido.splice(index,1);
                  this.listadoInsumosPedido.unshift(insumo);
                }
              }
            }
          }

          this.cargarPaginaInsumos();
          this.isLoading = false;
        }
      );
    });
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

  agregarLote(insumo){
    //console.log(insumo);
    //console.log('#################################################################################');
    this.idInsumoSeleccionado = insumo.id;

    let configDialog:any = {
      width: '99%',
      maxHeight: '90vh',
      height: '643px',
      data:{insumo: insumo},
      panelClass: 'no-padding-dialog'
    };

    const dialogRef = this.dialog.open(DialogoLotesInsumoComponent, configDialog); 

    dialogRef.afterClosed().subscribe(response => {
      if(response){
        //console.log(response);
        if(response.total_piezas > 0){
          if(!this.controlInsumosModificados[response.id]){
            this.controlInsumosModificados[response.id] = '*';
            this.totalClavesRecibidas++;
          }
        }else{
          this.controlInsumosModificados[response.id] = undefined;
          this.totalClavesRecibidas--;
        }

        let index = this.listadoInsumosPedido.findIndex(x => x.id === response.id);

        let insumo = this.listadoInsumosPedido[index];
        if(insumo.total_piezas > 0){
          this.totalInsumosRecibidos -= insumo.total_piezas;
        }
        this.totalInsumosRecibidos += response.total_piezas;

        this.listadoInsumosPedido.splice(index,1);
        this.listadoInsumosPedido.unshift(response);

        this.recepcionActiva = (this.totalInsumosRecibidos > 0);
        
        this.cargarPaginaInsumos();
      }
    });
  }

  aplicarFiltroUnidadesSeleccionadas(){
    this.dataSourceUnidadesSeleccionadas.filter = this.filtroUnidadesSeleccionadas;
    this.listaFiltroUnidadesSeleccionadas = this.dataSourceUnidadesSeleccionadas.connect().value;
  }

  generarPedidoInterno(){}

  verRecepcionesAnteriores(){
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
    this.mostrarRecepcionesAnteriores = true;
  }

  cerrarRecepcionesAnteriores(){
    this.mostrarRecepcionesAnteriores = false;
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

  concluirRecepcion(){
    const dialogRef = this.dialog.open(ConfirmActionDialogComponent, {
      width: '500px',
      data:{dialogTitle:'¿Desea concluir la recepción?', dialogMessage:'Al concluir la recepción no se podrán realizar mas cambios, escriba CONCLUIR para aceptar el proceso.', validationString:'CONCLUIR', btnColor:'primary', btnText:'Aceptar'}
    });

    dialogRef.afterClosed().subscribe(valid => {
      if(valid){
        this.guardarRecepcion(true);
      }
    });
  }

  guardarRecepcion(concluir:boolean = false){
    let datosRecepcion:any = {
      avance:{total_claves:this.totalClavesRecibidas, total_insumos:this.totalInsumosRecibidos},
      recepcion:this.formRecepcion.value,
      insumos_recibidos: [],
      concluir: concluir
    };

    for(let index in this.listadoInsumosPedido){
      let insumo = this.listadoInsumosPedido[index];
      if(insumo.lotes && insumo.lotes.length){
        for(let i in insumo.lotes){
          let lote:any = {
            id: insumo.lotes[i].id,
            cantidad: insumo.lotes[i].cantidad,
            lote: insumo.lotes[i].lote,
            fecha_caducidad: insumo.lotes[i].fecha_caducidad,
            codigo_barras: insumo.lotes[i].codigo_barras,
            insumo_medico_id: insumo.id
          };
          datosRecepcion.insumos_recibidos.push(lote);
        }
        
      }
    }
    //TODO: Aumento en el avance de insumos, al guardar mas de una vez el borrador

    this.isLoading = true;
    this.recepcionPedidosService.actualizarPedido(datosRecepcion,this.dataPedido.id).subscribe(
      response=>{
        //this.formPedido.patchValue(response.data);
        console.log(response);

        for(let id in this.controlInsumosModificados){
          if(this.controlInsumosModificados[id]){
            let index_local = this.listadoInsumosPedido.findIndex(x => x.id == id);
            this.listadoInsumosPedido[index_local].lotes = [];
          }
        }

        if(response.data.recepcion_actual && response.data.recepcion_actual.length){
          for(let i in response.data.recepcion_actual[0].lista_insumos_borrador){
            let insumo_borrador = response.data.recepcion_actual[0].lista_insumos_borrador[i];

            let index_insumo = this.listadoInsumosPedido.findIndex(x => x.id == insumo_borrador.insumo_medico_id);
            this.listadoInsumosPedido[index_insumo].lotes.push(insumo_borrador);
          }
        }

        if(datosRecepcion.concluir){
          this.controlInsumosModificados = {};
        }
        //this.listadoInsumosEliminados = [];
        
        this.sharedService.showSnackBar('Datos guardados con éxito', null, 3000);
        this.isLoading = false;
      }
    );
  }
}