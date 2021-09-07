import { formatDate } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { CustomValidator } from '../../../utils/classes/custom-validator';
import { DialogoSubirArchivoComponent } from '../dialogo-subir-archivo/dialogo-subir-archivo.component';
import { DialogoLotesArticulosComponent } from '../dialogo-lotes-articulos/dialogo-lotes-articulos.component';
import { RecepcionPedidosService } from '../recepcion-pedidos.service';
import { SharedService } from '../../../shared/shared.service';
import { ConfirmActionDialogComponent } from 'src/app/utils/confirm-action-dialog/confirm-action-dialog.component';

@Component({
  selector: 'app-detalles-recepcion-pedido',
  templateUrl: './detalles-recepcion-pedido.component.html',
  styleUrls: ['./detalles-recepcion-pedido.component.css']
})
export class DetallesRecepcionPedidoComponent implements OnInit {

  constructor(
    private route: ActivatedRoute, 
    private recepcionPedidosService: RecepcionPedidosService, 
    private sharedService: SharedService,
    private dialog: MatDialog,
    private formBuilder: FormBuilder) { }

  isLoading:boolean;

  filtroArticulos:string;
  filtroAplicado:boolean;

  clavesTotalesFiltro:any;
  clavesTotales:any;

  dataPedido:any

  estatusEntradaManual:boolean;
  progressBarMode:string;

  totalRecepcionesAnteriores:number;
  recepcionPendiente:boolean;
  formRecepcion:FormGroup;

  mostrarPanel:string;
  catalogos:any;

  //porcentajeClaves:number;
  //porcentajeArticulos:number;
  totalRecibido:number;
  totalArticulosRecibidos:number;
  totalClavesRecibidas:number;

  recepcionActiva:boolean;
  idArticuloSeleccionado:number;
  recepcionesAnteriores:any[];

  controlArticulosModificados:any;
  
  dataSourceArticulos: MatTableDataSource<any>;

