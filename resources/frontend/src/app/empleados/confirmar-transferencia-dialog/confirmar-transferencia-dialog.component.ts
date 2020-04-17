import { Component, Inject, OnInit, ɵConsole, ModuleWithComponentFactories } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { FormBuilder, Validators } from '@angular/forms';
import { EmpleadosService } from '../empleados.service';
import { ConfirmActionDialogComponent } from '../../utils/confirm-action-dialog/confirm-action-dialog.component';

export interface ConfirmarTransferenciaDialogData {
  id?: number;
}

@Component({
  selector: 'confirmar-transferencia-dialog',
  templateUrl: './confirmar-transferencia-dialog.component.html',
  styleUrls: ['./confirmar-transferencia-dialog.component.css']
})
export class ConfirmarTransferenciaDialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<ConfirmarTransferenciaDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmarTransferenciaDialogData,
    private fb: FormBuilder,
    private empleadosService: EmpleadosService,
    public dialog: MatDialog
  ) { }

  id:number;
  idPermuta:number;

  isLoading:boolean = false;

  cluesOrigen:any = {};
  crOrigen:any = {};
  cluesDestino:any = {};
  crDestino:any = {};
  observaciones:string = '';

  permutaForm = this.fb.group({
    'observaciones':[''],
    'fecha_transferencia':['',Validators.required]
  });


  ngOnInit() {
    if(this.data.id){
      this.id = this.data.id;
      this.isLoading = true;
      this.empleadosService.obtenerDatosTransferenciaEmpleado(this.id).subscribe(
        response => {
          this.idPermuta = response.data.id;

          this.cluesOrigen = response.data.clues_origen;
          this.crOrigen = response.data.cr_origen;

          this.cluesDestino = response.data.clues_destino;
          this.crDestino = response.data.cr_destino;

          this.observaciones = response.data.observacion;

          this.isLoading = false;
        }
      );
    }
  }

  cancelar(): void {
    this.dialogRef.close();
  }

  rechazar(): void {
    const dialogRef = this.dialog.open(ConfirmActionDialogComponent, {
      width: '500px',
      data:{dialogTitle:'Rechazar Transferencia',dialogMessage:'¿Realmente desea rechazar la transferencia del trabajador? Escriba RECHAZAR a continuación para realizar el proceso.',validationString:'RECHAZAR',btnColor:'warn',btnText:'Rechazar'}
    });

    dialogRef.afterClosed().subscribe(valid => {
      if(valid){
        this.guardar(3);
      }
    });
  }

  aceptar(): void {
    const dialogRef = this.dialog.open(ConfirmActionDialogComponent, {
      width: '500px',
      data:{dialogTitle:'Aceptar Transferencia',dialogMessage:'¿Realmente desea aceptar la transferencia del trabajador? Escriba ACEPTAR a continuación para realizar el proceso.',validationString:'ACEPTAR',btnColor:'primary',btnText:'Aceptar'}
    });

    dialogRef.afterClosed().subscribe(valid => {
      if(valid){
        this.guardar(2);
      }
    });
  }

  guardar(estatus:number){
    let params = {};

    if(estatus == 2){
      let fecha_transferencia = (this.permutaForm.get('fecha_transferencia').value).toISOString();
      params['fecha_transferencia'] = fecha_transferencia.substring(0,10);
    }
    
    params['estatus'] = estatus;
    params['observaciones'] = this.permutaForm.get('observaciones').value;

    //console.log(params['fecha_transferencia']);
    //console.log(fecha.toISOString());
    //console.log(fecha.toLocaleDateString("es-MX",options));
    //return false;
    
    this.empleadosService.finalizarTransferenciaEmpleado(this.id,params).subscribe(
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
}