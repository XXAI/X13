import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SharedService } from 'src/app/shared/shared.service';
import { AlmacenService } from '../../almacen.service';

export interface DialogData {
  id: number;
}

@Component({
  selector: 'app-dialogo-historial-modificaciones',
  templateUrl: './dialogo-historial-modificaciones.component.html',
  styleUrls: ['./dialogo-historial-modificaciones.component.css']
})
export class DialogoHistorialModificacionesComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<DialogoHistorialModificacionesComponent>,
    private almacenService: AlmacenService, 
    private sharedService: SharedService,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) { }

  ngOnInit(): void {
  }

  cerrar(){
    this.dialogRef.close();
  }

}
