import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface HorarioDialogData {
  id: number;
  horarioActual:any;
}

@Component({
  selector: 'editar-horario-dialog',
  templateUrl: './editar-horario-dialog.component.html',
  styleUrls: ['./editar-horario-dialog.component.css']
})
export class EditarHorarioDialogComponent implements OnInit {

  id:number;
  horarioActual:any = {};
  diasSemana: any = [
    {dia:1,label:'Lunes', abrev:'Lu'},
    {dia:2,label:'Martes', abrev:'Ma'},
    {dia:3,label:'Miercoles', abrev:'Mi'},
    {dia:4,label:'Jueves', abrev:'Ju'},
    {dia:5,label:'Viernes', abrev:'Vi'},
    {dia:6,label:'Sabado', abrev:'Sa'},
    {dia:7,label:'Domingo', abrev:'Do'},
  ];

  constructor(
    public dialogRef: MatDialogRef<EditarHorarioDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: HorarioDialogData,
  ) { }

  ngOnInit() {
    this.id = this.data.id;
    this.horarioActual = this.data.horarioActual;

    console.log(this.horarioActual);
  }

  cancelar(): void {
    this.dialogRef.close();
  }

  agregar(): void{
    console.log('agregar hora');
  }

  aceptar(): void {
    this.dialogRef.close(true);
  }

}