import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { VisorAbastoSurtimientoService } from '../visor-abasto-surtimiento.service';
import { SharedService } from 'src/app/shared/shared.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  @ViewChild(MatPaginator) articulosPaginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  
  constructor(
    private sharedService: SharedService,
    private visorAbastoSurtimientoService: VisorAbastoSurtimientoService,
  ) { }

  isLoading:boolean;
  unidadMedica: any;

  textoFiltro:string;
  filtroAplicado:boolean;

  pageEvent: PageEvent;
  resultsLength: number = 0;
  currentPage: number = 0;
  pageSize: number = 30;
  displayedColumns: string[] = ['tipo','clave','descripcion','existencia'];
  dataSourceArticulos: MatTableDataSource<any>;

  datosTablas:any;

  ngOnInit(): void {
    this.isLoading = true;
    this.datosTablas = {};
    this.dataSourceArticulos = new MatTableDataSource<any>([]);
    this.dataSourceArticulos.paginator = this.articulosPaginator;
    this.dataSourceArticulos.sort = this.sort;

    this.visorAbastoSurtimientoService.obtenerDatosVisor().subscribe(
      response =>{
        if(response.error) {
          let errorMessage = response.error;
          this.sharedService.showSnackBar(errorMessage, null, 3000);
        } else {
          this.unidadMedica = response.data.unidad_medica;

          response.data.porcentaje_abasto.forEach(element => {
            element.porcentaje = ( element.total_claves_existencia / element.total_claves ) * 100;
          });
          this.datosTablas.porcentaje_abasto = response.data.porcentaje_abasto;

          response.data.porcetaje_surtimiento.forEach(element => {
            element.porcentaje = ( element.total_completos / element.total_solicitudes ) * 100;
          });
          this.datosTablas.porcetaje_surtimiento = response.data.porcetaje_surtimiento;

          this.datosTablas.movimientos = response.data.movimientos;

          this.dataSourceArticulos = new MatTableDataSource<any>(response.data.catalogo_normativo);
          this.dataSourceArticulos.paginator = this.articulosPaginator;
          this.dataSourceArticulos.sort = this.sort;
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

  aplicarFiltro(event){
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceArticulos.filter = filterValue.trim().toLowerCase();

    if(filterValue.trim().toLowerCase() == ''){
      this.filtroAplicado = false;
    }else{
      this.filtroAplicado = true;
    }
  }

  limpiarFiltro(){
    this.textoFiltro = '';
    this.dataSourceArticulos.filter = '';
    this.filtroAplicado = false;
  }

}
