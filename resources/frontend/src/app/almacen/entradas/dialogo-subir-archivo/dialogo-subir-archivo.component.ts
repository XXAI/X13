import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable, Subscription } from 'rxjs';
import { SharedService } from '../../../shared/shared.service';
import { EntradasService } from '../entradas.service';
import { AlmacenService } from '../../almacen.service';
import { SubirArchivoService } from '../subir-archivo.service';
import { startWith, map } from 'rxjs/operators';

export interface EntradaData {
  pedidoId: number;
}

@Component({
  selector: 'app-dialogo-subir-archivo',
  templateUrl: './dialogo-subir-archivo.component.html',
  styleUrls: ['./dialogo-subir-archivo.component.css']
})
export class DialogoSubirArchivoComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<DialogoSubirArchivoComponent>, 
    @Inject(MAT_DIALOG_DATA) public data: EntradaData, 
    private entradasService: EntradasService,
    private almacenService: AlmacenService,
    private subirArchivoService: SubirArchivoService,
    private sharedService: SharedService,
    private fb: FormBuilder,
  ) { }

  isLoading:boolean;

  importSubscription:Subscription;
  
  almacenes:any[];
  programas:any[];

  filteredProgramas: Observable<any[]>;

  erroresImport: any[];

  entradaForm = this.fb.group({
    'almacen_id': ['',[Validators.required]],
    'programa': ['',[Validators.required]],
    'layout': ['',[Validators.required]],
  });

  fileInputLabel:string;

  ngOnInit(): void {
    this.almacenes = [];
    this.programas = [];

    let lista_catalogos:any = {almacenes:'*',programas:'*'};

    this.almacenService.obtenerMovimientoCatalogos(lista_catalogos).subscribe(
      response =>{
        if(response.error) {
          let errorMessage = response.error.message;
          this.sharedService.showSnackBar(errorMessage, null, 3000);
        } else {
          //console.log(response);
          this.almacenes = response.data.almacenes;
          this.programas = response.data.programas;

          this.filteredProgramas = this.entradaForm.get('programa').valueChanges.pipe( startWith(''), map(value => typeof value === 'string' ? value : (value)?value.descripcion:''),
                          map(descripcion => descripcion ? this._filter(descripcion,'descripcion') : this.programas.slice())
                        );
        }
      },
      errorResponse =>{
        var errorMessage = "Ocurrió un error.";
        if(errorResponse.status == 409){
          errorMessage = errorResponse.error.error.message;
        }
        this.sharedService.showSnackBar(errorMessage, null, 3000);
      }
    );
  }

  onFileSelect(event) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      // console.log(file);
      this.fileInputLabel = file.name;
      this.entradaForm.get('layout').setValue(file);
    }
  }

  subirArchivo(){
    let errorDetails = null;
    this.erroresImport = null;
    this.isLoading = true;

    if(this.importSubscription != null){
      this.importSubscription.unsubscribe();
    }

    const formData = new FormData();
    formData.append('layout', this.entradaForm.get('layout').value, this.fileInputLabel);
    formData.append('almacen_id', this.entradaForm.get('almacen_id').value);
    formData.append('programa_id', this.entradaForm.get('programa').value.id);

    this.importSubscription = this.subirArchivoService.upload(formData).subscribe(
      success => {
        this.isLoading = false;
        //console.log(success);
        this.sharedService.showSnackBar('Importación satisfactoria', null, 3000);
        this.dialogRef.close(true);
      },
      error =>{
        this.isLoading = false;

        let dataError = error.error;
        //console.error(error);
        let message = "Hubo en error al importar";
        if(error.status == 0){
          message = "Hubo un error antes de subir el archivo.";
          errorDetails = "¿Modifico el archivo después de seleccionarlo? Si es así, por favor recargue la página o seleccione otro archivo.";
        } else if(error.status == 400){
          message = dataError.message;
          errorDetails = dataError.data;
          this.dialogRef.updateSize('99%', '50%');
          this.erroresImport = [];
          for(let i in errorDetails){
            this.erroresImport.push({
              'linea': errorDetails[i].index,
              'error': errorDetails[i].message,
              'clave': errorDetails[i].data.clave,
              'articulo': errorDetails[i].data.articulo,
            });
          }
        }
        this.sharedService.showSnackBar(message, null, 3000);
      }

    );
  }

  downloadFile(data: any) {
    const replacer = (key, value) => (value === null ? '' : value); // specify how you want to handle null values here
    const header = Object.keys(data[0]);
    const csv = data.map((row) =>
      header
        .map((fieldName) => JSON.stringify(row[fieldName], replacer))
        .join(',')
    );
    csv.unshift(header.join(','));
    const csvArray = csv.join('\r\n');
  
    const a = document.createElement('a');
    const blob = new Blob([csvArray], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
  
    a.href = url;
    a.download = 'errores-layout-entrada-excel.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  }

  getDisplayFn(label: string){
    return (val) => this.displayFn(val,label);
  }

  displayFn(value: any, valueLabel: string){
    return value ? value[valueLabel] : '';
  }

  private _filter(value: string, field: string): any[] {
    const filterValue = value.toLowerCase();
    return this.programas.filter(option => option[field].toLowerCase().includes(filterValue));
  }

  cancelar(){
    this.dialogRef.close();
  }
}
