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
  selector: 'form-almacenes',
  templateUrl: './form-almacenes.component.html',
  styleUrls: ['./form-almacenes.component.css']
})
export class FormAlmacenesComponent implements OnInit {

  constructor(
    private almacenesService: AlmacenesService,
    private authService: AuthService,
    private sharedService: SharedService,
    public dialogRef: MatDialogRef<FormAlmacenesComponent>,
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
    //console.log("asd",this.authUser.unidad_medica_asginada['clues']);

    this.almacenForm.get('user_id').patchValue(this.authUser?.id);
    this.almacenForm.get('unidad_medica_id').patchValue(this.authUser?.unidad_medica_asignada_id);

    console.log("usuario",this.authUser);

    let id = this.data.id;
    if(id){

      this.isLoading = true;
      this.almacenesService.getAlmacen(id).subscribe(
        response => {
          this.almacenes = response.data;
          console.log("acaaa",this.almacenes);
          this.cargarCatalogos(this.almacenes);
          this.almacenForm.patchValue(this.almacenes);
          this.isLoading = false;
        },
        errorResponse => {
          console.log(errorResponse);
          this.isLoading = false;
        });
    }

    this.cargarCatalogos(null);

  }

  public cargarCatalogos(obj){

    this.isLoading = true;

    let carga_catalogos = [

      {nombre:'unidades_medicas',orden:'nombre'},
      {nombre:'tipos_almacenes',orden:'descripcion'},

    ];

    this.almacenesService.obtenerCatalogos(carga_catalogos).subscribe(
      response => {

        this.catalogos = response.data;

        this.filteredCatalogs['unidades_medicas']      = this.almacenForm.controls['unidad_medica_id'].valueChanges.pipe(startWith(''),map(value => this._filter(value,'unidades_medicas','nombre')));
        this.filteredCatalogs['tipos_almacenes']     = this.almacenForm.controls['tipo_almacen_id'].valueChanges.pipe(startWith(''),map(value => this._filter(value,'tipos_almacenes','descripcion')));


        if(obj)
        {
          if(obj.tipo_almacen){
            this.almacenForm.get('tipo_almacen_id').setValue(obj.tipo_almacen);
          }

          if(obj.unidad_medica){
            this.almacenForm.get('unidad_medica_id').setValue(obj.unidad_medica);
          }
        }

        this.isLoading = false;

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
  
  getDisplayFn(label: string){
    return (val) => this.displayFn(val,label);
  }

  displayFn(value: any, valueLabel: string){
    return value ? value[valueLabel] : value;
  }

  saveAlmacen(){

    let formData =  JSON.parse(JSON.stringify(this.almacenForm.value));

    if(formData.tipo_almacen_id){
      formData.tipo_almacen_id = formData.tipo_almacen_id.id;
    }
    if (typeof formData.unidad_medica_id === 'object'){
      formData.unidad_medica_id = formData.unidad_medica_id.id;
    }

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