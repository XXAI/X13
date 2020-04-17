import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { EmpleadosService } from '../empleados.service';
import { SharedService } from '../../shared/shared.service';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { MatTable, MatExpansionPanel, MatInput } from '@angular/material';
import { FormBuilder, Validators, FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { startWith, map, throwIfEmpty, debounceTime, tap, switchMap, finalize } from 'rxjs/operators';
import { ConfirmActionDialogComponent } from '../../utils/confirm-action-dialog/confirm-action-dialog.component';

export interface AgregarFirmanteDialogData {
  scSize?: string;
}

@Component({
  selector: 'app-agregar-firmantes-dialog',
  templateUrl: './agregar-firmantes-dialog.component.html',
  styleUrls: ['./agregar-firmantes-dialog.component.css']
})
export class AgregarFirmantesDialogComponent implements OnInit {

  search:string = "";
  isLoading: boolean = false;
  mediaSize:string;
  
  resultsLength: number = 0;
  pageSize: number = 20;

  firmanteLoading: boolean = false;
  filteredFirmante: Observable<any[]>;
  firmanteIsLoading:boolean = false;

  dataSource: any = [];
  displayedColumns: string[] = ['RFC', 'Nombre', 'Cargo','actions'];
  
  firmantesForm = this.fb.group({
    'firmante_id': [''],
    'firmante': ['',Validators.required],
    'cargo': ['',Validators.required]
  });

  constructor(
    public dialogRef: MatDialogRef<AgregarFirmantesDialogComponent>,
    private sharedService: SharedService, 
    private empleadosService: EmpleadosService, 
    public dialog: MatDialog, 
    private fb: FormBuilder,
     @Inject(MAT_DIALOG_DATA) public data: AgregarFirmanteDialogData ) { }

  @ViewChild(MatPaginator, {static: false}) paginator: MatPaginator;
  @ViewChild(MatTable, {static:false}) usersTable: MatTable<any>;
  @ViewChild(MatExpansionPanel, {static:false}) advancedFilter: MatExpansionPanel;

  

  ngOnInit() {
    if(this.data.scSize){
      this.mediaSize = this.data.scSize;
    }

    this.firmantesForm.get('firmante').valueChanges
      .pipe(
        debounceTime(300),
        tap( () => {
          this.firmanteIsLoading = true;
        } ),
        switchMap(value => {
            if(!(typeof value === 'object')){
              return this.empleadosService.buscarResponsable({busqueda_empleado:value}).pipe(
                finalize(() => this.firmanteIsLoading = false )
              );
            }else{
              this.firmanteIsLoading = false;
              return [];
            }
          }
        ),
      ).subscribe(items => this.filteredFirmante = items);
    
      this.listar_firmantes();
  }

  displayFirmanteFn(item: any) {
    if (item) { return item.nombre; }
  }

  accionGuardar(validar:boolean = false){
    this.isLoading = true;
    let formData = JSON.parse(JSON.stringify(this.firmantesForm.value));
    //console.log(formData);
    if(formData.firmante)
    {
      formData.firmante_id = formData.firmante.id;
    }

    delete formData.responsable;

    this.empleadosService.agregarFirmante(formData).subscribe(
      respuesta => {
        this.isLoading = false;
        this.sharedService.showSnackBar("Se ha guardado correctamente", "Correcto", 3000);
        this.firmantesForm.reset();
        this.listar_firmantes();
      },
      errorResponse =>{
        console.log(errorResponse);
        var errorMessage = "Ocurrió un error.";
        if(errorResponse.status == 409){
          errorMessage = errorResponse.error.error.message;
        }else{
          errorMessage += ': ' + errorResponse.error.message;
        }
        this.sharedService.showSnackBar(errorMessage, null, 3000);
        this.isLoading = false;
      }
    );
  }

  public listar_firmantes(event?:PageEvent){
    this.isLoading = true;
    
    this.empleadosService.getFirmantesList().subscribe(
      response =>{
        if(response.error) {
          let errorMessage = response.error.message;
          this.sharedService.showSnackBar(errorMessage, null, 3000);
        } else {
          this.dataSource = [];
          this.dataSource = response.data;
          console.log(response);
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
    return event;
  }

  delFirmante(id:any)
  {
    const dialogRef = this.dialog.open(ConfirmActionDialogComponent, {
      width: '500px',
      data:{dialogTitle:'Eliminar el Firmante',dialogMessage:'Esta seguro de eliminar este firmante?',btnColor:'warn',btnText:'Eliminar'}
    });

    dialogRef.afterClosed().subscribe(valid => {
      if(valid){
        this.empleadosService.deleteFirmante(id).subscribe(
          response =>{
            this.sharedService.showSnackBar("Se eliminado correctamente el firmante", "Correcto", 3000);
            this.listar_firmantes();
          }
        );
      }
    });
  }

  cancelar(): void {
    this.dialogRef.close();
  }
}
