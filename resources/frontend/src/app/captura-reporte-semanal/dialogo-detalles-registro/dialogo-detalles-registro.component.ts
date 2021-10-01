import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CapturaReporteSemanalService } from '../captura-reporte-semanal.service';
import { SharedService } from '../../shared/shared.service';
import { DatePipe } from '@angular/common';

export interface RegistroData {
  registroId: number;
}

@Component({
  selector: 'app-dialogo-detalles-registro',
  templateUrl: './dialogo-detalles-registro.component.html',
  styleUrls: ['./dialogo-detalles-registro.component.css']
})
export class DialogoDetallesRegistroComponent implements OnInit {

  constructor(
    public datepipe: DatePipe,
    public dialogRef: MatDialogRef<DialogoDetallesRegistroComponent>,
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: RegistroData,
    private capturaReporteSemanalService: CapturaReporteSemanalService,
    private sharedService: SharedService,
  ) { }

  isLoading:boolean;
  registroForm: FormGroup;
  
  ngOnInit(): void {
    this.isLoading = true;

    this.registroForm = this.fb.group({
      'id':                                   [''],
      'rango_inicio_fin':                     [''],
      'claves_medicamentos_catalogo':         [''],
      'claves_medicamentos_existentes':       [''],
      'claves_material_curacion_catalogo':    [''],
      'claves_material_curacion_existentes':  [''],
      'recetas_recibidas':                    [''],
      'recetas_surtidas':                     [''],
      'colectivos_recibidos':                 [''],
      'colectivos_surtidos':                  [''],
      'caducidad_3_meses_total_claves':       [''],
      'caducidad_3_meses_total_piezas':       [''],
      'caducidad_4_6_meses_total_claves':     [''],
      'caducidad_4_6_meses_total_piezas':     [''],
    });

    if(this.data.registroId){
      this.capturaReporteSemanalService.verRegistro(this.data.registroId).subscribe(
        response => {
          if(response.error) {
            let errorMessage = response.error.message;
            this.sharedService.showSnackBar(errorMessage, null, 3000);
          } else {
            response.data.rango_inicio_fin = response.data.fecha_inicio + ' - ' + response.data.fecha_fin;
            this.registroForm.patchValue(response.data);
          }
          this.isLoading = false;
        },
        errorResponse =>{
          var errorMessage = "Ocurrió un error.";
          if(errorResponse.status == 409){
            errorMessage = errorResponse.error.message;
          }
          this.sharedService.showSnackBar(errorMessage, null, 3000);
          this.isLoading = false;
        }
      );
    }else{
      this.isLoading = false;
    }
  }

  cerrar(){
    this.dialogRef.close();
  }
}
