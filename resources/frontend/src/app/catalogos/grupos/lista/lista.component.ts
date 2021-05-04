import { Component, OnInit } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MediaObserver } from '@angular/flex-layout';
import { SharedService } from '../../../shared/shared.service';
import { GruposService } from '../grupos.service';

@Component({
  selector: 'app-lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.css']
})
export class ListaComponent implements OnInit {

  constructor(public mediaObserver: MediaObserver, private sharedService: SharedService, private gruposService: GruposService ) { }

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

  ngOnInit() {
    this.mediaObserver.asObservable().subscribe(
      response => {
        console.log(response);
        //this.mediaSize = response.;
    });

    this.loadListadoAlmacenes(null);
  }

  mostrarFormGrupo(){
    //
  }

  applyFilter(){
    //
  }

  cleanSearch(){
    //
  }

  loadListadoAlmacenes(event?:PageEvent){
    this.isLoading = true;
    let params:any;
    if(!event){
      params = { page: 1, per_page: 20 }
    }else{
      params = {
        page: event.pageIndex+1,
        per_page: event.pageSize
      };
    }

    params.query = this.searchQuery;

    this.gruposService.getGruposList(params).subscribe(
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
