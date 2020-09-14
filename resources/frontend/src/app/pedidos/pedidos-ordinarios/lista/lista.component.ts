import { Component, OnInit } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MediaObserver } from '@angular/flex-layout';
import { MatTableDataSource } from '@angular/material';

@Component({
  selector: 'app-lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.css']
})
export class ListaComponent implements OnInit {

  constructor(public mediaObserver: MediaObserver) { }

  mostrarTarjetas:boolean = false;

  isLoading: boolean = false;
  mediaSize: string;

  searchQuery: string = '';

  pageEvent: PageEvent;
  resultsLength: number = 0;
  currentPage: number = 0;
  pageSize: number = 20;
  selectedItemIndex: number = -1;

  displayedColumns: string[] = ['id','folio','descripcion','mes_expiracion','total_claves','total_monto','actions'];
  dataSource: MatTableDataSource<any>;
  listadoPedidos: any[] = [];

  meses:any = {1:'Enero', 2:'Febrero', 3:'Marzo', 4:'Abril', 5:'Mayo', 6:'Junio', 7:'Julio', 8:'Agosto', 9:'Septiembre', 10:'Octubre', 11:'Noviembre', 12:'Diciembre'};
  listaEstatusIconos: any = { 1:'content_paste', 2:'description', 3:'verified', 4:'cancel', 5:'warning' }; //Borrador, Concluido, Validado, Publicado, Cancelado, Expirado
  listaEstatusClaves: any = { 1:'borrador', 2:'concluido', 3:'validado', 4:'cancelado', 5:'expirado' }; //Borrador, Concluido, Validado, Publicado, Cancelado, Expirado
  listaEstatusLabels: any = { 1:'Borrador', 2:'Concluido', 3:'Validado', 4:'Cancelado', 5:'Expirado' }; //Borrador, Concluido, Validado, Publicado, Cancelado, Expirado

  ngOnInit() {
    this.mediaObserver.media$.subscribe(
      response => {
        this.mediaSize = response.mqAlias;
    });

    //Pedidos Ficticios
    //let total_resultados = Math.floor(Math.random() * (150 - 1 + 1) + 1);
    let total_resultados = 20;

    let listado_pedidos = [];
    for (let index = 0; index < total_resultados; index++) {
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
        total_monto: Math.floor(Math.random() * (500000 - 1 + 1) + 1)
      });
    }


    if(this.dataSource){
      this.dataSource.disconnect();
    }

    this.dataSource = new MatTableDataSource<any>(listado_pedidos);

    this.listadoPedidos = this.dataSource.connect().value;
  }
  
  applyFilter(){
    //
  }

  cleanSearch(){
    //
  }

  loadListadoPedidos(event = null){
    return event;
  }
}
