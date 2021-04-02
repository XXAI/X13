import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { PedidosService }  from '../../pedidos.service';
import { SharedService } from '../../../shared/shared.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-dialogo-nuevo-pedido',
  templateUrl: './dialogo-nuevo-pedido.component.html',
  styleUrls: ['./dialogo-nuevo-pedido.component.css']
})
export class DialogoNuevoPedidoComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<DialogoNuevoPedidoComponent>, private pedidosService: PedidosService, private sharedService: SharedService, public router: Router) { }

  tiposPedidos:any[];
  tipoSeleccionado:any;

  ngOnInit(): void {
    this.pedidosService.obtenerDatosCatalogo({tipos_pedido:true}).subscribe(
      response =>{
        if(response.error) {
          let errorMessage = response.error.message;
          this.sharedService.showSnackBar(errorMessage, null, 3000);
        } else {
          console.log(response);
          if(response.data.catalogos && response.data.catalogos['tipos_pedido']){
            this.tiposPedidos = response.data.catalogos['tipos_pedido'];
          }
        }
      },
      errorResponse =>{
        var errorMessage = "Ocurrió un error.";
        if(errorResponse.status == 409){
          errorMessage = errorResponse.error.error.message;
        }
        this.sharedService.showSnackBar(errorMessage, null, 3000);
      }
    );
  }

  crearNuevoPedido(){
    this.router.navigateByUrl('/pedidos/pedidos-ordinarios/nuevo/'+this.tipoSeleccionado.clave);
    this.dialogRef.close();
  }

}
