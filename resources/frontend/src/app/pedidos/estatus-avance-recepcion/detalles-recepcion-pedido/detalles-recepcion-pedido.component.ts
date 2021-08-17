import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { DialogoSubirArchivoComponent } from '../dialogo-subir-archivo/dialogo-subir-archivo.component';
import { EstatusAvanceRecepcionService } from '../estatus-avance-recepcion.service';

@Component({
  selector: 'app-detalles-recepcion-pedido',
  templateUrl: './detalles-recepcion-pedido.component.html',
  styleUrls: ['./detalles-recepcion-pedido.component.css']
})
export class DetallesRecepcionPedidoComponent implements OnInit {

  constructor(private route: ActivatedRoute, private estatusAvanceService: EstatusAvanceRecepcionService, private dialog: MatDialog) { }

  isLoading:boolean;

  filtroArticulos:string;
  filtroAplicado:boolean;

  clavesTotalesFiltro:any;
  clavesTotales:any;

  dataPedido:any

  mostrarRecepciones:boolean;
  totalAvanceRecepcion:number;
  totalRecibido:number;

  listaFiltroArticulos:any[];
  dataSourceArticulos: MatTableDataSource<any>;

  ngOnInit(): void {
    this.clavesTotalesFiltro = {articulos:0};
    this.clavesTotales = {articulos:0};
    this.listaFiltroArticulos = [];

    this.dataPedido = {
      descripcion: '',
      mes: '',
      anio: '',
      programa: '',
      observaciones: '',
    };

    this.route.paramMap.subscribe(params => {
      if(params.get('id')){
        let id = params.get('id');
        this.cargarPedido(id);
      }
    });
  }

  cargarPedido(id){
    let lista_articulos = [];
    this.totalRecibido = 0;
    this.isLoading = true;

    this.estatusAvanceService.verPedido(id).subscribe(
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
          //articulo.porcentaje = Math.floor(Math.random() * 100) + 1;
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
      this.listaFiltroArticulos = this.dataSourceArticulos.connect().value;
    }
  }

  limpiarFiltroArticulos(){
    this.filtroArticulos = '';
    this.cargarFiltroArticulos();
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

  verRecepciones(){
    //
  }

  imprimirPedido(){
    //
  }

}
