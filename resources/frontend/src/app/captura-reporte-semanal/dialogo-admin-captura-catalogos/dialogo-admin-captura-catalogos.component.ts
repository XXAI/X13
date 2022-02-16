import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { AdminCapturaSemanalService } from '../admin-captura-semanal.service';
import { SharedService } from 'src/app/shared/shared.service';
import { MatSort } from '@angular/material/sort';
import { MatDialogRef } from '@angular/material/dialog';

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
    private sharedService: SharedService,
    public dialogRef: MatDialogRef<DialogoAdminCapturaCatalogosComponent>,
  ) { }

  isLoading: boolean;
  isSaving: boolean;
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
    this.isLoading = true;

    this.adminCapturaService.obtenerListaUnidades().subscribe(
      response =>{
        this.isLoading = false;
        if(response.error) {
          let errorMessage = response.error.message;
          this.sharedService.showSnackBar(errorMessage, null, 3000);
        } else {
          response.data.forEach(unidad => {
            unidad.puede_editar_medicamentos = (unidad.puede_editar_medicamentos==1);
            unidad.puede_editar_material_curacion = (unidad.puede_editar_material_curacion==1);
          });
          this.dataSourceUnidades = new MatTableDataSource<any>(response.data);
          this.dataSourceUnidades.paginator = this.articulosPaginator;
          this.dataSourceUnidades.sort = this.sort;
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

  toggleEditarCatalogosGrupo(puede_editar:boolean,tipo_catalogo:string = '*'){
    let grupo_unidades:any[] = [];
    this.dataSourceUnidades.data.forEach(unidad =>{
      if(unidad.seleccionado){
        grupo_unidades.push(unidad.id);
      }
    });
    this.aplicarEditarCatalogos(grupo_unidades,tipo_catalogo,puede_editar);
  }

  toggleEditarCatalogos(unidad:any,puede_editar:boolean,tipo_catalogo:string = '*'){
    let grupo_unidades:any[] = [];
    grupo_unidades.push(unidad.id);
    this.aplicarEditarCatalogos(grupo_unidades,tipo_catalogo,puede_editar);
  }

  aplicarEditarCatalogos(lista_unidades:any[],tipo_catalogo:string,puede_editar:boolean){
    this.isSaving = true;
    let params:any = {
      unidades: lista_unidades,
      tipo_catalogo: tipo_catalogo,
      puede_editar: puede_editar,
    };

    this.adminCapturaService.configListaUnidades(params).subscribe(
      response =>{
        this.isSaving = false;
        if(response.error) {
          let errorMessage = response.error.message;
          this.sharedService.showSnackBar(errorMessage, null, 3000);
        } else {
          if(lista_unidades.length > 1){
            this.dataSourceUnidades.data.forEach(unidad =>{
              if(unidad.seleccionado){
                if(tipo_catalogo == '*'){
                  unidad.puede_editar_medicamentos = puede_editar;
                  unidad.puede_editar_material_curacion = puede_editar;
                }else if (tipo_catalogo == 'MED'){
                  unidad.puede_editar_medicamentos = puede_editar;
                }else{ //MTC
                   unidad.puede_editar_material_curacion = puede_editar;
                }
              }
            });
          }else{
            let unidad = this.dataSourceUnidades.data.find(item => item.id == lista_unidades[0]);
            if(tipo_catalogo == '*'){
              unidad.puede_editar_medicamentos = puede_editar;
              unidad.puede_editar_material_curacion = puede_editar;
            }else if (tipo_catalogo == 'MED'){
              unidad.puede_editar_medicamentos = puede_editar;
            }else{ //MTC
               unidad.puede_editar_material_curacion = puede_editar;
            }
          }
        }
      },
      errorResponse =>{
        var errorMessage = "Ocurrió un error.";
        if(errorResponse.status == 409){
          errorMessage = errorResponse.error.error.message;
        }
        this.sharedService.showSnackBar(errorMessage, null, 3000);
        this.isSaving = false;
      }
    );
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

  limpiarFiltroUnidades(){
    this.filtroUnidades = '';
    this.dataSourceUnidades.filter = '';
    this.filtroAplicado = false;
  }

  cerrar(){
    this.dialogRef.close();
  }

}
