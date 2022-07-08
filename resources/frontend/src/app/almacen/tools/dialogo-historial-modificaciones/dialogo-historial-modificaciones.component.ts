import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSelectionList } from '@angular/material/list';
import { MatTableDataSource } from '@angular/material/table';
import { SharedService } from 'src/app/shared/shared.service';
import { AlmacenService } from '../../almacen.service';

export interface DialogData {
  id: number;
}

@Component({
  selector: 'app-dialogo-historial-modificaciones',
  templateUrl: './dialogo-historial-modificaciones.component.html',
  styleUrls: ['./dialogo-historial-modificaciones.component.css']
})
export class DialogoHistorialModificacionesComponent implements OnInit {
  @ViewChild(MatSelectionList) listaSeleccionable: MatSelectionList;

  constructor(
    public dialogRef: MatDialogRef<DialogoHistorialModificacionesComponent>,
    private almacenService: AlmacenService, 
    private sharedService: SharedService,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) { }

  isLoadingMods: boolean;
  filtroMods: string;
  filtroAplicado: boolean;
  dataSourceMods: MatTableDataSource<any>;
  modSeleccionada: boolean;
  datosModificacion: any;

  listaEstatusIconos: any = { 'FIN':'assignment_turned_in',   'CAN':'cancel',     'SOL':'edit_notifications',         'MOD':'note_alt'};
  listaEstatusClaves: any = { 'FIN':'concluido',              'CAN':'cancelado',  'SOL':'peticion-modificacion',      'MOD':'modificacion-aprobada'};
  listaEstatusLabels: any = { 'FIN':'Concluido',              'CAN':'Cancelado',  'SOL':'Petición de Modificación',   'MOD':'Modificación Activa'};

  ngOnInit(): void {
    this.dataSourceMods = new MatTableDataSource<any>([]);
    this.dataSourceMods.filterPredicate = function (record,filter) {
      let filtro = JSON.parse(filter);
      let result:boolean = true;

      if(filtro.nivel != '*'){
        result = (record.nivel_modificacion == filtro.nivel);
      }

      if(filtro.estatus != '*'){
        result = (record.estatus == filtro.estatus);
      }
      
      if(result && filtro.query){
        result =  record.aprobado_usuario?.toLowerCase().includes(filtro.query.toLowerCase()) || 
                  record.modificado_usuario?.toLowerCase().includes(filtro.query.toLowerCase()) ||
                  record.solicitado_usuario?.toLowerCase().includes(filtro.query.toLowerCase()) ||
                  record.cancelado_usuario?.toLowerCase().includes(filtro.query.toLowerCase()) ||
                  record.revertido_usuario?.toLowerCase().includes(filtro.query.toLowerCase()) ||
                  record.motivo_modificacion?.toLowerCase().includes(filtro.query.toLowerCase()) ||
                  record.motivo_revertido?.toLowerCase().includes(filtro.query.toLowerCase())
                ;
      }
      return result;
    }
    this.isLoadingMods = true;
    this.almacenService.historialModificaciones(this.data.id).subscribe(
      response =>{
        if(response.error) {
          let errorMessage = response.error;
          this.sharedService.showSnackBar(errorMessage, null, 3000);
        } else {
          response.data.forEach(element => {
            element.registro_original = JSON.parse(element.registro_original);
            element.registro_modificado = JSON.parse(element.registro_modificado);
            let datos_movimiento:any = {};
            for(const key in element.registro_original) {
              if(Object.prototype.hasOwnProperty.call(element.registro_original, key)) {
                datos_movimiento[key] = {original: element.registro_original[key], modificado:''};
              }
            }
            for(const key in element.registro_modificado) {
              if(Object.prototype.hasOwnProperty.call(element.registro_modificado, key)) {
                if(!datos_movimiento[key]){
                  datos_movimiento[key] = {original:'', modificado: element.registro_modificado[key]};
                }else{
                  datos_movimiento[key].modificado = element.registro_modificado[key];
                }
              }
            }
            element.datos_movimiento = [];
            for(const key in datos_movimiento) {
              if(Object.prototype.hasOwnProperty.call(datos_movimiento, key)) {
                element.datos_movimiento.push({
                  etiqueta: key, valor: datos_movimiento[key]
                });
              }
            }

            element.modificaciones_articulos.forEach(element => {
              element.registro_original = JSON.parse(element.registro_original);
              let datos_registrados:any[] = [];
              for(const key in element.registro_original) {
                if(Object.prototype.hasOwnProperty.call(element.registro_original, key)) {
                  datos_registrados.push(key);
                }
              }
              element.datos_registrados = datos_registrados;
              element.registro_modificado = JSON.parse(element.registro_modificado);
            });
          });
          this.dataSourceMods.data = response.data;
          this.aplicarFiltroMods();
        }
        this.isLoadingMods = false;
      },
      errorResponse =>{
        var errorMessage = "Ocurrió un error.";
        if(errorResponse.status == 409){
          errorMessage = errorResponse.error.error.message;
        }
        this.sharedService.showSnackBar(errorMessage, null, 3000);
        this.isLoadingMods = false;
      }
    );
  }

  seleccionarModificacion(event){
    if(this.modSeleccionada){
      this.quitarItemSeleccionado();
    }
    
    this.modSeleccionada = true;
    this.datosModificacion = event.option.value;
    console.log(this.datosModificacion);
  }

  private quitarItemSeleccionado(){
    this.modSeleccionada = false;
  }

  cancelarAccion(){
    if(this.modSeleccionada){
      this.quitarItemSeleccionado();
      this.listaSeleccionable.deselectAll();
    }else{
      this.cerrar();
    }
  }

  aplicarFiltroMods(event?){
    let filter:any = {
      query: this.filtroMods,
      estatus: '*',
      nivel: '*',
    };
    this.dataSourceMods.filter = JSON.stringify(filter);
  }

  cerrar(){
    this.dialogRef.close();
  }

}