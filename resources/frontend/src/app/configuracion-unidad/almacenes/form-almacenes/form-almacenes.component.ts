import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Validators, FormBuilder } from '@angular/forms';
import { SharedService } from '../../../shared/shared.service';
import { AlmacenesService } from '../almacenes.service';
import { User } from '../../../auth/models/user';
//import { CustomValidator } from '../../utils/classes/custom-validator';

export interface FormDialogData {
  id: number;
}

@Component({
  selector: 'form-almacenes',
  templateUrl: './form-almacenes.component.html',
  styleUrls: ['./form-almacenes.component.css']
})
export class FormAlmacenesComponent implements OnInit {

  constructor(
    private almacenesService: AlmacenesService,
    private sharedService: SharedService,
    public dialogRef: MatDialogRef<FormAlmacenesComponent>,
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: FormDialogData
  ) {}

  isLoading:boolean = false;
  almacenes:any = {};

  authUser: User;

  catalogos: any = {'tipos_almacenes':[],'tipos_movimiento':[]};
  tiposMovimientosSeleccionados:any[] = [];
  
  almacenForm = this.fb.group({
    'nombre'                : ['',Validators.required],
    'tipo_almacen_id'       : ['',Validators.required],
    'externo'               : [0],
    'direccion'             : [''],
    'puede_surtir_unidades' : [0],
    'responsable'           : [''],
    'tipos_movimiento_form' : [''],
  });

  ngOnInit() {
    //this.authUser = this.authService.getUserData();
    //console.log("asd",this.authUser.unidad_medica_asginada['clues']);
    //this.almacenForm.get('user_id').patchValue(this.authUser?.id);
    //this.almacenForm.get('unidad_medica_id').patchValue(this.authUser?.unidad_medica_asignada_id);
    //console.log("usuario",this.authUser);

    let id = this.data.id;
    if(id){
      this.isLoading = true;
      this.almacenesService.getAlmacen(id).subscribe(
        response => {
          this.almacenes = response.data;
          console.log("acaaa",this.almacenes);
          this.cargarCatalogos();
          this.almacenForm.patchValue(this.almacenes);
          this.isLoading = false;
        },
        errorResponse => {
          console.log(errorResponse);
          this.isLoading = false;
        });
    }else{
      this.cargarCatalogos();
    }

  }

  public cargarCatalogos(){

    this.isLoading = true;

    let carga_catalogos = [
      {nombre:'tipos_almacenes',orden:'descripcion'},
      {nombre:'tipos_movimiento',orden:'movimiento'},
    ];

    this.almacenesService.obtenerCatalogos(carga_catalogos).subscribe(
      response => {
        this.catalogos = response.data;
        this.isLoading = false;
        if(this.almacenes.id){
          this.almacenes.tipos_movimiento.forEach(item => {
            this.tiposMovimientosSeleccionados.push(this.catalogos['tipos_movimiento'].find(x => x.id == item.id));
          });
        }
      },
      errorResponse =>{
        var errorMessage = "Ocurrió un error.";
        if(errorResponse.status == 409){
          errorMessage = errorResponse.error.message;
        }
        this.sharedService.showSnackBar(errorMessage, null, 3000);
      }
      
    );

  }

  saveAlmacen(){
    let formData =  this.almacenForm.value;
    formData.tipos_movimiento = [];

    formData.tipos_movimiento_form.forEach(element => {
      formData.tipos_movimiento.push(element.id);
    });
    delete formData.tipos_movimiento_form;
    
    this.isLoading = true;
    if(this.almacenes.id){
      this.almacenesService.updateAlmacen(this.almacenes.id, formData).subscribe(
        response =>{
          this.dialogRef.close(true);
          this.isLoading = false;
        },
        errorResponse => {
          console.log(errorResponse);
          this.isLoading = false;
      });
    }else{
      this.almacenesService.createAlmacen(formData).subscribe(
        response =>{
          this.dialogRef.close(true);
          console.log(response);
          this.isLoading = false;
      },
        errorResponse => {
          console.log(errorResponse);
          this.isLoading = false;
      });
    }

  }

  onNoClick(): void {
    this.dialogRef.close();
  }



}