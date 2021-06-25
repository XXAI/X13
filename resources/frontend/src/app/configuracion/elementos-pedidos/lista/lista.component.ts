import { Component, OnInit } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { environment } from 'src/environments/environment';
import { SharedService } from '../../../shared/shared.service';
import { ElementosPedidosService } from '../elementos-pedidos.service';
import { DialogoFormElementoPedidoComponent } from '../dialogo-form-elemento-pedido/dialogo-form-elemento-pedido.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.css']
})
export class ListaComponent implements OnInit {

  constructor(private sharedService:SharedService, private elementosPedidosService:ElementosPedidosService, private dialog:MatDialog)
  { }

  rutaIconosPedido:string = environment.images_url;

  isLoading: boolean = false;
  mediaSize: string;

  searchQuery: string = '';

  pageEvent: PageEvent;
  resultsLength: number = 0;
  currentPage: number = 0;
  pageSize: number = 20;
  selectedItemIndex: number = -1;

  //displayedColumns: string[] = ['id','folio','descripcion','no_usuarios','actions'];
  dataSource: any = [];

  ngOnInit(): void {
    this.loadListadoTiposPedidos();
  }

  nuevoTipoPedido(){
    //
  }

  editarTipoPedido(id){
    let configDialog:any;
    if(this.mediaSize == 'xs'){
      configDialog = {
        maxWidth: '100vw',
        maxHeight: '100vh',
        height: '100%',
        width: '100%',
        data:{scSize:this.mediaSize}
      };
    }else{
      configDialog = {
        width: '60%',
        height: '80%',
        data:{}
      }
    }

    if(id){
      configDialog.data.id = id;
    }

    const dialogRef = this.dialog.open(DialogoFormElementoPedidoComponent, configDialog);

    dialogRef.afterClosed().subscribe(valid => {
      if(valid){
        this.loadListadoTiposPedidos(null);
        //this.loadGruposData(this.pageEvent);
      }
    });
  }

  eliminarTipoPedido(id){
    //
  }

  applyFilter(){
    this.loadListadoTiposPedidos();
  }

  cleanSearch(){
    this.searchQuery = '';
  }

  loadListadoTiposPedidos(event?:PageEvent){
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

    params.query = this.searchQuery;

    this.elementosPedidosService.getTiposPedidosList(params).subscribe(
      response =>{
        if(response.error) {
          let errorMessage = response.error.message;
          this.sharedService.showSnackBar(errorMessage, null, 3000);
        } else {
          if(response.data.total > 0){
            this.dataSource = response.data.data;
            this.resultsLength = response.data.total;
          }else{
            this.dataSource = [];
            this.resultsLength = 0;
          }
        }
        this.isLoading = false;
      },
      errorResponse =>{
        var errorMessage = "Ocurrió un error.";
        if(errorResponse.status == 409){
          errorMessage = errorResponse.error.message;
        }
        this.sharedService.showSnackBar(errorMessage, null, 3000);
        this.isLoading = false;
      }
    );
    return event;
  }

}
