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

  recepcionPendiente:boolean;
  formRecepcion:FormGroup;

  mostrarPanel:string;
  catalogos:any;

  totalAvanceRecepcion:number;
  totalRecibido:number;

  controlArticulosModificados:any;
  totalClavesRecibidas:number;

  dataSourceArticulos: MatTableDataSource<any>;

  ngOnInit(): void {
    this.clavesTotalesFiltro = {articulos:0};
    this.clavesTotales = {articulos:0};
    this.mostrarPanel = 'PEDIDO';
    this.progressBarMode = 'determinate';

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
        
        if(response.data.avance_recepcion){
          this.totalAvanceRecepcion = response.data.avance_recepcion.porcentaje_insumos;
        }else{
          this.totalAvanceRecepcion = 0;
        }

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

        if(this.totalRecibido > 0){
          this.totalAvanceRecepcion = Math.floor((this.totalRecibido/this.dataPedido.total_articulos)*100);
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
        console.log(response);
        
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

        /*if(insumo.total_piezas > 0){
          this.totalInsumosRecibidos -= insumo.total_piezas;
        }
        this.totalInsumosRecibidos += response.total_piezas;*/

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

    let fecha_hoy = formatDate(new Date(), 'yyyy-MM-dd', 'en');
    if(!this.formRecepcion){
      this.formRecepcion = this.formBuilder.group({
        almacen_id:['',Validators.required],
        fecha_movimiento:[fecha_hoy,[Validators.required, CustomValidator.isValidDate()]],
        entrega:['',Validators.required],
        recibe:['',Validators.required],
        id:['']
      });
    }else{
      this.formRecepcion.reset();
      this.formRecepcion.get('fecha_movimiento').setValue(fecha_hoy);
    }
    
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

