import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SharedService } from 'src/app/shared/shared.service';
import { CatalogosGeneralesService } from '../catalogos-generales.service';

export interface DialogData {
  catalogo:string;
  registro: any;
  formulario: any;
}

@Component({
  selector: 'app-dialogo-registro',
  templateUrl: './dialogo-registro.component.html',
  styleUrls: ['./dialogo-registro.component.css']
})
export class DialogoRegistroComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<DialogoRegistroComponent>,
    private sharedService: SharedService,
    private catalogosGeneralesService: CatalogosGeneralesService,
    private formBuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) { }

  isLoading:boolean;
  isSaving:boolean;
  formRegistro: FormGroup;
  formCampos:string[];
  actualizado:boolean;
  verBotonEliminar:boolean;

  ngOnInit(): void {
    this.isLoading = true;
    this.formCampos = [];
    let grupo_form:any = {'id': ['']};

    for (let key in this.data.formulario) {
      this.formCampos.push(key);
      let default_value:any = '';

      if(this.data.formulario[key].type == 'boolean' ){
        default_value = false;
      }

      if(this.data.formulario[key].required){
        grupo_form[key] = [default_value,Validators.required];
      }else{
        grupo_form[key] = [default_value];
      }
    }
    this.formRegistro = this.formBuilder.group(grupo_form);
    /*for (let key in this.data.formulario) {
      if(this.data.formulario[key].required){
        this.formRegistro.get(key).setValidators(Validators.required);
      }
    }*/
    setTimeout(() =>{
      if(this.data.registro){
        this.formRegistro.patchValue(this.data.registro);
        this.verBotonEliminar = true;
      }
      this.isLoading = false;
    });
  }

  guardarRegistro(){
    let valores = this.formRegistro.value;
    
    let params:any = {
      catalogo: this.data.catalogo,
      form_value: valores
    }

    this.catalogosGeneralesService.saveRegistro(params).subscribe(
      response =>{
        if(response.error) {
          let errorMessage = response.error;
          this.sharedService.showSnackBar(errorMessage, null, 3000);
        } else {
          this.actualizado = true;
          this.cerrar();
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

  eliminarRegistro(){
    let valores = this.formRegistro.value;
    
    let params:any = {
      catalogo: this.data.catalogo
    }

    this.catalogosGeneralesService.deleteRegistro(valores.id,params).subscribe(
      response =>{
        if(response.error) {
          let errorMessage = response.error;
          this.sharedService.showSnackBar(errorMessage, null, 3000);
        } else {
          this.actualizado = true;
          this.cerrar();
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
    this.dialogRef.close(this.actualizado);
  }
}
