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
  ) {
    dialogRef.beforeClosed().subscribe(() => 
      {
        let return_val:any = null;
        if(this.loteData){
          return_val = {resguardoPiezas: this.loteData.resguardo_piezas};
        }
        dialogRef.close(return_val);
      }
    );
   }

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
          response.data.resguardo_detalle.forEach(element => {
            if(!element.son_piezas){
              element.cantidad_usada = Math.ceil(element.cantidad_restante / this.data.piezasXEmpaque);
            }else{
              element.cantidad_usada = element.cantidad_restante;
            }
          });
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
    if(this.formResguardo.valid && !this.isSaving){
      this.isSaving = true;
      let datos_detalle = this.formResguardo.value;

      let cantidad_piezas;
      if(datos_detalle.son_piezas){
        cantidad_piezas = datos_detalle.cantidad_resguardada;
      }else{
        cantidad_piezas = (datos_detalle.cantidad_resguardada * this.data.piezasXEmpaque);
      }

      let total_resguardo:number = 0;
      if(datos_detalle.id){
        let index = this.loteData.resguardo_detalle.findIndex(x => x.id == datos_detalle.id);
        let cantidad_anterior = this.loteData.resguardo_detalle[index].cantidad_restante;
        total_resguardo = (cantidad_piezas + (this.loteData.resguardo_piezas - cantidad_anterior));
      }else{
        total_resguardo = (cantidad_piezas + this.loteData.resguardo_piezas);
      }

      if(this.loteData.existencia_piezas < total_resguardo){
        this.formResguardo.get('cantidad_resguardada').setErrors({exceeded:true});
        this.formResguardo.get('cantidad_resguardada').markAsTouched();
        this.isSaving = false;
      }else{
        this.ajustesService.guardarResguardo(this.data.stockId,datos_detalle).subscribe(
          response =>{
            if(response.error) {
              let errorMessage = response.error;
              this.sharedService.showSnackBar(errorMessage, null, 3000);
            } else {
              let index = this.loteData.resguardo_detalle.findIndex(x => x.id == response.data.id);
              if(index >= 0){
                this.loteData.resguardo_detalle[index] = response.data;
                this.resguardoSeleccionado = false;
              }else{
                this.loteData.resguardo_detalle.push(response.data);
                this.formInput.focus();
                this.formResguardo.reset();
              }
              this.loteData.resguardo_piezas = response.stock_resguardo_piezas;
            }
            this.isSaving = false;
          },
          errorResponse =>{
            var errorMessage = "Ocurrió un error.";
            if(errorResponse.status == 409){
              errorMessage = errorResponse.error.error.message;
            }
            this.sharedService.showSnackBar(errorMessage, null, 3000);
            this.isSaving = false;
          }
        );
      }
    }
  }

  eliminarResguardo(id){
    //buscar y eliminar
    if(id){
      this.isSaving = true;
      this.ajustesService.borrarResguardo(id).subscribe(
        response =>{
          if(response.error) {
            let errorMessage = response.error;
            this.sharedService.showSnackBar(errorMessage, null, 3000);
          } else {
            let index = this.loteData.resguardo_detalle.findIndex(x => x.id == id);
            this.loteData.resguardo_detalle.splice(index,1);
            this.loteData.resguardo_piezas = response.data.resguardo_piezas;
            this.resguardoSeleccionado = false;
          }
          this.isSaving = false;
        },
        errorResponse =>{
          var errorMessage = "Ocurrió un error.";
          if(errorResponse.status == 409){
            errorMessage = errorResponse.error.error.message;
          }
          this.sharedService.showSnackBar(errorMessage, null, 3000);
          this.isSaving = false;
        }
      );
    }
  }

  cerrar(){
    this.dialogRef.close();
  }

}
