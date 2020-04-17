import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { PermissionsService } from '../permissions.service';
import { CustomValidator } from '../../../utils/classes/custom-validator';

export interface FormDialogData {
  id: number;
}

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css']
})
export class FormComponent implements OnInit {

  constructor(
    private permissionsService: PermissionsService,
    public dialogRef: MatDialogRef<FormComponent>,
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: FormDialogData
  ) {}

  isLoading:boolean = false;
  permiso:any = {};

  provideID:boolean = false;
  
  permisoForm = this.fb.group({
    'id': [{value:'',disabled:true},[Validators.maxLength(32),Validators.minLength(32), Validators.required, CustomValidator.notEqualToValidator('repeatedId')]],
    'repeatedId':[''],
    'description': ['',[Validators.required]],
    'group': ['',[Validators.required]],
    'is_super': [false]
  });

  ngOnInit() {
    let id = this.data.id;
    if(id){
      this.isLoading = true;
      this.permissionsService.getPermission(id).subscribe(
        response => {
          this.permiso = response.data;
          this.permisoForm.patchValue(this.permiso);
          this.isLoading = false;
        },
        errorResponse => {
          console.log(errorResponse);
          this.isLoading = false;
          if(errorResponse.error){
            if(errorResponse.error.validacion === false){
              this.manageRepeatedIDError(errorResponse);
            }
          }
        });
    }
  }

  savePermission(){
    this.isLoading = true;
    if(this.permiso.id){
      this.permissionsService.updatePermission(this.permiso.id,this.permisoForm.value).subscribe(
        response =>{
          this.dialogRef.close(true);
          console.log(response);
          this.isLoading = false;
        },
        errorResponse => {
          console.log(errorResponse);
          this.isLoading = false;
          if(errorResponse.error){
            if(errorResponse.error.validacion === false){
              this.manageRepeatedIDError(errorResponse);
            }
          }
      });
    }else{
      this.permissionsService.createPermission(this.permisoForm.value).subscribe(
        response =>{
          this.dialogRef.close(true);
          console.log(response);
          this.isLoading = false;
      },
        errorResponse => {
          console.log(errorResponse);
          this.isLoading = false;
          if(errorResponse.error){
            if(errorResponse.error.validacion === false){
              this.manageRepeatedIDError(errorResponse);
            }
          }
      });
    }
  }

  toggleID(){
    this.provideID = !this.provideID;
    if(this.provideID){
      this.permisoForm.get('id').enable();
      this.permisoForm.get('id').markAsDirty();
      this.permisoForm.get('id').markAsTouched();
    }else{
      this.permisoForm.get('id').disable();
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  manageRepeatedIDError(errorResponse:any){
    if(errorResponse.error.errores){
      for(let i in errorResponse.error.errores){
        if(i == 'id'){
          let errores = errorResponse.error.errores[i];
          for(let j in errores){
            if(errores[j] == 'El ID debe ser único'){
              this.permisoForm.get('repeatedId').patchValue(this.permisoForm.get('id').value);
              this.permisoForm.get('id').enable();
              this.permisoForm.get('id').markAsDirty();
              this.permisoForm.get('id').markAsTouched();
              break;
            }
          }
          break;
        }
      }
    }
  }

}