import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { startWith, map, debounceTime, tap, switchMap, finalize } from 'rxjs/operators';
import { SharedService } from '../../../shared/shared.service';
import { AlmacenesService } from '../almacenes.service';
import { AuthService } from '../../../auth/auth.service';
import { User } from '../../../auth/models/user';
//import { CustomValidator } from '../../utils/classes/custom-validator';

export interface FormDialogData {
  id: number;
}

@Component({
  selector: 'catalogo-almacenes',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css']
})
export class FormComponent implements OnInit {

  constructor(
    private almacenesService: AlmacenesService,
    private authService: AuthService,
    private sharedService: SharedService,
    public dialogRef: MatDialogRef<FormComponent>,
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: FormDialogData
  ) {}

  isLoading:boolean = false;
  almacenes:any = {};

  authUser: User;

  provideID:boolean = false;
  catalogos: any = {};
  filteredCatalogs:any = {};
  
  almacenForm = this.fb.group({

    'unidad_medica_id'      : [''],
    'nombre'                : ['',[Validators.required]],
    'tipo_almacen_id'       : ['',[Validators.required]],
    'externo'               : ['',[Validators.required]],
    'unidosis'              : ['',[Validators.required]],
    'responsable'           : ['',[Validators.required]],
    'user_id'               : ['',[Validators.required]]
    
  });

  ngOnInit() {

    this.authUser = this.authService.getUserData();

    this.almacenForm.get('user_id').patchValue(this.authUser?.id);

    console.log(this.authUser);
    console.log(this.almacenForm.get('user_id').value);

    //this.servicioForm.get('clues_id').patchValue(this.authClues.id);

    //console.log(this.authClues.id);

    let id = this.data.id;
    if(id){

      this.isLoading = true;
      this.almacenesService.getAlmacen(id).subscribe(
        response => {
          this.almacenes = response.servicio;
          this.almacenForm.patchValue(this.almacenes);
          this.isLoading = false;
        },
        errorResponse => {
          console.log(errorResponse);
          this.isLoading = false;
        });
    }

    this.cargarCatalogos();

  }

  public cargarCatalogos(){

    this.isLoading = true;
    let carga_catalogos = [

      {nombre:'unidades_medicas',orden:'nombre'},
      {nombre:'tipos_almacenes',orden:'descripcion'},

    ];

    this.almacenesService.obtenerCatalogos(carga_catalogos).subscribe(
      response => {

        this.catalogos = response.data;

        this.filteredCatalogs['municipios']      = this.almacenForm.controls['unidad_medica_id'].valueChanges.pipe(startWith(''),map(value => this._filter(value,'unidades_medicas','nombre')));
        this.filteredCatalogs['localidades']     = this.almacenForm.controls['tipo_almacen_id'].valueChanges.pipe(startWith(''),map(value => this._filter(value,'tipos_almacenes','descripcion')));

      },
      errorResponse =>{
        var errorMessage = "Ocurrió un error.";
        if(errorResponse.status == 409){
          errorMessage = errorResponse.error.message;
        }
        this.sharedService.showSnackBar(errorMessage, null, 3000);
      }
    );
    this.isLoading = false;
  }

  private _filter(value: any, catalog: string, valueField: string): string[] {
    if(this.catalogos[catalog]){
      let filterValue = '';
      if(value){
        if(typeof(value) == 'object'){
          filterValue = value[valueField].toLowerCase();
        }else{
          filterValue = value.toLowerCase();
        }
      }
      return this.catalogos[catalog].filter(option => option[valueField].toLowerCase().includes(filterValue));
    }
  }

  saveAlmacen(){

    this.isLoading = true;
    if(this.almacenes.id){
      this.almacenesService.updateAlmacen(this.almacenes.id,this.almacenForm.value).subscribe(
        response =>{
          this.dialogRef.close(true);
          this.isLoading = false;
        },
        errorResponse => {
          console.log(errorResponse);
          this.isLoading = false;
      });
    }else{
      this.almacenesService.createAlmacen(this.almacenForm.value).subscribe(
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