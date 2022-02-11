import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { AdminCapturaSemanalService } from '../admin-captura-semanal.service';
import { SharedService } from 'src/app/shared/shared.service';
import { MatSort } from '@angular/material/sort';

@Component({
  selector: 'app-dialogo-admin-captura-catalogos',
  templateUrl: './dialogo-admin-captura-catalogos.component.html',
  styleUrls: ['./dialogo-admin-captura-catalogos.component.css']
})
export class DialogoAdminCapturaCatalogosComponent implements OnInit {
  @ViewChild(MatPaginator) articulosPaginator: MatPaginator;
  @ViewChild(MatTable) articulosTable: MatTable<any>;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    private adminCapturaService: AdminCapturaSemanalService,
    private sharedService: SharedService
  ) { }

  isLoading: boolean;
  filtroUnidades: string;
  filtroAplicado: boolean;

  seleccionarTodo: boolean;
  unidadesSeleccionadas: number;

  pageEvent: PageEvent;
  resultsLength: number = 0;
  currentPage: number = 0;
  pageSize: number = 20;
  pageSizeOptions: number[] = [20, 30, 50];
  dataSourceUnidades: MatTableDataSource<any>;

  displayedColumns: string[] = ['clues','nombre','cantidad_medicamentos','cantidad_material_curacion','actions'];
  
  ngOnInit(): void {
    this.unidadesSeleccionadas = 0;

    this.adminCapturaService.obtenerListaUnidades().subscribe(
      response =>{
        this.isLoading = false;
        if(response.error) {
          let errorMessage = response.error.message;
          this.sharedService.showSnackBar(errorMessage, null, 3000);
        } else {
          console.log(response.data);
          this.dataSourceUnidades = new MatTableDataSource<any>(response.data);
          this.dataSourceUnidades.paginator = this.articulosPaginator;
          this.dataSourceUnidades.sort = this.sort;
          //this.articulosTable.renderRows();
        }
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

  cambioSeleccion(row){
    if(row.seleccionado){
      this.unidadesSeleccionadas++;
    }else{
      this.unidadesSeleccionadas--;
    }
  }

  toggleSeleccionarTodo(){
    this.dataSourceUnidades.data.forEach(unidad => {
      unidad.seleccionado = this.seleccionarTodo;
    });
    if(this.seleccionarTodo){
      this.unidadesSeleccionadas = this.dataSourceUnidades.data.length;
    }else{
      this.unidadesSeleccionadas = 0;
    }
  }

  toggleEditarCatalogosGrupo(puede_editar,tipo_catalogo:string = '*'){
    //
  }

  toggleEditarCatalogos(unidad,tipo_catalogo:string = '*'){
    //
  }

  aplicarFiltroUnidades(event: Event){ 
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceUnidades.filter = filterValue.trim().toLowerCase();

    if(filterValue.trim().toLowerCase() == ''){
      this.filtroAplicado = false;
    }else{
      this.filtroAplicado = true;
    }
  }

  limpiarFiltroUnidades(){}

}
