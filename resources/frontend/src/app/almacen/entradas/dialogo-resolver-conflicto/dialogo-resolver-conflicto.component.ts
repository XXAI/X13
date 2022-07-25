import { AriaDescriber } from '@angular/cdk/a11y';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { SharedService } from 'src/app/shared/shared.service';
import { AlmacenService } from '../../almacen.service';

export interface DialogData {
  id: number;
}

@Component({
  selector: 'app-dialogo-resolver-conflicto',
  templateUrl: './dialogo-resolver-conflicto.component.html',
  styleUrls: ['./dialogo-resolver-conflicto.component.css']
})
export class DialogoResolverConflictoComponent implements OnInit {
  @ViewChild(MatPaginator) lotesPaginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  
  constructor(
    public dialogRef: MatDialogRef<DialogoResolverConflictoComponent>,
    private almacenService: AlmacenService, 
    private sharedService: SharedService,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) { }

  isLoading:boolean;
  datosEntrada:any;
  listaArticulos:any[];

  pageEvent: PageEvent;
  resultsLength: number = 0;
  currentPage: number = 0;
  pageSize: number = 15;
  displayedColumns: string[] = ['estatus_articulo','datos_articulo','datos_empaque','lote_fecha_cad','lote_fecha_cad_mod','cantidad_enviada','cantidad_recibida'];
  dataSourceArticulos: MatTableDataSource<any>;

  ngOnInit(): void {
    this.isLoading = true;

    this.almacenService.confictoModificacion(this.data.id).subscribe(
      response =>{
        if(response.error) {
          let errorMessage = response.error;
          this.sharedService.showSnackBar(errorMessage, null, 3000);
        } else {
          console.log(response);
          this.datosEntrada = response.data;
          let datos_articulos:any[] = [];
          response.data.lista_articulos.forEach(element => {
            let dato_item: any = {
              estatus_articulo:'DEL',
              estatus_desc:'Eliminar',
              estatus_icono:'delete_sweep',
              clave: element.articulo.clave_local,
              nombre: element.articulo.articulo,
              descripcion: element.articulo.especificaciones,
              empaque_detalle_id: element.stock.empaque_detalle_id,
              empaque_detalle: (element.stock.empaque_detalle)?element.stock.empaque_detalle.descripcion:'Sin Detalles',
              lote: element.stock.lote,
              fecha_caducidad: element.stock.fecha_caducidad,
              codigo_barras: element.stock.codigo_barras,
              cantidad_enviada: element.cantidad_anterior,
              cantidad_recibida: element.cantidad,
              stock_id: element.stock_id,
              stock_padre_id: element.stock_padre_id,
              articulo_id: element.articulo.id,
            };

            datos_articulos.push(dato_item);
          });

          let nuevos_articulos:any[] = [];
          response.data.movimiento_padre.lista_articulos.forEach(element => {
            let articulo:any = datos_articulos.find(x => x.stock_padre_id == element.stock_id);

            if(articulo){
              if(articulo.lote != element.stock.lote || articulo.fecha_caducidad != element.stock.fecha_caducidad || articulo.codigo_barras != element.stock.codigo_barras || articulo.no_serie != element.stock.no_serie || articulo.modelo != element.stock.modelo || articulo.marca_id != element.stock.marca_id || articulo.empaque_detalle_id != element.stock.empaque_detalle_id){
                articulo.estatus_articulo = 'EDIT';
                articulo.estatus_icono = 'edit_note';
                articulo.estatus_desc = 'Modificado';
                articulo.lote_modificado = element.stock.lote;
                articulo.fecha_caducidad_modificado = element.stock.fecha_caducidad;
                articulo.codigo_barras_modificado = element.stock.codigo_barras;
                if(articulo.empaque_detalle_id != element.stock.empaque_detalle_id){
                  articulo.empaque_detalle_modificado = element.stock.empaque_detalle_modificado;
                }
              }else{
                articulo.estatus_articulo = 'OK';
                articulo.estatus_icono = 'done_all';
                articulo.estatus_desc = 'Sin Cambios';
              }
            }else{
              articulo = {
                estatus_articulo:'ADD',
                estatus_desc:'Agregado',
                estatus_icono:'playlist_add',
                clave: element.articulo.clave_local,
                nombre: element.articulo.articulo,
                descripcion: element.articulo.especificaciones,
                empaque_detalle_id: element.stock.empaque_detalle_id,
                empaque_detalle_modificado: (element.stock.empaque_detalle)?element.stock.empaque_detalle.descripcion:'Sin Detalles',
                lote_modificado: element.stock.lote,
                fecha_caducidad_modificado: element.stock.fecha_caducidad,
                codigo_barras_modificado: element.stock.codigo_barras,
                cantidad_enviada: element.cantidad,
                cantidad_recibida: 0,
                stock_id: null,
                stock_padre_id: element.stock_id,
                articulo_id:element.articulo.id,
              };
              nuevos_articulos.push(articulo);
            }
          });

          if(nuevos_articulos.length > 0){
            nuevos_articulos.forEach(element => {
              let articulo:any = datos_articulos.find(x => x.articulo_id == element.articulo_id && x.estatus_articulo == 'DEL');

              if(articulo){
                articulo.estatus_articulo = 'EDIT';
                articulo.estatus_icono = 'edit_note';
                articulo.estatus_desc = 'Modificado';
                articulo.lote_modificado = element.lote_modificado;
                articulo.fecha_caducidad_modificado = element.fecha_caducidad_modificado;
                articulo.codigo_barras_modificado = element.codigo_barras_modificado;
                articulo.cantidad_enviada = element.cantidad_enviada;
                articulo.cantidad_recibida = 0;
                articulo.stock_padre_id = element.stock_padre_id;
                if(articulo.empaque_detalle_id != element.empaque_detalle_id){
                  articulo.empaque_detalle_modificado = element.empaque_detalle_modificado;
                }
              }else{
                datos_articulos.push(articulo);
              }
              
            });
          }
          //this.listaArticulos = datos_articulos;
          this.dataSourceArticulos = new MatTableDataSource<any>(datos_articulos);
          this.dataSourceArticulos.paginator = this.lotesPaginator;
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

  cancelarAccion(){
    this.cerrar();
  }

  cerrar(){
    this.dialogRef.close();
  }

}
