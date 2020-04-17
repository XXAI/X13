import { Component, Inject, OnInit, ɵConsole, ModuleWithComponentFactories } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { FormBuilder, Validators } from '@angular/forms';
import { EmpleadosService } from '../empleados.service';
import { ConfirmActionDialogComponent } from '../../utils/confirm-action-dialog/confirm-action-dialog.component';

export interface BajaDialogData {
  id?: number;
}

@Component({
  selector: 'baja-dialog',
  templateUrl: './baja-dialog.component.html',
  styleUrls: ['./baja-dialog.component.css']
})
export class BajaDialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<BajaDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: BajaDialogData,
    private fb: FormBuilder,
    private empleadosService: EmpleadosService,
    public dialog: MatDialog
  ) { }

  id:number;

  isLoading:boolean = false;

  tiposBaja:any[] = [];

  bajaForm = this.fb.group({
    'tipo_baja_id':['',Validators.required],
    'fecha':['',Validators.required],
    'observaciones':[''],
  });

  ngOnInit() {
    this.id = this.data.id;
    this.isLoading = true;
    this.empleadosService.getCatalogoTiposBaja().subscribe(
      response => {
        this.tiposBaja = response.data;

        this.isLoading = false;
      }
    );
  }

  cancelar(): void {
    this.dialogRef.close();
  }

  aceptar(): void {
    const dialogRef = this.dialog.open(ConfirmActionDialogComponent, {
      width: '500px',
      data:{dialogTitle:'Dar de Baja al Empleado',dialogMessage:'¿Realmente desea dar de baja al trabajador? Escriba ACEPTAR a continuación para realizar el proceso.',validationString:'ACEPTAR',btnColor:'warn',btnText:'Aceptar'}
    });

    dialogRef.afterClosed().subscribe(valid => {
      if(valid){
        let params = this.bajaForm.value;

        params.fecha = JSON.stringify(params.fecha).substring(1,11);
        
        this.empleadosService.bajaEmpleado(this.id,params).subscribe(
          response =>{
            if(response.error) {
              let errorMessage = response.error.message;
            } else {
              console.log(response);
              this.dialogRef.close(true);
            }
            this.isLoading = false;
          },
          errorResponse =>{
            var errorMessage = "Ocurrió un error.";
            if(errorResponse.status == 409){
              errorMessage = errorResponse.error.message;
            }
            //this.sharedService.showSnackBar(errorMessage, null, 3000);
            this.isLoading = false;
          }
        );
      }
    });
  }
}