import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, Validators } from '@angular/forms';
import { GruposService  } from '../grupos.service';
import { SharedService } from '../../../shared/shared.service';
import { MatDialog } from '@angular/material/dialog';
//import { SelectorCrDialogComponent } from '../../../utils/selector-cr-dialog/selector-cr-dialog.component';

export interface GrupoDialogData {
  id?: number;
}

@Component({
  selector: 'app-dialogo-formulario-grupo',
  templateUrl: './dialogo-formulario-grupo.component.html',
  styleUrls: ['./dialogo-formulario-grupo.component.css']
})
export class DialogoFormularioGrupoComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<DialogoFormularioGrupoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: GrupoDialogData,
    private fb: FormBuilder,
    private sharedService: SharedService,
    private gruposService: GruposService,
    public dialog: MatDialog
  ) { }

  isSaving:boolean = false;
  isLoading:boolean = false;

  grupoId:number;
  tituloDialogo:string;

  listaCRs:any[];

  grupoForm = this.fb.group({
    'descripcion': ['',[Validators.required]],
    'total_unidades': ['0']
  });

  ngOnInit() {
    this.isLoading = true;

    if(this.data.id){
      this.grupoId = this.data.id;
      this.tituloDialogo = 'Editar';

      this.gruposService.getGrupo(this.grupoId).subscribe(
        response => {
          console.log(response);
          if(response.error) {
            let errorMessage = response.error.message;
            this.sharedService.showSnackBar(errorMessage, null, 3000);
          } else {
            this.grupoForm.patchValue(response.data);
            //this.listaCRs = response.data.lista_c_r;
          }
          this.isLoading = false;
        },
        errorResponse =>{
          var errorMessage = "Ocurrió un error.";
          if(errorResponse.status == 409){
            errorMessage = errorResponse.error.message;
          }
          this.sharedService.showSnackBar(errorMessage, null, 3000);
          this.isLoading = false;
        }
      );
    }else{
      this.isLoading = false;
      this.tituloDialogo = 'Nuevo';
    }
  }

  cancel(): void {
    this.dialogRef.close();
  }

  agregarCR(){
    /*const dialogRef = this.dialog.open(SelectorCrDialogComponent, {});

    dialogRef.afterClosed().subscribe(valid => {
      if(valid){
        console.log('Aceptar');
      }else{
        console.log('Cancelar');
      }
    });*/
  }

  obtenerListadoEmpleados(){
    let params = {
      //mode:'grouped',
      //grouped_by:'clues',
      
      //mode:'paginated',
      //page:5,
      //per_page:10,

      mode:'plain-list',

      //grupos: this.data.id,
      order:'clues|rfc',
      order_type:'ASC',

      //clues: 'CSSSA001|CSSSA002',
      //cr: '07000|070001',
      //estatus: '1|2|3',
      validado:1
    };

    /*this.gruposService.obtenerListaEmpleados(params).subscribe(
      response =>{
        if(response.error) {
          let errorMessage = response.error.message;
          this.sharedService.showSnackBar(errorMessage, null, 3000);
        } else {
          console.log(response);
        }
        this.isLoading = false;
      },
      errorResponse =>{
        var errorMessage = "Ocurrió un error.";
        if(errorResponse.status == 409){
          errorMessage = errorResponse.error.message;
        }
        this.sharedService.showSnackBar(errorMessage, null, 3000);
        this.isLoading = false;
      }
    );*/
  }

  guardar():void {
    if(this.grupoForm.valid){
      let grupo_data = JSON.parse(JSON.stringify(this.grupoForm.value));
      grupo_data.unidades_medicas = [];

      this.isSaving = true;
      if(this.grupoId){
        this.gruposService.updateGrupo(this.grupoId,grupo_data).subscribe(
          response => {
            console.log(response);
            this.isSaving = false;
            if(response.error) {
              let errorMessage = response.error.message;
              this.sharedService.showSnackBar(errorMessage, null, 3000);
            } else {
              console.log('Grupo editado');
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
      }else{
        this.gruposService.createGrupo(grupo_data).subscribe(
          response => {
            console.log(response);
            this.isSaving = false;
            if(response.error) {
              let errorMessage = response.error.message;
              this.sharedService.showSnackBar(errorMessage, null, 3000);
            } else {
              console.log('Grupo creado');
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
      //this.dialogRef.close(true);
    }
  }
}
