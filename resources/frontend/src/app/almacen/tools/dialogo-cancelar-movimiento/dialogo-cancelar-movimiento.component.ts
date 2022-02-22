import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-dialogo-cancelar-movimiento',
  templateUrl: './dialogo-cancelar-movimiento.component.html',
  styleUrls: ['./dialogo-cancelar-movimiento.component.css']
})
export class DialogoCancelarMovimientoComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<DialogoCancelarMovimientoComponent>,
    private formBuilder: FormBuilder
  ) { }

  cancelarForm: FormGroup;

  ngOnInit(): void {
    let hoy = new Date();
    this.cancelarForm = this.formBuilder.group({
      fecha:[hoy,Validators.required],
      motivo:['',Validators.required]
    });
  }

  cerrar(){
    this.dialogRef.close();
  }

  aceptar(){
    if(this.cancelarForm.valid){
      this.dialogRef.close(this.cancelarForm.value);
    }
  }

}
