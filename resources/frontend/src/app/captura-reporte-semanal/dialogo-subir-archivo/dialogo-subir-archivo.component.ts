import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { SharedService } from '../../shared/shared.service';
import { SubirArchivoService } from '../subir-archivo.service';

@Component({
  selector: 'app-dialogo-subir-archivo',
  templateUrl: './dialogo-subir-archivo.component.html',
  styleUrls: ['./dialogo-subir-archivo.component.css']
})
export class DialogoSubirArchivoComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<DialogoSubirArchivoComponent>, 
    private subirArchivoService: SubirArchivoService,
    private sharedService: SharedService,
    private fb: FormBuilder,
  ) { }

  isLoading:boolean;

  importSubscription:Subscription;
  
  entradaForm = this.fb.group({
    'archivo': ['',[Validators.required]]
  });

  fileInputLabel:string;

  ngOnInit(): void {
    //
  }

  onFileSelect(event) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.fileInputLabel = file.name;
      this.entradaForm.get('archivo').setValue(file);
    }
  }

  subirArchivo(){
    let errorDetails = null;
    this.isLoading = true;

    if(this.importSubscription != null){
      this.importSubscription.unsubscribe();
    }

    const formData = new FormData();
    formData.append('archivo', this.entradaForm.get('archivo').value, this.fileInputLabel);
    
    this.importSubscription = this.subirArchivoService.upload(formData).subscribe(
      response => {
        this.isLoading = false;
        //console.log(success);
        this.sharedService.showSnackBar('El archivo fue subido satisfactoriamente', null, 3000);
        this.dialogRef.close(response.data);
      },
      error =>{
        this.isLoading = false;
        let dataError = error.error;
        //console.error(error);
        let message = "Hubo en error al importar";
        if(error.status == 0){
          message = "Hubo un error antes de subir el archivo.";
          errorDetails = "¿Modifico el archivo después de seleccionarlo? Si es así, por favor recargue la página o seleccione otro archivo.";
        } else if(error.status == 400){
          message = dataError.message;
          errorDetails = dataError.data;
        }
        this.sharedService.showSnackBar(message, null, 3000);
      }

    );
  }

  cancelar(){
    this.dialogRef.close();
  }
}
