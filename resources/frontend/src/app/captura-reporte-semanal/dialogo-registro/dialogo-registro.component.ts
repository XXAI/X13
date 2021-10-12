import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CapturaReporteSemanalService } from '../captura-reporte-semanal.service';
import { SharedService } from '../../shared/shared.service';
import { DatePipe } from '@angular/common';

export interface RegistroData {
  registroId: number;
  semanaActiva?: any;
}

@Component({
  selector: 'app-dialogo-registro',
  templateUrl: './dialogo-registro.component.html',
  styleUrls: ['./dialogo-registro.component.css']
})
export class DialogoRegistroComponent implements OnInit {

  constructor(
    public datepipe: DatePipe,
    public dialogRef: MatDialogRef<DialogoRegistroComponent>,
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: RegistroData,
    private capturaReporteSemanalService: CapturaReporteSemanalService,
    private sharedService: SharedService,
  ) { }

  isLoading:boolean;
  isSaving:boolean;
  //range: FormGroup;
  registroForm: FormGroup;
  rangoFechasActivas:string;
  
  ngOnInit(): void {
    this.isLoading = true;

    /*this.range = this.fb.group({
      'fecha_inicio':         ['',Validators.required],
      'fecha_fin':            ['',Validators.required],
    });*/

    this.registroForm = this.fb.group({
      'id':                                   [''],
      'config_captura_id':                    ['',Validators.required],
      'claves_medicamentos_catalogo':         ['',Validators.required],
      'claves_medicamentos_existentes':       ['',Validators.required],
      'claves_material_curacion_catalogo':    ['',Validators.required],
      'claves_material_curacion_existentes':  ['',Validators.required],
      'recetas_recibidas':                    ['',Validators.required],
      'recetas_surtidas':                     ['',Validators.required],
      'colectivos_recibidos':                 ['',Validators.required],
      'colectivos_surtidos':                  ['',Validators.required],
      'caducidad_3_meses_total_claves':       ['',Validators.required],
      'caducidad_3_meses_total_piezas':       ['',Validators.required],
      'caducidad_4_6_meses_total_claves':     ['',Validators.required],
      'caducidad_4_6_meses_total_piezas':     ['',Validators.required],
    });

    if(this.data.registroId){
      this.capturaReporteSemanalService.verRegistro(this.data.registroId).subscribe(
        response => {
          if(response.error) {
            let errorMessage = response.error.message;
            this.sharedService.showSnackBar(errorMessage, null, 3000);
          } else {
            this.registroForm.patchValue(response.data);
            //response.data.fecha_inicio = new Date(response.data.fecha_inicio+'T12:00:00');
            //response.data.fecha_fin = new Date(response.data.fecha_fin+'T12:00:00');
            //this.range.patchValue(response.data);
            this.rangoFechasActivas = response.data.fecha_inicio + ' - ' + response.data.fecha_fin;
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
      if(this.data.semanaActiva){
        let semana_activa = this.data.semanaActiva;
        this.rangoFechasActivas = semana_activa.fecha_inicio + ' - ' + semana_activa.fecha_fin;
        this.registroForm.get('config_captura_id').patchValue(semana_activa.id);
      }
      
      this.isLoading = false;
    }
  }

  cancelar(){
    this.dialogRef.close();
  }

  guardarRegistro(){
    if(this.registroForm.valid){
      this.isSaving = true;
      let registro_data:any = {};
      
      registro_data = this.registroForm.value;
      //registro_data.rango_fechas = this.range.value;
      //registro_data.rango_fechas.fecha_inicio = this.datepipe.transform(this.data.semanaActiva.fecha_inicio, 'yyyy-MM-dd');
      //registro_data.rango_fechas.fecha_fin = this.datepipe.transform(this.data.semanaActiva.fecha_fin, 'yyyy-MM-dd');

      if(this.data.registroId){
        this.capturaReporteSemanalService.actualizarRegistro(registro_data,this.data.registroId).subscribe(
          response => {
            this.isSaving = false;
            if(response.error) {
              let errorMessage = response.error.message;
              this.sharedService.showSnackBar(errorMessage, null, 3000);
            } else {
              this.dialogRef.close(true);
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
        this.capturaReporteSemanalService.crearRegistro(registro_data).subscribe(
          response => {
            this.isSaving = false;
            if(response.error) {
              let errorMessage = response.error.message;
              this.sharedService.showSnackBar(errorMessage, null, 3000);
            } else {
              this.dialogRef.close(true);
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
}
