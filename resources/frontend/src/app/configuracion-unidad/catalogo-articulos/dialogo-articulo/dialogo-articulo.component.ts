import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CatalogoArticulosService } from '../catalogo-articulos.service';
import { SharedService } from 'src/app/shared/shared.service';

export interface ArticuloData {
  articuloId: number;
}

@Component({
  selector: 'app-dialogo-articulo',
  templateUrl: './dialogo-articulo.component.html',
  styleUrls: ['./dialogo-articulo.component.css']
})
export class DialogoArticuloComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<DialogoArticuloComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ArticuloData,
    private catalogoArticulosService: CatalogoArticulosService,
    private sharedService: SharedService
  ) { }

  isLoading: boolean;
  datosArticulo: any;

  ngOnInit(): void {
    this.isLoading = true;
    this.datosArticulo = {};

    this.catalogoArticulosService.getArticulo(this.data.articuloId).subscribe(
      response =>{
        if(response.error) {
          let errorMessage = response.error.message;
          this.sharedService.showSnackBar(errorMessage, null, 3000);
        } else {
          console.log(response);
          this.datosArticulo = response.data.articulo;
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

}
