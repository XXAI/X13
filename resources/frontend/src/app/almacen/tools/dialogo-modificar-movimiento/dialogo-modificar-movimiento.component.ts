import { DatePipe } from '@angular/common';
import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AuthService } from 'src/app/auth/auth.service';
import { User } from 'src/app/auth/models/user';
import { SharedService } from 'src/app/shared/shared.service';
import { AlmacenService } from '../../almacen.service';

export interface DialogData {
  id: number;
  modificacion?: any;
}

@Component({
  selector: 'app-dialogo-modificar-movimiento',
  templateUrl: './dialogo-modificar-movimiento.component.html',
  styleUrls: ['./dialogo-modificar-movimiento.component.css']
})
export class DialogoModificarMovimientoComponent implements OnInit {
  @ViewChild('username') username: ElementRef;

  constructor(
    public dialogRef: MatDialogRef<DialogoModificarMovimientoComponent>,
    private formBuilder: FormBuilder,
    private datepipe: DatePipe,
    private authService: AuthService,
    private almacenService: AlmacenService, 
    private sharedService: SharedService,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) { }

  authUser: User;
  hoy:Date;

  modificarForm: FormGroup;
  modificacionGuardada:boolean;
  aprobarModificacion:boolean;
  cancelarModificacion:boolean;
  mostrarFormUsuario:boolean;

  datosAprobado:any;
  datosCancelado:any;

  usuarioSolicita:string;
  puedeCancelar:boolean;
  puedeEditar:boolean;

  cancelado:boolean;

  mostrarErrores:boolean;
  mensajeError:string;

  isLoading:boolean;

  ngOnInit(): void {
    this.cancelado = false;
    this.puedeEditar = true;
    this.mostrarErrores = false;
    this.puedeCancelar = false;
    this.mostrarFormUsuario = false;
    this.aprobarModificacion = false;
    this.cancelarModificacion = false;
    this.modificacionGuardada = false;
    this.hoy = new Date();
    this.modificarForm = this.formBuilder.group({
      id:[''],
      solicitado_fecha:[this.hoy,Validators.required],
      motivo_modificacion:['',Validators.required],
    });

    this.authUser = this.authService.getUserData();

    if(this.data.modificacion){
      this.cargarDatosGuardados(this.data.modificacion);
    }else{
      this.usuarioSolicita = this.authUser.name;
    }
  }

  toggleMostrarFormUsuario(accion:string = ''){
    this.mostrarFormUsuario = !this.mostrarFormUsuario;
    if(this.mostrarFormUsuario){
      if(!this.puedeCancelar || accion == 'aprobar'){
        this.modificarForm.addControl('usuario', new FormControl('',Validators.required));
        this.modificarForm.addControl('contrasena', new FormControl('',Validators.required));
        setTimeout (() => {
          if(this.username){
            this.username.nativeElement.focus();
          }
        }, 10);
      }
      
      if(accion == 'cancelar'){
        this.cancelarModificacion = true;
      }else{
        this.aprobarModificacion = true;
      }
    }else{
      this.modificarForm.removeControl('usuario');
      this.modificarForm.removeControl('contrasena');
      this.aprobarModificacion = false;
      this.cancelarModificacion = false;
    }
    this.modificarForm.updateValueAndValidity();
  }

  cerrar(){
    this.dialogRef.close(this.data.modificacion);
  }

  aceptar(){
    if(this.modificarForm.valid){
      this.isLoading = true;
      this.mensajeError = '';
      this.mostrarErrores = false;
      let params = this.modificarForm.value;
      params.aprobar = this.aprobarModificacion;
      params.cancelar = this.cancelarModificacion;
      params.solicitado_fecha = this.datepipe.transform(params.solicitado_fecha, 'yyyy-MM-dd');

      this.almacenService.administrarModificacion(this.data.id, params).subscribe(
        response =>{
          if(response.error) {
            this.mensajeError = response.error;
            this.mostrarErrores = true;
            if(response.data){
              this.cargarDatosGuardados(response.data);
              this.data.modificacion = response.data;
            }
            //let errorMessage = response.error;
            //this.sharedService.showSnackBar(errorMessage, null, 3000);
          }else{
            this.sharedService.showSnackBar('Datos Guardados con Éxito', null, 3000);
            this.cargarDatosGuardados(response.data);
            this.data.modificacion = response.data;
          }

          if(this.mostrarFormUsuario){
            this.toggleMostrarFormUsuario();
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
    }
  }

  cargarDatosGuardados(response){
    this.modificacionGuardada = true;
    this.usuarioSolicita = response.solicitado_usuario.name;
    if(typeof response.solicitado_fecha === 'string'){
      response.solicitado_fecha = new Date(response.solicitado_fecha+'T12:00:00');
    }
    this.modificarForm.patchValue(response);

    if(this.authUser.id == response.solicitado_usuario_id){
      this.puedeCancelar = true;
      this.puedeEditar = true;
    }else{
      this.puedeCancelar = false;
      this.puedeEditar = false;
    }

    if(response.estatus == 'MOD'){
      this.datosAprobado = {
        nombre: response.aprobado_usuario.name,
        fecha: new Date(response.aprobado_fecha+'T12:00:00')
      };
      this.puedeEditar = false;
    }else if (response.estatus == 'CAN'){
      this.datosCancelado = {
        nombre: response.cancelado_usuario.name,
        fecha: new Date(response.cancelado_fecha+'T12:00:00')
      };
      this.cancelado = true;
      this.puedeEditar = false;
    }
  }

}
