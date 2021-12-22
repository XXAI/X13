import { Component, OnInit } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MediaObserver } from '@angular/flex-layout';
import { MatDialog } from '@angular/material/dialog';
import { AlmacenesService } from '../almacenes.service';
import { FormComponent } from '../form/form.component';

@Component({
  selector: 'app-lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.css']
})
export class ListaComponent implements OnInit {

  constructor(
    public mediaObserver: MediaObserver,
    public almacenesService: AlmacenesService,
    public dialog: MatDialog
  ) { }

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
    this.mediaObserver.media$.subscribe(
      response => {
        this.mediaSize = response.mqAlias;
    });
  }

  mostrarFormAlmacen(id:number = 0){

    const dialogRef = this.dialog.open(FormComponent, {
      width: '800px',
      data: {id: id}
    });

    dialogRef.afterClosed().subscribe(reponse => {
      if(reponse){
        this.applyFilter();
      }
    });

  }

  applyFilter(){
    //
  }

  cleanSearch(){
    //
  }

  loadListadoAlmacenes(event = null){
    return event;
  }

}
