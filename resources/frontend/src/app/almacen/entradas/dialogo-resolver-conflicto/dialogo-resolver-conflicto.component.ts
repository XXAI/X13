import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
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

  constructor(
    public dialogRef: MatDialogRef<DialogoResolverConflictoComponent>,
    private almacenService: AlmacenService, 
    private sharedService: SharedService,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) { }

  isLoading:boolean;
  datosEntrada:any;
  listaArticulos:any[];

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
              clave: element.articulo.clave_local,
              nombre: element.articulo.descripcion,
              descripcion: element.articulo.especificaciones,
              lote: element.stock.lote,
              fecha_caducidad: element.stock.fecha_caducidad,
              codigo_barras: element.stock.codigo_barras,
              cantidad: element.cantidad,
              stock_id: element.stock_id,
              stock_padre_id: element.stock_padre_id
            };

            datos_articulos.push(dato_item);
          });
          this.listaArticulos = datos_articulos;
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
