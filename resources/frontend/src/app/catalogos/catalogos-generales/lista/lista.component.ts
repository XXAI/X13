import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { CatalogosGeneralesService } from '../catalogos-generales.service';
import { DialogoRegistroComponent } from '../dialogo-registro/dialogo-registro.component';
import { SharedService } from 'src/app/shared/shared.service';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { FormControl } from '@angular/forms';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.css']
})
export class ListaComponent implements OnInit {

  constructor(
    private sharedService: SharedService,
    private catalogosGeneralesService: CatalogosGeneralesService,
    private dialog: MatDialog, 
  ) { }

  isLoading:boolean;

  listaCatalogos:any[];
  selectedCatalogo: any;
  filteredCatalogos: Observable<any[]>;
  catalogoControl: FormControl;

  searchQuery:string;
  
  pageEvent: PageEvent;
  resultsLength: number = 0;
  currentPage: number = 0;
  pageSize: number = 20;
  pageSizeOptions: number[] = [10, 20, 30, 50];
  dataSource: any[];
  displayedColumns:string[] = ['id'];

  formulario:any;

  ngOnInit(): void {
    this.catalogoControl = new FormControl();
    this.listaCatalogos = [];
    this.searchQuery = '';

    this.catalogosGeneralesService.getCatalogos().subscribe(
      response =>{
        if(response.error) {
          let errorMessage = response.error;
          this.sharedService.showSnackBar(errorMessage, null, 3000);
        } else {
          console.log(response.data);
          this.listaCatalogos = response.data;
          this.filteredCatalogos = this.catalogoControl.valueChanges.pipe( startWith(''), map(value => typeof value === 'string' ? value : (value)?value.descripcion:''),
                                      map(descripcion => descripcion ? this._filter(descripcion) : this.listaCatalogos.slice())
                                    );

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
  }

  catalogoSeleccionado(){
    this.selectedCatalogo = this.catalogoControl.value;
    this.searchQuery = '';
    this.loadDataSource();
  }

  loadDataSource(event?:PageEvent):any{
    if(this.selectedCatalogo){
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
      
      params.query = this.searchQuery;
      params.catalogo = this.selectedCatalogo.value;

      this.dataSource = [];
      this.resultsLength = 0;
      this.displayedColumns = ['id'];
      
      this.catalogosGeneralesService.getRegistros(params).subscribe(
        response =>{
          if(response.error) {
            let errorMessage = response.error;
            this.sharedService.showSnackBar(errorMessage, null, 3000);
          } else {
            if(response.data.total > 0){
              this.dataSource = response.data.data;
              this.resultsLength = response.data.total;
            }
            this.displayedColumns = response.columnas;
            this.formulario = response.formulario;
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
    }
    return event;
  }

  validarOpcionSeleccionadaDetalles(){
    setTimeout (() => {
      if(typeof this.catalogoControl.value == 'string' && this.catalogoControl.value != ''){
        this.catalogoControl.setErrors({notSelected:true});
      }
    }, 100);
  }

  getDisplayFn(label: string){
    return (val) => this.displayFn(val,label);
  }

  displayFn(value: any, valueLabel: string){
    return value ? value[valueLabel] : '';
  }

  private _filter(value: string): any[] {
    const filterValue = value.toLowerCase();
    return this.listaCatalogos.filter(option => option.label.toLowerCase().includes(filterValue));
  }

  mostrarDialogo(row:any = null){
    let configDialog = {
      width: '60%',
      disableClose: false,
      data:{registro: row, formulario: this.formulario, catalogo: this.selectedCatalogo.value},
      //panelClass: 'no-padding-dialog'
    };

    const dialogRef = this.dialog.open(DialogoRegistroComponent, configDialog);
    dialogRef.afterClosed().subscribe(dialogResponse => {
      if(dialogResponse){
        console.log('Response: ',dialogResponse);
        this.loadDataSource(this.pageEvent);
      }
    });
  }
  
  cleanSearch(){
    this.searchQuery = '';
  }

  applyFilter(){
    this.loadDataSource();
  }
}
