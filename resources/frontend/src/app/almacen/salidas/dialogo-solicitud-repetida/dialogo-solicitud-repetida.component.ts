import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';

export interface DialogData {
  error: string;
  data?: any;
}

@Component({
  selector: 'app-dialogo-solicitud-repetida',
  templateUrl: './dialogo-solicitud-repetida.component.html',
  styleUrls: ['./dialogo-solicitud-repetida.component.css']
})
export class DialogoSolicitudRepetidaComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<DialogoSolicitudRepetidaComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) { }
  
  displayedColumns: string[] = ['aritculo','solicitado','surtido'];
  dataSource: MatTableDataSource<any>;

  ngOnInit(): void {
    this.dataSource = new MatTableDataSource<any>(this.data.data.lista_articulos);
  }

  cerrar(){
    this.dialogRef.close();
  }

}
