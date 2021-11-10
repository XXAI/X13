import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CatalogoArticulosService } from '../catalogo-articulos.service';
import { SharedService } from 'src/app/shared/shared.service';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';

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
    private sharedService: SharedService,
    private formBuilder: FormBuilder
  ) { }

  isSaving: boolean;
  isLoading: boolean;
  datosArticulo: any;
  formArticulo: FormGroup;

  ngOnInit(): void {
    this.isLoading = true;
    this.datosArticulo = {};

    this.formArticulo = this.formBuilder.group({
      id:[''],
      cantidad_minima:[''],
      cantidad_maxima:[''],
      es_indispensable:['']
    });

    this.catalogoArticulosService.getArticulo(this.data.articuloId).subscribe(
      response =>{
        if(response.error) {
          let errorMessage = response.error.message;
          this.sharedService.showSnackBar(errorMessage, null, 3000);
        } else {
          console.log(response);
          this.datosArticulo = response.data.articulo;
          this.formArticulo.patchValue(response.data);
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

  cancelar(){
    this.dialogRef.close();
  }

  guardar(){
    if(this.formArticulo.valid){
      this.isSaving = true;
      let datosForm = this.formArticulo.value;

      this.catalogoArticulosService.updateArticulo(datosForm.id,datosForm).subscribe(
        response =>{
          if(response.error) {
            let errorMessage = response.error.message;
            this.sharedService.showSnackBar(errorMessage, null, 3000);
          } else {
            this.dialogRef.close(true);
          }
          this.isSaving = false;
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
  }

}
