import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import * as FileSaver from 'file-saver';
import { ReportWorker } from 'src/app/web-workers/report-worker';
import { SharedService } from '../../../shared/shared.service';
import { RecepcionPedidosService } from '../recepcion-pedidos.service';

export interface RecepcionData {
  recepcionId: number;
}

@Component({
  selector: 'app-dialogo-detalles-recepcion',
  templateUrl: './dialogo-detalles-recepcion.component.html',
  styleUrls: ['./dialogo-detalles-recepcion.component.css']
})
export class DialogoDetallesRecepcionComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<DialogoDetallesRecepcionComponent>, 
    @Inject(MAT_DIALOG_DATA) public data: RecepcionData, 
    private recepcionPedidosService: RecepcionPedidosService,
    private sharedService: SharedService,
  ) { }

  isLoading:boolean;
  isLoadingPDF:boolean;

  datosRecepcion:any;

  ngOnInit(): void {
    this.isLoading = true;
    this.datosRecepcion = {};

    this.recepcionPedidosService.obtenerListaArticulosRecepcion(this.data.recepcionId).subscribe(
      response =>{
        if(response.error) {
          let errorMessage = response.error.message;
          this.sharedService.showSnackBar(errorMessage, null, 3000);
        } else {
          console.log(response);
          this.datosRecepcion = response.data;
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

  cerrar(){
    this.dialogRef.close();
  }

  imprimirRecepcionPDF(){
    this.isLoadingPDF = true;

    const reportWorker = new ReportWorker();
      reportWorker.onmessage().subscribe(
        data => {
          this.isLoadingPDF = false;
          FileSaver.saveAs(data.data,'RecepcionPedido:'+this.datosRecepcion.fecha_movimiento);
          reportWorker.terminate();
      });

      reportWorker.onerror().subscribe(
        (data) => {
          this.isLoadingPDF = false;
          reportWorker.terminate();
        }
      );
      
      reportWorker.postMessage({data:this.datosRecepcion, reporte:'pedidos/recepcion-pedido'});
  }

}
