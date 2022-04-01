import { DatePipe } from '@angular/common';
import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface DialogData {
  id: number;
  data?: any;
}

@Component({
  selector: 'app-dialogo-modificar-movimiento',
  templateUrl: './dialogo-modificar-movimiento.component.html',
  styleUrls: ['./dialogo-modificar-movimiento.component.css']
})
export class DialogoModificarMovimientoComponent implements OnInit {
  @ViewChild('username') username: ElementRef;

  constructor(
    public dialogRef: MatDialogRef<DialogoModificarMovimientoComponent>,
    private formBuilder: FormBuilder,
    private datepipe: DatePipe,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) { }

  modificarForm: FormGroup;
  aprobarModificacion:boolean;
  modificacionSolicitada:any;
  cancelarModificacion:boolean;

  isLoading:boolean;

  ngOnInit(): void {
    this.aprobarModificacion = false;
    let hoy = new Date();
    this.modificarForm = this.formBuilder.group({
      fecha:[hoy,Validators.required],
      motivo:['',Validators.required],
    });
  }

  toggleAprobarModificacion(){
    this.aprobarModificacion = !this.aprobarModificacion;
    if(this.aprobarModificacion){
      this.modificarForm.addControl('usuario', new FormControl('',Validators.required));
      this.modificarForm.addControl('contrasena', new FormControl('',Validators.required));
      setTimeout (() => {
        this.username.nativeElement.focus();
      }, 10);
    }else{
      this.modificarForm.removeControl('usuario');
      this.modificarForm.removeControl('contrasena');
    }
    this.modificarForm.updateValueAndValidity();
  }

  cerrar(){
    this.dialogRef.close();
  }

  aceptar(){
    if(this.modificarForm.valid){
      this.isLoading = true;
      let params = this.modificarForm.value;
      params.aprobar = this.aprobarModificacion;
      params.fecha = this.datepipe.transform(params.fecha, 'yyyy-MM-dd');
      console.log('datos Formulario',params);
      //this.dialogRef.close(this.modificarForm.value);
    }
  }

}
