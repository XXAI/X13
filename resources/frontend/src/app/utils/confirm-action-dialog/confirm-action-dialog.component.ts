import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';

export interface PasswordDialogData {
  validationString?: string;
  dialogTitle?: string;
  dialogMessage?: string;
  btnColor?: string;
  btnText?: string;
}

@Component({
  selector: 'confirm-action-dialog',
  templateUrl: './confirm-action-dialog.component.html',
  styleUrls: ['./confirm-action-dialog.component.css']
})
export class ConfirmActionDialogComponent implements OnInit{

  constructor(
    public dialogRef: MatDialogRef<ConfirmActionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PasswordDialogData,
    private fb: FormBuilder
  ) {}

  title:string = 'Confirmar Acción';
  color:string = 'primary';
  btnText:string = 'Continuar';

  message:string;

  confirmValue:string;
  checkValue:boolean;
  validationString:string;

  confirmForm: FormGroup;
  
  ngOnInit(){
    this.validationString = this.data.validationString || undefined;
    
    if(this.validationString){
      this.checkValue = true;
    }else{
      this.checkValue = false;
    }
    
    this.title = this.data.dialogTitle || undefined;
    this.message = this.data.dialogMessage || undefined;
    this.color = this.data.btnColor || undefined;
    this.btnText = this.data.btnText || undefined;

    this.confirmForm = this.fb.group({
      'confirm-text': ['',[Validators.required,Validators.pattern(this.validationString)]]
    });
    
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  confirm():void {
    if(this.confirmForm.valid){
      this.dialogRef.close(true);
    }
  }

}