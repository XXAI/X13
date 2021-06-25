import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, Validators } from '@angular/forms';
import { GruposService  } from '../grupos.service';
import { SharedService } from '../../../shared/shared.service';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
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

  unidadMedicaPrincipalId:number;

  filtroUnidades:string;
  unidadesDataSource: MatTableDataSource<any>;
  listaUnidades:any[];
  controlUnidadesSeleccionadas:any;
  totalUnidadesSeleccionadas:number;

  filtroUnidadesGrupo:string;
  unidadesGrupoDataSource: MatTableDataSource<any>;
  listaUnidadesGrupo:any[];
  controlUnidadesGrupoSeleccionadas:any;
  totalUnidadesGrupoSeleccionadas:number;

  grupoForm = this.fb.group({
    'descripcion': ['',[Validators.required]],
    'total_unidades': ['0'],
    'unidad_medica_principal':[],
    'unidad_medica_principal_id':[]
  });

  ngOnInit() {
    this.isLoading = true;
    this.listaUnidades = [];
    this.listaUnidadesGrupo = [];
    this.totalUnidadesSeleccionadas = 0;
    this.totalUnidadesGrupoSeleccionadas = 0;

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
            this.unidadMedicaPrincipalId = response.data.unidad_medica_principal_id;
            
            this.unidadesDataSource = new MatTableDataSource<any>(response.catalogos.unidades_medicas);
            this.unidadesDataSource.filterPredicate = (data:any, filter:string) => {
              let filtroTexto:boolean;
              let filtro = filter.trim();
              //index:1 = texto a buscar
              if(filtro && filtro != ''){
                filtro = filtro.toLowerCase()
                filtroTexto = data.clues.toLowerCase().includes(filtro) || data.nombre.toLowerCase().includes(filtro);                
              }else{
                filtroTexto = true;
              }
              return filtroTexto;
            };
            this.listaUnidades = this.unidadesDataSource.connect().value;
            this.controlUnidadesSeleccionadas = {};

            this.unidadesGrupoDataSource = new MatTableDataSource<any>(response.data.unidades_medicas);
            this.unidadesGrupoDataSource.filterPredicate = (data:any, filter:string) => {
              let filtroTexto:boolean;
              let filtro = filter.trim();
              //index:1 = texto a buscar
              if(filtro && filtro != ''){
                filtro = filtro.toLowerCase()
                filtroTexto = data.clues.toLowerCase().includes(filtro) || data.nombre.toLowerCase().includes(filtro);
              }else{
                filtroTexto = true;
              }
              return filtroTexto;
            };
            this.listaUnidadesGrupo = this.unidadesGrupoDataSource.connect().value;
            this.controlUnidadesGrupoSeleccionadas = {};
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
      this.isLoading = true;
      this.tituloDialogo = 'Nuevo';

      this.gruposService.getCatalogos({'unidades_medicas':{'ordenar':'descripcion'}}).subscribe(
        response => {
          console.log(response);
          if(response.error) {
            let errorMessage = response.error.message;
            this.sharedService.showSnackBar(errorMessage, null, 3000);
          } else {
            this.unidadesDataSource = new MatTableDataSource<any>(response.data.unidades_medicas);
            this.unidadesDataSource.filterPredicate = (data:any, filter:string) => {
              let filtroTexto:boolean;
              let filtro = filter.trim();
              //index:1 = texto a buscar
              if(filtro && filtro != ''){
                filtro = filtro.toLowerCase()
                filtroTexto = data.clues.toLowerCase().includes(filtro) || data.nombre.toLowerCase().includes(filtro);                
              }else{
                filtroTexto = true;
              }
              return filtroTexto;
            };
            this.listaUnidades = this.unidadesDataSource.connect().value;
            this.controlUnidadesSeleccionadas = {};

            this.unidadesGrupoDataSource = new MatTableDataSource<any>([]);
            this.unidadesGrupoDataSource.filterPredicate = (data:any, filter:string) => {
              let filtroTexto:boolean;
              let filtro = filter.trim();
              //index:1 = texto a buscar
              if(filtro && filtro != ''){
                filtro = filtro.toLowerCase()
                filtroTexto = data.clues.toLowerCase().includes(filtro) || data.nombre.toLowerCase().includes(filtro);
              }else{
                filtroTexto = true;
              }
              return filtroTexto;
            };
            this.listaUnidadesGrupo = this.unidadesGrupoDataSource.connect().value;
            this.controlUnidadesGrupoSeleccionadas = {};
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
    }
  }

  cancel(): void {
    this.dialogRef.close();
  }

  aplicarFiltroUnidades(){
    this.unidadesDataSource.filter = this.filtroUnidades;
    this.listaUnidades = this.unidadesDataSource.connect().value;
  }

  toggleSeleccionarUnidadMedica(unidad){
    if(!this.controlUnidadesSeleccionadas[unidad.id]){
      this.controlUnidadesSeleccionadas[unidad.id] = true;
      this.totalUnidadesSeleccionadas++;
    }else{
      delete this.controlUnidadesSeleccionadas[unidad.id];
      this.totalUnidadesSeleccionadas--;
    }
  }

  aplicarFiltroUnidadesGrupo(){
    this.unidadesGrupoDataSource.filter = this.filtroUnidadesGrupo;
    this.listaUnidadesGrupo = this.unidadesGrupoDataSource.connect().value;
  }

  toggleSeleccionarUnidadMedicaGrupo(unidad){
    if(!this.controlUnidadesGrupoSeleccionadas[unidad.id]){
      this.controlUnidadesGrupoSeleccionadas[unidad.id] = true;
      this.totalUnidadesGrupoSeleccionadas++;
    }else{
      delete this.controlUnidadesGrupoSeleccionadas[unidad.id];
      this.totalUnidadesGrupoSeleccionadas--;
    }
  }

  agregarUnidades(todos:boolean = false){
    if(todos){
      if(!this.filtroUnidades){
        for(let i in this.unidadesDataSource.data){
          this.unidadesGrupoDataSource.data.push(this.unidadesDataSource.data[i]);
        }
        this.unidadesDataSource.data = [];
      }else{
        for(let i in this.listaUnidades){
          this.unidadesGrupoDataSource.data.push(this.listaUnidades[i]);
          let index = this.unidadesDataSource.data.findIndex(x => x.id == this.listaUnidades[i].id);
          this.unidadesDataSource.data.splice(index,1);
        }
      }
    }else{
      for(let i in this.controlUnidadesSeleccionadas){
        let index = this.unidadesDataSource.data.findIndex(x => x.id == i);
        this.unidadesGrupoDataSource.data.push(this.unidadesDataSource.data[index]);
        this.unidadesDataSource.data.splice(index,1);
      }
    }

    this.controlUnidadesSeleccionadas = {};
    this.totalUnidadesSeleccionadas = 0;
    this.grupoForm.get('total_unidades').patchValue(this.unidadesGrupoDataSource.data.length);
    this.listaUnidades = [];

    this.refrescarFiltros();
  }

  quitarUnidades(todos:boolean = false){
    if(todos){
      if(!this.filtroUnidadesGrupo){
        for(let i in this.unidadesGrupoDataSource.data){
          this.unidadesDataSource.data.push(this.unidadesGrupoDataSource.data[i]);
        }

        this.unidadesGrupoDataSource.data = [];
        this.grupoForm.get('unidad_medica_principal_id').patchValue('');
        this.grupoForm.get('unidad_medica_principal').patchValue('');
      }else{
        for(let i in this.listaUnidadesGrupo){
          if(this.listaUnidadesGrupo[i].id == this.unidadMedicaPrincipalId){
            this.grupoForm.get('unidad_medica_principal_id').patchValue('');
            this.grupoForm.get('unidad_medica_principal').patchValue('');
          }

          this.unidadesDataSource.data.push(this.listaUnidadesGrupo[i]);
          let index = this.unidadesGrupoDataSource.data.findIndex(x => x.id == this.listaUnidadesGrupo[i].id);
          this.unidadesGrupoDataSource.data.splice(index,1);
        }
      }
    }else{
      for(let i in this.controlUnidadesGrupoSeleccionadas){
        if(+i == this.unidadMedicaPrincipalId){
          this.grupoForm.get('unidad_medica_principal_id').patchValue('');
          this.grupoForm.get('unidad_medica_principal').patchValue('');
        }

        let index = this.unidadesGrupoDataSource.data.findIndex(x => x.id == i);
        this.unidadesDataSource.data.push(this.unidadesGrupoDataSource.data[index]);
        this.unidadesGrupoDataSource.data.splice(index,1);
      }
    }

    this.controlUnidadesGrupoSeleccionadas = {};
    this.totalUnidadesGrupoSeleccionadas = 0;
    this.grupoForm.get('total_unidades').patchValue(this.unidadesGrupoDataSource.data.length);
    this.listaUnidadesGrupo = [];

    this.refrescarFiltros();
  }

  refrescarFiltros(){
    if(!this.filtroUnidades){
      this.filtroUnidades = ' ';
      this.aplicarFiltroUnidades();
      this.filtroUnidades = '';
    }else{
      this.aplicarFiltroUnidades();
    }
    
    if(!this.filtroUnidadesGrupo){
      this.filtroUnidadesGrupo = ' ';
      this.aplicarFiltroUnidadesGrupo();
      this.filtroUnidadesGrupo = '';
    }else{
      this.aplicarFiltroUnidadesGrupo();
    }
  }

  establecerUnidadPrincipal(){
    for (let i in this.controlUnidadesGrupoSeleccionadas) {
      if(this.controlUnidadesGrupoSeleccionadas[i]){
        let index = this.listaUnidadesGrupo.findIndex(item => item.id == +i);
        let unidad = this.listaUnidadesGrupo[index];
        
        this.unidadMedicaPrincipalId = +i;
        this.grupoForm.get('unidad_medica_principal_id').patchValue(this.unidadMedicaPrincipalId);
        this.grupoForm.get('unidad_medica_principal').patchValue(unidad);
        this.toggleSeleccionarUnidadMedicaGrupo(unidad);
        break;
      }
    }
    //this.unidadMedicaPrincipalId = +(Object.keys(this.controlUnidadesGrupoSeleccionadas)[0]);
  }

  guardar():void {
    if(this.grupoForm.valid){
      let grupo_data = JSON.parse(JSON.stringify(this.grupoForm.value));
      grupo_data.unidades_medicas = this.unidadesGrupoDataSource.data;
      //console.log(this.unidadesGrupoDataSource.data);

      if(this.unidadesGrupoDataSource.data.length == 1){
        grupo_data.unidad_medica_principal_id = this.unidadesGrupoDataSource.data[0].id;
      }

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
