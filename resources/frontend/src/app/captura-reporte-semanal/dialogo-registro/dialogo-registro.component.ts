import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CapturaReporteSemanalService } from '../captura-reporte-semanal.service';
import { SharedService } from '../../shared/shared.service';

export interface RegistroData {
  registroId: number;
}

@Component({
  selector: 'app-dialogo-registro',
  templateUrl: './dialogo-registro.component.html',
  styleUrls: ['./dialogo-registro.component.css']
})
export class DialogoRegistroComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<DialogoRegistroComponent>,
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: RegistroData,
    private capturaReporteSemanalService: CapturaReporteSemanalService,
    private sharedService: SharedService,
  ) { }

  isSaving:boolean;
  range: FormGroup;
  registroForm: FormGroup;
  
  ngOnInit(): void {
    /*this.range = new FormGroup({
      start: new FormControl(),
      end: new FormControl()
    });*/

    this.range = this.fb.group({
      'fecha_inicio':         ['',Validators.required],
      'fecha_fin':            ['',Validators.required],
    });

    this.registroForm = this.fb.group({
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
      //LLamar api
    }
  }

  cancelar(){
    this.dialogRef.close();
  }

  guardarRegistro(){
    if(this.range.valid && this.registroForm.valid){
      let registro_data:any = {};
      
      registro_data = this.registroForm.value;
      registro_data.rango_fechas = this.range.value;

      if(this.data.registroId){
        //
      }else{
        this.capturaReporteSemanalService.crearRegistro(registro_data).subscribe(
          response => {
            console.log(response);
            this.isSaving = false;
            if(response.error) {
              let errorMessage = response.error.message;
              this.sharedService.showSnackBar(errorMessage, null, 3000);
            } else {
              console.log('Registro creado');
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
