import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SharedService } from '../../../shared/shared.service';
import { EstatusAvanceRecepcionService } from '../estatus-avance-recepcion.service';

export interface EntradaData {
  pedidoId: number;
}

@Component({
  selector: 'app-dialogo-subir-archivo',
  templateUrl: './dialogo-subir-archivo.component.html',
  styleUrls: ['./dialogo-subir-archivo.component.css']
})
export class DialogoSubirArchivoComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<DialogoSubirArchivoComponent>, 
    @Inject(MAT_DIALOG_DATA) public data: EntradaData, 
    private estatusAvanceService: EstatusAvanceRecepcionService,
    private sharedService: SharedService,
    private fb: FormBuilder,
  ) { }

  almacenes:any[];

  entradaForm = this.fb.group({
    'almacen_id': ['',[Validators.required]],
    'layout': ['',[Validators.required]],
  });

  fileInputLabel:string;

  ngOnInit(): void {
    this.almacenes = [];

    this.estatusAvanceService.obtenerDatosCatalogo({pedido_id:this.data.pedidoId}).subscribe(
      response =>{
        if(response.error) {
          let errorMessage = response.error.message;
          this.sharedService.showSnackBar(errorMessage, null, 3000);
        } else {
          console.log(response);
          this.almacenes = response.data.almacenes;
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

  onFileSelect(event) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      // console.log(file);
      this.fileInputLabel = file.name;
      this.entradaForm.get('layout').setValue(file);
    }
  }

  subirArchivo(){
    const formData = new FormData();
    formData.append('layout', this.entradaForm.get('layout').value);
    formData.append('almacen_id', this.entradaForm.get('almacen_id').value);
    formData.append('pedido_id', this.data.pedidoId.toString());

    this.estatusAvanceService.subirArchivo(formData).subscribe(
      response =>{
        if(response.error) {
          let errorMessage = response.error.message;
          this.sharedService.showSnackBar(errorMessage, null, 3000);
        } else {
          console.log(response);
          this.dialogRef.close(true);
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

  cancelar(){
    this.dialogRef.close();
  }
}
