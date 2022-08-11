import { AriaDescriber } from '@angular/cdk/a11y';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { AlertPanelComponent } from 'src/app/shared/components/alert-panel/alert-panel.component';
import { SharedService } from 'src/app/shared/shared.service';
import { ConfirmActionDialogComponent } from 'src/app/utils/confirm-action-dialog/confirm-action-dialog.component';
import { AlmacenService } from '../../almacen.service';
import { DialogoMovimientosAfectadosComponent } from '../../tools/dialogo-movimientos-afectados/dialogo-movimientos-afectados.component';
import { DialogoModificarStockComponent } from '../dialogo-modificar-stock/dialogo-modificar-stock.component';

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
  @ViewChild(AlertPanelComponent) alertPanel:AlertPanelComponent;
  
  constructor(
    public dialogRef: MatDialogRef<DialogoResolverConflictoComponent>,
    private almacenService: AlmacenService, 
    private sharedService: SharedService,
    private dialog: MatDialog, 
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) { }

  isLoading:boolean;
  isSaving:boolean;
  datosEntrada:any;
  listaArticulos:any[];

  pageEvent: PageEvent;
  resultsLength: number = 0;
  currentPage: number = 0;
  pageSize: number = 15;
  displayedColumns: string[] = ['estatus_articulo','datos_articulo','datos_empaque','programa','lote_fecha_cad','cantidad_enviada','cantidad_recibida','actions'];
  dataSourceArticulos: MatTableDataSource<any>;

  ngOnInit(): void {
    this.isLoading = true;

    this.almacenService.conflictoModificacion(this.data.id).subscribe(
      response =>{
        if(response.error) {
          let errorMessage = response.error;
          //this.sharedService.showSnackBar(errorMessage, null, 3000);
          this.alertPanel.mostrarError(errorMessage);
        } else {
          console.log(response);
          this.datosEntrada = response.data;
          let datos_articulos:any[] = [];
          response.data.lista_articulos.forEach(element => {
            let dato_item: any = {
              id: element.id,
              estatus_articulo:'DEL',
              estatus_desc:'Eliminar',
              estatus_icono:'delete_sweep',
              clave: element.articulo.clave_local,
              nombre: element.articulo.articulo,
              tiene_fecha_caducidad: element.articulo.tiene_fecha_caducidad,
              entrada_piezas: (element.modo_movimiento == 'UNI')?true:false,
              descripcion: element.articulo.especificaciones,
              empaque_detalle_id: element.stock.empaque_detalle_id,
              empaque_detalle: (element.stock.empaque_detalle)?element.stock.empaque_detalle.descripcion:'Sin Detalles',
              piezas_x_empaque: (element.stock.empaque_detalle)?element.stock.empaque_detalle.piezas_x_empaque:1,
              programa_id: element.stock.programa_id,
              programa: (element.stock.programa)?element.stock.programa.descripcion:'Sin Programa',
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

          //let nuevos_articulos:any[] = [];
          response.data.movimiento_padre.lista_articulos.forEach(element => {
            let articulo:any = datos_articulos.find(x => x.stock_padre_id == element.stock_id);

            if(!articulo){
              articulo = datos_articulos.find(x => x.lote == element.stock.lote && x.fecha_caducidad == element.stock.fecha_caducidad && x.codigo_barras == element.stock.codigo_barras && x.no_serie == element.stock.no_serie && x.modelo == element.stock.modelo && x.marca_id == element.stock.marca_id && x.empaque_detalle_id == element.stock.empaque_detalle_id && x.programa_id == element.stock.programa_id);
            }

            if(articulo){
              if(articulo.lote != element.stock.lote || articulo.fecha_caducidad != element.stock.fecha_caducidad || articulo.codigo_barras != element.stock.codigo_barras || articulo.no_serie != element.stock.no_serie || articulo.modelo != element.stock.modelo || articulo.marca_id != element.stock.marca_id || articulo.empaque_detalle_id != element.stock.empaque_detalle_id || articulo.programa_id != element.stock.programa_id){
                articulo.estatus_articulo = 'EDIT';
                articulo.estatus_icono = 'playlist_add_check';
                articulo.estatus_desc = 'Modificado';

                articulo.lote_modificado = element.stock.lote;
                articulo.diff_lote = (articulo.lote != element.stock.lote);
                articulo.fecha_caducidad_modificado = element.stock.fecha_caducidad;
                articulo.diff_fecha_caducidad = (articulo.fecha_caducidad != element.stock.fecha_caducidad);
                articulo.codigo_barras_modificado = element.stock.codigo_barras;
                articulo.diff_codigo_barras = (articulo.codigo_barras != element.stock.codigo_barras);

                if(articulo.empaque_detalle_id != element.stock.empaque_detalle_id){
                  articulo.empaque_detalle_modificado = element.stock.empaque_detalle.descripcion;
                }
                if(articulo.programa_id != element.stock.programa_id){
                  articulo.programa_modificado = element.stock.programa.descripcion;
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
                programa_id: element.stock.programa_id,
                programa_modificado: (element.stock.programa)?element.stock.programa.descripcion:'Sin Programa',
                lote_modificado: element.stock.lote,
                fecha_caducidad_modificado: element.stock.fecha_caducidad,
                codigo_barras_modificado: element.stock.codigo_barras,
                cantidad_enviada: element.cantidad,
                cantidad_recibida: element.cantidad,
                stock_id: null,
                stock_padre_id: element.stock_id,
                articulo_id:element.articulo.id,
                mostrar_campo: true,
              };
              //nuevos_articulos.push(articulo);
              datos_articulos.push(articulo);
            }
          });

          /*if(nuevos_articulos.length > 0){
            nuevos_articulos.forEach(element => {
              let articulo:any = datos_articulos.find(x => x.articulo_id == element.articulo_id && x.estatus_articulo == 'DEL');

              if(articulo){
                articulo.estatus_articulo = 'REPLACE';
                articulo.estatus_icono = 'edit_note';
                articulo.estatus_desc = 'Reemplazado';
                articulo.lote_modificado = element.lote_modificado;
                articulo.fecha_caducidad_modificado = element.fecha_caducidad_modificado;
                articulo.codigo_barras_modificado = element.codigo_barras_modificado;
                articulo.cantidad_enviada = element.cantidad_enviada;
                articulo.cantidad_recibida = element.cantidad_recibida;
                articulo.mostrar_campo = true;
                articulo.stock_padre_id = element.stock_padre_id;
                if(articulo.empaque_detalle_id != element.empaque_detalle_id){
                  articulo.empaque_detalle_modificado = element.empaque_detalle_modificado;
                }
              }else{
                datos_articulos.push(element);
              }
              
            });
          }*/
          //this.listaArticulos = datos_articulos;
          datos_articulos.sort((a, b)=>((a.clave < b.clave)?-1:1));

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
        this.alertPanel.mostrarError(errorMessage);
        this.isLoading = false;
      }
    );
  }

  aceptarCambios(){
    console.log('Resolver Conflicto Con Payload:',{});

    const askDialogRef = this.dialog.open(ConfirmActionDialogComponent, {
      width: '500px',
      data:{dialogTitle:'Aceptar la Modificación?',dialogMessage:'Para aceptar la modificación y aplicar los cambios escriba ACEPTAR',validationString:'ACEPTAR',btnColor:'primary',btnText:'Aceptar'}
    });

    askDialogRef.afterClosed().subscribe(valid => {
      if(valid){
        this.isSaving = true;
        this.almacenService.resolverConflictoModificacion(this.data.id,{}).subscribe(
          response =>{
            if(response.error) {
              let errorMessage = response.error;
              this.alertPanel.mostrarError(errorMessage);
            } else {
              if(response.data.otros_movimientos_afectados.total > 0){
                const subDialogRef = this.dialog.open(DialogoMovimientosAfectadosComponent, {
                  width: '80%',
                  height:'80%',
                  disableClose: false,
                  panelClass: 'no-padding-dialog',
                  data:{resultadoModificacion: response.data.otros_movimientos_afectados}
                });

                subDialogRef.afterClosed().subscribe(valid => {
                  this.dialogRef.close(true);
                });
              }else{
                this.dialogRef.close(true);
              }
            }
            this.isSaving = false;
          },
          errorResponse =>{
            var errorMessage = "Ocurrió un error.";
            if(errorResponse.status == 409){
              errorMessage = errorResponse.error.error.message;
            }
            this.alertPanel.mostrarError(errorMessage);
            this.isSaving = false;
          }
        );
      }
    });
  }

  mostrarMovimientos(lote){
    console.log('llegada: ',lote);

    let articulo:any = {nombre: lote.nombre, clave: lote.clave};
    let fecha_movimiento:any = new Date(this.datosEntrada.fecha_movimiento + 'T00:00:00');
    let stock:any = {
      id: lote.id,
      stock_id: lote.stock_id,
      cantidad: lote.cantidad_recibida,
      fecha_caducidad: lote.fecha_caducidad,
      estatus_caducidad: 1,
      empaque_detalle: {piezas_x_empaque: lote.piezas_x_empaque},
      entrada_piezas: lote.entrada_piezas,
      accion_lote: '',
    };

    if(lote.estatus_articulo == 'EDIT'){
      stock.accion_lote = 'create';
    }else if(lote.estatus_articulo == 'DEL'){
      stock.accion_lote = 'delete';
    }
    //TODO:: mas acciones
    const dialogRef = this.dialog.open(DialogoModificarStockComponent, {
      width: '80%',
      height:'80%',
      disableClose: false,
      panelClass: 'no-padding-dialog',
      data:{stock: stock, articulo: articulo, fecha_movimiento: fecha_movimiento, modo_conflicto: true},
    });

    dialogRef.afterClosed().subscribe(response => {
      if(response){
        console.log('dialog response: ',response);
      }
    });
  }

  aplicarCantidad(item){
    if(isNaN(item.cantidad_recibida) || item.cantidad_recibida < 0){
      item.cantidad_recibida = 0;
    }else if(item.cantidad_recibida > item.cantidad_enviada){
      item.cantidad_recibida = item.cantidad_enviada;
    }
  }

  cancelarAccion(){
    if(!this.isSaving){
      this.cerrar();
    }
  }

  cerrar(){
    this.dialogRef.close();
  }

}
