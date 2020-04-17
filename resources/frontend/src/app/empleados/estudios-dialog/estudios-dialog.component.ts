import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, Validators } from '@angular/forms';

export interface EstudiosDialogData {
  id?: number;
}

@Component({
  selector: 'estudios-dialog',
  templateUrl: './estudios-dialog.component.html',
  styleUrls: ['./estudios-dialog.component.css']
})
export class EstudiosDialogComponent implements OnInit {

  id:number;
  catalogos:any = {
    'tipo_profesion':[],
    'profesion':[]
  };

  estudiosForm = this.fb.group({
    'tipo_profesion_id': [''],
    'profesion_id': [''],
    'fecha':[''],
    'cedula':['']
  });

  constructor(
    public dialogRef: MatDialogRef<EstudiosDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EstudiosDialogData,
    private fb: FormBuilder,
  ) {}
  
  ngOnInit() {
    if(this.data.id){
      this.id = this.data.id;
    }
  }

  cancelar(): void {
    this.dialogRef.close();
  }

  guardar(): void {
    this.dialogRef.close(true);
  }
}