import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AdminCapturaSemanalService } from '../admin-captura-semanal.service';
import { ConfirmActionDialogComponent } from '../../utils/confirm-action-dialog/confirm-action-dialog.component';

import { SharedService } from '../../shared/shared.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-dialogo-config-captura',
  templateUrl: './dialogo-config-captura.component.html',
  styleUrls: ['./dialogo-config-captura.component.css']
})

export class DialogoConfigCapturaComponent implements OnInit {

  constructor(
    public datepipe: DatePipe,
    public dialogRef: MatDialogRef<DialogoConfigCapturaComponent>,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private adminCapturaSemanalService: AdminCapturaSemanalService,
    private sharedService: SharedService,
  ) { }

  isLoading: boolean;
  isSaving: boolean;
  configForm: FormGroup;
  isEditing: number;

  listaSemanasCapturadas:any[];
  
  ngOnInit(): void {
    this.isLoading = true;
    this.listaSemanasCapturadas = [];

    this.configForm = this.fb.group({
      'id':           [''],
      'fecha_inicio': ['',Validators.required],
      'fecha_fin':    ['',Validators.required],
      'no_semana':    ['',Validators.required],
      'activo':       [''],
    });

    this.loadListadoSemanas();
  }

  loadListadoSemanas(){
    this.isLoading = true;
    let params:any;
    
    this.adminCapturaSemanalService.obtenerListaSemanas(params).subscribe(
      response =>{
        if(response.error) {
          let errorMessage = response.error.message;
          this.sharedService.showSnackBar(errorMessage, null, 3000);
        } else {
          this.listaSemanasCapturadas = response.data;
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

    return event;
  }

  editarSemana(id){
    let index = this.listaSemanasCapturadas.findIndex(item => item.id == id);
    let semana = this.listaSemanasCapturadas[index];

    let semana_edit = JSON.parse(JSON.stringify(semana));

    semana_edit.fecha_inicio = new Date(semana_edit.fecha_inicio+'T12:00:00');
    semana_edit.fecha_fin = new Date(semana_edit.fecha_fin+'T12:00:00');

    this.configForm.patchValue(semana_edit);
    this.isEditing = semana_edit.id;
  }

  eliminarSemana(id, eliminarRegistros:boolean = false){
    let titulo:string = 'Eliminar Semana';
    let mensaje:string = 'Esta seguro de eliminar esta semana?';
    let params:any;

    if(eliminarRegistros){
      titulo = 'Eliminar Registros';
      mensaje = 'Esta seguro de eliminar los registros de esta semana?';
      params = {'borrar_solo_registros':true};
    }

    const dialogRef = this.dialog.open(ConfirmActionDialogComponent, {
      width: '500px',
      data:{dialogTitle:titulo, dialogMessage:mensaje, btnColor:'warn',btnText:'Eliminar'}
    });

    dialogRef.afterClosed().subscribe(valid => {
      if(valid){
        this.adminCapturaSemanalService.borrarSemana(id, params).subscribe(
          response =>{
            if(response.error) {
              let errorMessage = response.error.message;
              this.sharedService.showSnackBar(errorMessage, null, 3000);
            } else {
              this.loadListadoSemanas();
            }
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
    });
  }

  resetearForm(){
    this.configForm.reset();
    this.isEditing = 0;
  }

  guardarSemana(){
    if(this.configForm.valid){
      this.isSaving = true;
      let registro_data:any = {};
      
      registro_data = this.configForm.value;
      
      registro_data.fecha_inicio = this.datepipe.transform(registro_data.fecha_inicio, 'yyyy-MM-dd');
      registro_data.fecha_fin = this.datepipe.transform(registro_data.fecha_fin, 'yyyy-MM-dd');

      if(registro_data.id){
        this.adminCapturaSemanalService.actualizarSemana(registro_data,registro_data.id).subscribe(
          response => {
            this.isSaving = false;
            if(response.error) {
              let errorMessage = response.error.message;
              this.sharedService.showSnackBar(errorMessage, null, 3000);
            } else {
              this.configForm.reset();
              this.isEditing = 0;
              this.loadListadoSemanas();
            }
            //this.isLoading = false;
          },
          errorResponse =>{
            this.isSaving = false;
            var errorMessage = "Ocurrió un error.";
            if(errorResponse.status == 409){
              errorMessage = errorResponse.error.message;
            }
            this.sharedService.showSnackBar(errorMessage, null, 3000);
            //this.isLoading = false;
          }
        );
      }else{
        this.adminCapturaSemanalService.crearSemana(registro_data).subscribe(
          response => {
            this.isSaving = false;
            if(response.error) {
              let errorMessage = response.error.message;
              this.sharedService.showSnackBar(errorMessage, null, 3000);
            } else {
              this.configForm.reset();
              this.loadListadoSemanas();
            }
            //this.isLoading = false;
          },
          errorResponse =>{
            this.isSaving = false;
            var errorMessage = "Ocurrió un error.";
            if(errorResponse.status == 409){
              errorMessage = errorResponse.error.message;
            }
            this.sharedService.showSnackBar(errorMessage, null, 3000);
            //this.isLoading = false;
          }
        );
      }
    }
  }

  cerrar(){
    this.dialogRef.close();
  }
}
