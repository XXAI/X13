import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { SharedService } from 'src/app/shared/shared.service';
import { BienesServiciosService } from '../bienes-servicios.service';
import { DialogoDetallesComponent } from '../dialogo-detalles/dialogo-detalles.component';

@Component({
  selector: 'app-lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.css']
})
export class ListaComponent implements OnInit {
  @ViewChild(MatPaginator) articulosPaginator: MatPaginator;
  
  constructor(
    private sharedService: SharedService,
    private bienesServiciosService: BienesServiciosService,
    private dialog: MatDialog, 
  ) { }

  isLoading:boolean;

  searchQuery:string;
  
  pageEvent: PageEvent;
  resultsLength: number = 0;
  currentPage: number = 0;
  pageSize: number = 20;
  pageSizeOptions: number[] = [10, 20, 30, 50];
  listaArticulos: any[];
  displayedColumns:string[] = ['descontinuado','tipo_familia','clave','articulo','puede_surtir_unidades','existencias'];

  ngOnInit(): void {
    this.searchQuery = '';
    this.loadListadoArticulos();
  }

  loadListadoArticulos(event?:PageEvent):any{
    this.isLoading = true;

    let params:any;
    if(!event){
      params = { page: 1, per_page: this.pageSize }
    }else{
      this.pageEvent = event;
      params = {
        page: event.pageIndex+1,
        per_page: event.pageSize
      };
    }
    
    params.query = encodeURIComponent(this.searchQuery);

    this.listaArticulos = [];
    this.resultsLength = 0;
    
    this.bienesServiciosService.getListaBienesServicios(params).subscribe(
      response =>{
        if(response.error) {
          let errorMessage = response.error;
          this.sharedService.showSnackBar(errorMessage, null, 3000);
        } else {
          if(response.data.total > 0){
            this.listaArticulos = response.data.data;
            this.resultsLength = response.data.total;
          }
          this.articulosPaginator.pageIndex = response.data.current_page-1;
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

  mostrarDialogoArticulo(id:number = null){
    let configDialog = {
      width: '90%',
      height: '80%',
      maxWidth: '100%',
      disableClose: true,
      data:{id: id},
      panelClass: 'no-padding-dialog'
    };

    const dialogRef = this.dialog.open(DialogoDetallesComponent, configDialog);
    dialogRef.afterClosed().subscribe(dialogResponse => {
      if(dialogResponse){
        console.log('Response: ',dialogResponse);
        this.loadListadoArticulos(this.pageEvent);
      }
    });
  }

  cleanSearch(){
    this.searchQuery = '';
  }

  applyFilter(){
    this.loadListadoArticulos();
  }

}
