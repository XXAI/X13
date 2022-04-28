import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { VisorAbastoSurtimientoService } from '../visor-abasto-surtimiento.service';
import { SharedService } from 'src/app/shared/shared.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  @ViewChild(MatTable) detallesTable: MatTable<any>;
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
  displayedColumns: string[];
  dataSourceArticulos: MatTableDataSource<any>;

  datosTablas: any;
  detallesClave: string;
  detallesTitulo: string;

  ngOnInit(): void {
    this.isLoading = true;

    this.datosTablas = {
      ABAPRNTJ:{datos:[],detalles:{datos:[],titulo:'',columnas:[]}},
      STATSCAD:{datos:[],detalles:{datos:[],titulo:'',columnas:[]}},
      RCTSCTVS:{datos:[]},
    };

    this.displayedColumns = ['sin_seleccion'];
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
          this.datosTablas.ABAPRNTJ.datos = response.data.porcentaje_abasto;
          this.datosTablas.ABAPRNTJ.detalles.datos = response.data.catalogo_normativo;
          this.datosTablas.ABAPRNTJ.detalles.columnas = ['tipo','clave','descripcion','existencia'];
          this.datosTablas.ABAPRNTJ.detalles.titulo = 'Existencias por Articulo (Normativos):';

          response.data.porcetaje_surtimiento.forEach(element => {
            element.porcentaje = ( element.total_completos / element.total_solicitudes ) * 100;
          });
          this.datosTablas.RCTSCTVS.datos = response.data.porcetaje_surtimiento;

          this.datosTablas.STATSCAD.datos = response.data.articulos_estado_caducidades;
          this.datosTablas.STATSCAD.detalles.datos = response.data.articulos_detalle_caducidades;
          this.datosTablas.STATSCAD.detalles.columnas = ['almacen','clave','articulo','lote','fecha_caducidad','existencia','dias'];
          this.datosTablas.STATSCAD.detalles.titulo = 'Lista de Articulos por Caducidad:';

          //this.datosTablas.movimientos = response.data.movimientos;
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

  seleccionaDetalles(clave:string){
    this.detallesClave = clave;

    if(this.datosTablas[clave].detalles){
      let detalles = this.datosTablas[clave].detalles;
    
      this.currentPage = 1;
      this.detallesTitulo = detalles.titulo;
      this.displayedColumns = detalles.columnas;

      this.dataSourceArticulos.data = detalles.datos;
      this.dataSourceArticulos.paginator = this.articulosPaginator;
      this.dataSourceArticulos.sort = this.sort;
    }
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
