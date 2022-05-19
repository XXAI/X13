import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { MatInput } from '@angular/material/input';
import { MatSelectionList } from '@angular/material/list';
import { SharedService } from 'src/app/shared/shared.service';
import { AjustesService } from '../ajustes.service';


export interface DialogData {
  stockId: number;
  articuloData:any;
  almacenData:any;
  piezasXEmpaque:number;
}

@Component({
  selector: 'app-dialogo-resguardo-lote',
  templateUrl: './dialogo-resguardo-lote.component.html',
  styleUrls: ['./dialogo-resguardo-lote.component.css']
})
export class DialogoResguardoLoteComponent implements OnInit {
  @ViewChild(MatSelectionList) listaDetallesResguardo: MatSelectionList;
  @ViewChild(MatInput) formInput: MatInput;

  constructor(
    public dialogRef: MatDialogRef<DialogoResguardoLoteComponent>,
    private sharedService: SharedService,
    private ajustesService: AjustesService,
    private formBuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    public dialog: MatDialog,
  ) { }

  isLoading:boolean;
  isSaving:boolean;

  formResguardo:FormGroup;

  resguardoSeleccionado:boolean;

  loteData:any;

  ngOnInit(): void {
    this.isLoading = true;

    console.log('datos: ',this.data);

    this.formResguardo = this.formBuilder.group({
      'id':                         [''],
      'descripcion':                ['',Validators.required],
      'son_piezas':                 [false],
      'cantidad_resguardada':       ['',[Validators.required,Validators.min(1)]],
      'condiciones_salida':         [''],
    });
    
    this.ajustesService.getLoteResguardo(this.data.stockId).subscribe(
      response =>{
        if(response.error) {
          let errorMessage = response.error;
          this.sharedService.showSnackBar(errorMessage, null, 3000);
        } else {
          console.log(response);
          this.loteData = response.data;
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

  seleccionarResguardo(event){
    let resguardo = event.option.value;
    console.log(resguardo);
    this.resguardoSeleccionado = true;
    this.formResguardo.reset();

    if(!resguardo.nuevo){
      this.formResguardo.patchValue(resguardo);
    }

    setTimeout (() => {
      this.formInput.focus();
    }, 100);
  }

  cancelarForm(){
    this.resguardoSeleccionado = false;
    this.listaDetallesResguardo.deselectAll();
  }

  guardarForm(){
    if(this.formResguardo.get('cantidad_resguardada').hasError('exceeded')){
      this.formResguardo.get('cantidad_resguardada').errors['exceeded'] = false;
      this.formResguardo.get('cantidad_resguardada').updateValueAndValidity();
    }
    if(this.formResguardo.valid){
      let datos_detalle = this.formResguardo.value;
      if(!datos_detalle.id){ //enviar a guardar
        datos_detalle.id = this.loteData.resguardo_detalle.length+1;
        

        let cantidad_piezas;
        if(datos_detalle.son_piezas){
          cantidad_piezas = datos_detalle.cantidad_resguardada;
        }else{
          cantidad_piezas = (datos_detalle.cantidad_resguardada * this.data.piezasXEmpaque);
        }

        if(this.loteData.existencia_piezas < (cantidad_piezas + this.loteData.resguardo_piezas)){
          this.formResguardo.get('cantidad_resguardada').setErrors({exceeded:true});
          this.formResguardo.get('cantidad_resguardada').markAsTouched();
        }else{
          this.loteData.resguardo_piezas += cantidad_piezas;
          this.loteData.resguardo_detalle.push(datos_detalle);
          this.formInput.focus();
          this.formResguardo.reset();
        }
      }else{
        //buscar y reemplazar
        let index = this.loteData.resguardo_detalle.findIndex(x => x.id == datos_detalle.id);
        this.loteData.resguardo_detalle[index] = datos_detalle;
        this.resguardoSeleccionado = false;
      }
    }
  }

  eliminarResguardo(id){
    ///
  }

  cerrar(){
    this.dialogRef.close();
  }

}