  ngOnInit(): void {
    this.clavesTotalesFiltro = {articulos:0};
    this.clavesTotales = {articulos:0};
    this.mostrarPanel = 'PEDIDO';
    this.progressBarMode = 'determinate';
    this.totalClavesRecibidas = 0;
    this.totalArticulosRecibidos = 0;
    //this.porcentajeClaves = 0;
    //this.porcentajeArticulos = 0;

    let fecha_hoy = formatDate(new Date(), 'yyyy-MM-dd', 'en');
    this.formRecepcion = this.formBuilder.group({
      almacen_id:['',Validators.required],
      fecha_movimiento:[fecha_hoy,[Validators.required, CustomValidator.isValidDate()]],
      entrega:['',Validators.required],
      recibe:['',Validators.required],
      id:['']
    });

    this.catalogos = {
      'almacenes': []
    };

    this.dataPedido = {};

    this.route.paramMap.subscribe(params => {
      if(params.get('id')){
        let id = params.get('id');
        this.cargarPedido(id);

        this.recepcionPedidosService.obtenerDatosCatalogo({pedido_id:id}).subscribe(
          response =>{
            if(response.error) {
              let errorMessage = response.error.message;
              this.sharedService.showSnackBar(errorMessage, null, 3000);
            } else {
              this.catalogos['almacenes'] = response.data.almacenes;
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

  cargarPedido(id){
    let lista_articulos = [];
    this.totalRecibido = 0;
    this.isLoading = true;

    this.recepcionPedidosService.verPedido(id).subscribe(
      response =>{
        this.dataPedido = response.data;

        /*if(this.dataPedido.avance_recepcion){
          this.porcentajeClaves = this.dataPedido.avance_recepcion.porcentaje_claves;
          this.porcentajeArticulos = this.dataPedido.avance_recepcion.porcentaje_articulos;
        }*/
        
        this.clavesTotales.articulos = response.data.lista_articulos.length;
        for(let i in response.data.lista_articulos){
          let articulo_server = response.data.lista_articulos[i];
          let articulo_raw = JSON.parse(JSON.stringify(articulo_server.articulo));

          let articulo:any = {
            id: articulo_raw.id,
            clave: (this.dataPedido.tipo_elemento_pedido.origen_articulo == 2)?articulo_raw.clave_local:articulo_raw.clave_cubs,
            nombre: articulo_raw.articulo,
            descripcion: articulo_raw.especificaciones,
            descontinuado: (articulo_raw.descontinuado)?true:false,
            partida_clave: articulo_raw.partida_especifica.clave,
            partida_descripcion: articulo_raw.partida_especifica.descripcion,
            familia: articulo_raw.nombre_familia,
          };

          articulo.cantidad = articulo_server.cantidad;
          articulo.recibido = articulo_server.cantidad_recibida|0;
          articulo.cantidad_restante = articulo.cantidad - articulo.recibido;
          articulo.agregado = 0;
          articulo.porcentaje = Math.floor((articulo.recibido/articulo.cantidad)*100);
          articulo.pedido_articulo_id = articulo_server.id;

          this.totalRecibido += articulo_server.cantidad_recibida|0;

          lista_articulos.push(articulo);
        }

        this.totalRecepcionesAnteriores = response.data.recepciones_anteriores.length;
        this.recepcionesAnteriores = response.data.recepciones_anteriores;
        if(response.data.recepcion_actual.length > 0){
          this.recepcionPendiente = true;
          this.controlArticulosModificados = {};

          let recepcion_borrador = response.data.recepcion_actual[0];
          this.formRecepcion.patchValue(recepcion_borrador);
          
          let lista_lotes_borrador:any = {};

          for(let i in recepcion_borrador.lista_articulos_borrador){
            let articulo_borrador = recepcion_borrador.lista_articulos_borrador[i];
            //console.log(articulo_borrador);
            
            if(!this.controlArticulosModificados[articulo_borrador.bien_servicio_id]){
              this.controlArticulosModificados[articulo_borrador.bien_servicio_id] = '*';
              this.totalClavesRecibidas++;
            }

            if(!lista_lotes_borrador[articulo_borrador.bien_servicio_id]){
              lista_lotes_borrador[articulo_borrador.bien_servicio_id] = {'lotes':[],'total_piezas':0};
            }
            lista_lotes_borrador[articulo_borrador.bien_servicio_id]['lotes'].push(articulo_borrador);
            lista_lotes_borrador[articulo_borrador.bien_servicio_id]['total_piezas'] += articulo_borrador.cantidad;
          }

          for(let articulo_id in lista_lotes_borrador){
            let articulo_borrador = lista_lotes_borrador[articulo_id];
            //articulo.agregado = 0;
            let index = lista_articulos.findIndex(x => x.id == articulo_id);
            let articulo = lista_articulos[index];
            
            this.totalArticulosRecibidos += articulo_borrador.total_piezas;
            
            articulo.lotes = articulo_borrador.lotes;
            articulo.total_piezas = articulo_borrador.total_piezas;
            articulo.agregado = Math.floor(((articulo.recibido+articulo.total_piezas)/articulo.cantidad)*100);

            lista_articulos.splice(index,1);
            lista_articulos.unshift(articulo);
          }
        }

        this.dataSourceArticulos = new MatTableDataSource<any>(lista_articulos);
        this.dataSourceArticulos.filterPredicate = (data:any, filter:string) => {
          let filtroTexto:boolean;
          let filtros = filter.split('|');

          //index:0 = texto a buscar
          if(filtros[0]){
            let filtro_query = filtros[0].toLowerCase();
            filtroTexto = data.clave.toLowerCase().includes(filtro_query) || data.nombre.toLowerCase().includes(filtro_query) || data.descripcion.toLowerCase().includes(filtro_query);
          }else{
            filtroTexto = true;
          }

          if(filtroTexto){
            this.clavesTotalesFiltro.articulos += 1
          }

          return filtroTexto;
        };

        this.cargarFiltroArticulos();
        this.isLoading = false;
      }
    );
  }

  cargarFiltroArticulos(){
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
    }
  }

  limpiarFiltroArticulos(){
    this.filtroArticulos = '';
    this.cargarFiltroArticulos();
  }

  verDialogoLotes(articulo){
    let configDialog:any = {
      width: '99%',
      maxHeight: '90vh',
      height: '643px',
      panelClass: 'no-padding-dialog'
    };

    console.log(articulo);
    
    configDialog.data = {articulo: articulo, editar: true};
    
    const dialogRef = this.dialog.open(DialogoLotesArticulosComponent, configDialog);

    dialogRef.afterClosed().subscribe(response => {
      if(response){
        //console.log(response);
        if(response.total_piezas > 0){
          if(!this.controlArticulosModificados[response.id]){
            this.controlArticulosModificados[response.id] = '*';
            this.totalClavesRecibidas++;
          }
        }else{
          this.controlArticulosModificados[response.id] = undefined;
          this.totalClavesRecibidas--;
        }

        let index = this.dataSourceArticulos.data.findIndex(x => x.id === response.id);
        let articulo = this.dataSourceArticulos.data[index];

        if(articulo.total_piezas > 0){
          this.totalArticulosRecibidos -= articulo.total_piezas;
        }
        this.totalArticulosRecibidos += response.total_piezas;

        this.dataSourceArticulos.data.splice(index,1);
        this.dataSourceArticulos.data.unshift(response);

        //this.recepcionActiva = (this.totalInsumosRecibidos > 0);
        
        //this.cargarPaginaInsumos();
        this.cargarFiltroArticulos();
      }else{
        console.log('Cancelar');
      }
    });
  }

  verDialogoArchivo(){
    let configDialog:any = {
      width: '99%',
      maxHeight: '90vh',
      panelClass: 'no-padding-dialog'
    };

    configDialog.data = {pedidoId: this.dataPedido.id};
    
    const dialogRef = this.dialog.open(DialogoSubirArchivoComponent, configDialog);

    dialogRef.afterClosed().subscribe(response => {
      if(response){
        this.cargarPedido(this.dataPedido.id);
      }else{
        console.log('Cancelar');
      }
    });
  }

  mostrarFormularioRecepcion(){
    this.mostrarPanel = 'ENTRADA';
    this.estatusEntradaManual = true;
    this.progressBarMode = 'buffer';

    if(!this.controlArticulosModificados){
      this.controlArticulosModificados = {};
    }
    
    /*let fecha_hoy = formatDate(new Date(), 'yyyy-MM-dd', 'en');
    if(!this.recepcionPendiente){
      this.formRecepcion.reset();
      this.formRecepcion.get('fecha_movimiento').setValue(fecha_hoy);
    }*/
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
      avance:{total_claves:this.totalClavesRecibidas, total_articulos:this.totalArticulosRecibidos},
      recepcion:this.formRecepcion.value,
      articulos_recibidos: [],
      concluir: concluir
    };

    for(let index in this.dataSourceArticulos.data){
      let articulo = this.dataSourceArticulos.data[index];
      if(articulo.lotes && articulo.lotes.length){
        for(let i in articulo.lotes){
          let lote:any = {
            id: articulo.lotes[i].id,
            cantidad: articulo.lotes[i].cantidad,
            lote: articulo.lotes[i].lote,
            fecha_caducidad: articulo.lotes[i].fecha_caducidad,
            codigo_barras: articulo.lotes[i].codigo_barras,
            bien_servicio_id: articulo.id
          };
          datosRecepcion.articulos_recibidos.push(lote);
        }
        
      }
    }
    
    this.isLoading = true;
    this.recepcionPedidosService.actualizarPedido(datosRecepcion,this.dataPedido.id).subscribe(
      response=>{
        //console.log(response);

        if(datosRecepcion.concluir){
          for(let id in this.controlArticulosModificados){
            if(this.controlArticulosModificados[id]){
              let index_local = this.dataSourceArticulos.data.findIndex(x => x.id == id);
              this.dataSourceArticulos.data[index_local].lotes = [];
              this.dataSourceArticulos.data[index_local].cantidad_restante -= this.dataSourceArticulos.data[index_local].total_piezas;
              this.dataSourceArticulos.data[index_local].recibido += this.dataSourceArticulos.data[index_local].total_piezas;
              this.dataSourceArticulos.data[index_local].porcentaje = Math.floor((this.dataSourceArticulos.data[index_local].recibido/this.dataSourceArticulos.data[index_local].cantidad)*100);
              this.dataSourceArticulos.data[index_local].total_piezas = 0;
              this.dataSourceArticulos.data[index_local].agregado = 0;
            }
          }

          if(response.data.avance_recepcion){
            this.dataPedido.avance_recepcion = response.data.avance_recepcion;
            //this.porcentajeClaves = response.data.avance_recepcion.porcentaje_claves;
            //this.porcentajeArticulos = response.data.avance_recepcion.porcentaje_articulos;
          }

          delete response.recepcion_reciente.lista_articulos_borrador;
          this.recepcionesAnteriores.unshift(response.recepcion_reciente);
          this.totalRecepcionesAnteriores = this.recepcionesAnteriores.length;

          this.controlArticulosModificados = {};
          this.formRecepcion.reset();
          this.recepcionActiva = true;
          this.idArticuloSeleccionado = 0;

          this.recepcionPendiente = false;
        }else{
          for(let id in this.controlArticulosModificados){
            if(this.controlArticulosModificados[id]){
              let index_local = this.dataSourceArticulos.data.findIndex(x => x.id == id);
              this.dataSourceArticulos.data[index_local].lotes = [];
            }
          }
          
          if(response.data.recepcion_actual && response.data.recepcion_actual.length && !datosRecepcion.concluir){
            for(let i in response.data.recepcion_actual[0].lista_articulos_borrador){
              let articulo_borrador = response.data.recepcion_actual[0].lista_articulos_borrador[i];
  
              let index_articulo = this.dataSourceArticulos.data.findIndex(x => x.id == articulo_borrador.bien_servicio_id);
              this.dataSourceArticulos.data[index_articulo].lotes.push(articulo_borrador);
            }
          }

          this.recepcionPendiente = true;
        }
        //this.listadoArticulosEliminados = [];
        
        this.sharedService.showSnackBar('Datos guardados con éxito', null, 3000);
        this.isLoading = false;
      }
    );
  }

  mostrarRecepciones(){
    this.mostrarPanel = 'RECEPCIONES';
    //
  }

  mostrarPedido(){
    this.mostrarPanel = 'PEDIDO';
    this.estatusEntradaManual = false;
    this.progressBarMode = 'determinate';
  }

  imprimirPedido(){
    //
  }

}

