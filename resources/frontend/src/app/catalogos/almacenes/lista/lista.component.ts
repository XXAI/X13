import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MediaObserver } from '@angular/flex-layout';
import { MatDialog } from '@angular/material/dialog';
import { AlmacenesService } from '../almacenes.service';
import { FormComponent } from '../form/form.component';

import { SharedService } from '../../../shared/shared.service';
import { AuthService } from '../../../auth/auth.service';

@Component({
  selector: 'app-lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.css']
})
export class ListaComponent implements OnInit {

  constructor(
    private sharedService: SharedService,
    private authService: AuthService,
    public mediaObserver: MediaObserver,
    public almacenesService: AlmacenesService,
    public dialog: MatDialog ) { }

    @ViewChild(MatPaginator, {static: false}) paginator: MatPaginator;

    isLoading: boolean = false;
    mediaSize: string;

    searchQuery: string = '';

    pageEvent: PageEvent;
    resultsLength: number = 0;
    currentPage: number = 0;
    pageSize: number = 20;
    selectedItemIndex: number = -1;

  //displayedColumns: string[] = ['id','folio','descripcion','no_usuarios','actions'];
  displayedColumns: string[] = ['nombre_almacen', 'tipo_almacen', 'unidosis', 'externo', 'opciones'];
  dataSource: any = [];

  ngOnInit() {
    this.mediaObserver.media$.subscribe(
      response => {
        this.mediaSize = response.mqAlias;
    });

    let appStoredData = this.sharedService.getArrayDataFromCurrentApp(['searchQuery','paginator','filter']);
    // console.log(appStoredData);

    if(appStoredData['searchQuery']){
      this.searchQuery = appStoredData['searchQuery'];
    }

    let event = null
    if(appStoredData['paginator']){
      this.currentPage = appStoredData['paginator'].pageIndex;
      this.pageSize = appStoredData['paginator'].pageSize;
      event = appStoredData['paginator'];

      if(event.selectedIndex >= 0){
        // console.log("siguiente", event);
        this.selectedItemIndex = event.selectedIndex;
      }
    }else{
      let dummyPaginator = {
        length: 0,
        pageIndex: this.currentPage,
        pageSize: this.pageSize,
        previousPageIndex: (this.currentPage > 0)?this.currentPage-1:0
       };
      this.sharedService.setDataToCurrentApp('paginator', dummyPaginator);
    }

    // if(appStoredData['filter']){
    //   this.filterForm.patchValue(appStoredData['filter']);
    // }

    this.loadListadoAlmacenes(event);

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

    this.selectedItemIndex = -1;
    this.paginator.pageIndex = 0;
    this.paginator.pageSize = this.pageSize;
    this.loadListadoAlmacenes(null);

  }

  cleanSearch(){
    this.searchQuery = '';
    this.paginator.pageIndex = 0;
    this.loadListadoAlmacenes(null);
  }

  // loadListadoAlmacenes(event = null){
  //   return event;
  // }

  public loadListadoAlmacenes(event?:PageEvent){

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

    if(event && !event.hasOwnProperty('selectedIndex')){
      this.selectedItemIndex = -1;
    }
    
    params.query = this.searchQuery;

    //let filterFormValues = this.filterForm.value;
    let countFilter = 0;

    // this.loadFilterChips(filterFormValues);

    // for(let i in filterFormValues){

    //   if(filterFormValues[i]){

    //     if(i == 'municipio_id'){
    //       params[i] = filterFormValues[i].id;
    //     }else if(i == 'localidad_id'){
    //       params[i] = filterFormValues[i].id;
    //     }else if(i == 'municipios'){
    //       params[i] = filterFormValues[i].id;
    //     }else if(i == 'sexo'){
    //       params[i] = this.filterForm.value.sexo;
    //     }else if(i == 'edad'){
    //       params[i] = this.filterForm.value.edad;
    //     }else if(i == 'tipo_edad'){
    //       params[i] = this.filterForm.value.tipo_edad;
    //     }else if(i == 'identidad'){
    //       var identidad;
    //       identidad = this.filterForm.value.identidad;
    //       params[i] = identidad;
    //     }else if(i == 'nacionalidad'){
    //       var nacionalidad;
    //       nacionalidad = this.filterForm.value.nacionalidad;
    //       params[i] = nacionalidad;
    //     }else if(i == 'atencion'){
    //       var atencion;
    //       atencion = this.filterForm.value.atencion;
    //       params[i] = atencion;
    //     }else if(i == 'ambulatorios'){
    //       var ambulatorios;
    //       ambulatorios = this.filterForm.value.ambulatorios;
    //       params[i] = ambulatorios;
    //     }
    //     else if (i == 'fecha_inicio') {
    //       var desde = moment(this.filterForm.value.fecha_inicio).format('YYYY-MM-DD');
    //       params[i] = desde;
    //     }
    //     else if (i == 'fecha_fin') {
    //       var hasta = moment(this.filterForm.value.fecha_fin).format('YYYY-MM-DD');
    //       params[i] = hasta;
    //     }
    //     else if(i == 'especialidad_id'){
    //       params[i] = filterFormValues[i].id;
    //     }
    //     else if(i == 'servicio_id'){
    //       params[i] = filterFormValues[i].id;
    //     }
    //     else if(i == 'estado_actual_id'){
    //       params[i] = filterFormValues[i].id;
    //     }
    //     countFilter++;

    //   }
    // }

    if(countFilter > 0){
      params.active_filter = true;
    }

    if(event){
      this.sharedService.setDataToCurrentApp('paginator',event);
    }

    this.sharedService.setDataToCurrentApp('searchQuery',this.searchQuery);
    //this.sharedService.setDataToCurrentApp('filter',filterFormValues);

    this.almacenesService.getAlmacenList(params).subscribe(
      response =>{
        if(response.error) {
          let errorMessage = response.error.message;
          this.sharedService.showSnackBar(errorMessage, null, 3000);
        } else {
          if(response.data.total > 0){
            this.dataSource = response.data.data;
            // this.fechaActual = response.fecha_actual;
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
