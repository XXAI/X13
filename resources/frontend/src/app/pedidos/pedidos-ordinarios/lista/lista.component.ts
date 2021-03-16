import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MediaObserver } from '@angular/flex-layout';
import { MatTableDataSource } from '@angular/material/table';
import { PedidosOrdinariosService } from '../pedidos-ordinarios.service';
import { SharedService } from '../../../shared/shared.service';

@Component({
  selector: 'app-lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.css']
})
export class ListaComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(public mediaObserver: MediaObserver, private pedidosOrdinariosService: PedidosOrdinariosService, private sharedService: SharedService) { }

  mostrarTarjetas:boolean = false;

  isLoading: boolean = false;
  mediaSize: string;

  searchQuery: string = '';

  pageEvent: PageEvent;
  resultsLength: number = 0;
  currentPage: number = 0;
  pageSize: number = 20;
  selectedItemIndex: number = -1;

  displayedColumns: string[] = ['id','folio','descripcion','total_claves','total_insumos','actions'];
  dataSource: MatTableDataSource<any>;
  listadoPedidos: any[] = [];

  meses:any = {1:'Enero', 2:'Febrero', 3:'Marzo', 4:'Abril', 5:'Mayo', 6:'Junio', 7:'Julio', 8:'Agosto', 9:'Septiembre', 10:'Octubre', 11:'Noviembre', 12:'Diciembre'};
  listaEstatusIconos: any = { 'BOR':'content_paste',  'CON':'description', 'VAL':'verified', 'PUB':'published_wit_changes', 'CAN':'cancel',    'EXP':'warning'  };
  listaEstatusClaves: any = { 'BOR':'borrador',       'CON':'concluido',   'VAL':'validado', 'PUB':'publicado',             'CAN':'cancelado', 'EXP':'expirado' };
  listaEstatusLabels: any = { 'BOR':'Borrador',       'CON':'Concluido',   'VAL':'Validado', 'PUB':'Publicado',             'CAN':'Cancelado', 'EXP':'Expirado' };

  ngOnInit() {
    this.mediaObserver.media$.subscribe(
      response => {
        this.mediaSize = response.mqAlias;
    });

    //Pedidos Ficticios
    //let total_resultados = Math.floor(Math.random() * (150 - 1 + 1) + 1);
    /*let total_resultados = 20;
    let listado_pedidos = [];*/
    /*for (let index = 0; index < total_resultados; index++) {
      let id = Math.floor(Math.random() * (1000 - 1 + 1) + 1);
      let mes = Math.floor(Math.random() * (12 - 1 + 1) + 1);
      let dias_expira = Math.floor(Math.random() * (120 - 0 + 1) + 0);
      let estatus = Math.floor(Math.random() * (5 - 1 + 1) + 1);

      if(estatus == 5){
        dias_expira *= -1;
      }
      
      let clave = id+"";
      while (clave.length < 4) clave = "0" + clave;

      listado_pedidos.push({
        id:id,
        //icono:(tipo_insumo < 5)?this.iconoMatCuracion:this.iconoMedicamento,
        folio:'CSSA0001-'+clave,
        //color:(tipo_insumo < 5)?'coral':'cornflowerblue',
        descripcion:'Pedido no. '+id,
        expiracion: dias_expira,
        mes: this.meses[mes],
        estatus_label: this.listaEstatusLabels[estatus],
        estatus_clave: this.listaEstatusClaves[estatus],
        estatus_icono: this.listaEstatusIconos[estatus],
        anio:2020,
        total_claves: Math.floor(Math.random() * (5000 - 1 + 1) + 1),
        total_insumos: Math.floor(Math.random() * (500000 - 1 + 1) + 1)
      });
    }*/

    this.listadoPedidos = [];
    this.loadListadoPedidos();
  }
  
  applyFilter(){
    this.loadListadoPedidos();
  }

  cleanSearch(){
    this.searchQuery = '';
  }

  loadListadoPedidos(event?){
    this.isLoading = true;
    let params:any;
    if(!event){
      params = { page: 1, per_page: this.pageSize }
    }else{
      params = {
        page: event.pageIndex+1,
        per_page: event.pageSize
      };
    }

    this.listadoPedidos = [];
    
    params.query = this.searchQuery;
    if(!this.dataSource){
      this.dataSource = new MatTableDataSource<any>([]);
    }
    this.resultsLength = 0;
    
    this.pedidosOrdinariosService.obtenerListaPedidos(params).subscribe(
      response =>{
        if(response.error) {
          let errorMessage = response.error.message;
          this.sharedService.showSnackBar(errorMessage, null, 3000);
        } else {
          if(response.data.total > 0){
            this.listadoPedidos = response.data.data;

            for(let i in this.listadoPedidos){
              let pedido = this.listadoPedidos[i];

              if(!pedido.folio){
                pedido.folio = 'S/F';
              }

              pedido.estatus_label = this.listaEstatusLabels[pedido.estatus];
              pedido.estatus_clave = this.listaEstatusClaves[pedido.estatus];
              pedido.estatus_icono = this.listaEstatusIconos[pedido.estatus];
            }

            this.resultsLength = response.data.total;
          }
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
    
    return event;
  }
}
