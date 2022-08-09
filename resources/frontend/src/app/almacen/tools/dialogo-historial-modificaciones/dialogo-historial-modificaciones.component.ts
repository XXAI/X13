import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSelectionList } from '@angular/material/list';
import { MatTableDataSource } from '@angular/material/table';
import { SharedService } from 'src/app/shared/shared.service';
import { AlmacenService } from '../../almacen.service';
import { DecimalPipe } from '@angular/common';

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
    private decimalPipe: DecimalPipe,
  ) { }

  isLoadingMods: boolean;
  filtroMods: string;
  filtroAplicado: boolean;
  dataSourceMods: MatTableDataSource<any>;
  modSeleccionada: boolean;
  datosModificacion: any;

  listaEstatusIconos: any = { 'FIN':'assignment_turned_in',   'CAN':'cancel',     'SOL':'edit_notifications',         'MOD':'note_alt',             'ATM':'assignment_late'};
  listaEstatusClaves: any = { 'FIN':'concluido',              'CAN':'cancelado',  'SOL':'peticion-modificacion',      'MOD':'modificacion-aprobada','ATM':'peticion-automatica'};
  listaEstatusLabels: any = { 'FIN':'Concluido',              'CAN':'Cancelado',  'SOL':'Petición de Modificación',   'MOD':'Modificación Activa',  'ATM':'Petición Automatica'};

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
            
            let modificaciones_movimiento:any = {};
            modificaciones_movimiento = this.generarObjetoDiferencias(modificaciones_movimiento,element.registro_original,'original');
            modificaciones_movimiento = this.generarObjetoDiferencias(modificaciones_movimiento,element.registro_modificado,'modificado');

            element.datos_movimiento = modificaciones_movimiento;

            element.modificaciones_articulos.forEach(element => {
              element.registro_original = JSON.parse(element.registro_original);
              element.registro_modificado = JSON.parse(element.registro_modificado);

              let tipo_modificacion_descripcion:string;
              let clase_tipo_modificacion: string;
              switch (element.tipo_modificacion) {
                case 'UPD':
                  tipo_modificacion_descripcion = 'Editado:';
                  clase_tipo_modificacion = 'edit';
                  break;
                case 'DEL':
                  tipo_modificacion_descripcion = 'Eliminado:';
                  clase_tipo_modificacion = 'delete';
                  break;
                case 'ADD':
                  tipo_modificacion_descripcion = 'Agregado:';
                  clase_tipo_modificacion = 'add';
                  break;    
                default:
                  tipo_modificacion_descripcion = 'Sin tipo:';
                  clase_tipo_modificacion = 'none';
                  break;
              }
              
              let articulo:any = {};
              if(element.registro_original && element.registro_original.articulo){
                articulo = element.registro_original.articulo;
                delete element.registro_original.articulo;
              }else if(element.registro_modificado && element.registro_modificado.articulo){
                articulo = element.registro_modificado.articulo;
                delete element.registro_modificado.articulo;
              }

              element.datos_articulo_modificado = {
                'tipo': tipo_modificacion_descripcion,
                'clase': clase_tipo_modificacion,
                'clave': articulo.clave,
                'nombre': articulo.nombre,
              };

              let datos_registrados:any = {};
              datos_registrados = this.generarObjetoDiferencias(datos_registrados,element.registro_original,'original');              
              datos_registrados = this.generarObjetoDiferencias(datos_registrados,element.registro_modificado,'modificado');
              
              //console.log('trabajados:',datos_registrados);
              let comparativa_datos:any[] = [];
              for(const key in datos_registrados) {
                if(datos_registrados[key]){
                  let seccion_comparativa:any = {};
                  switch (key) {
                    case 'movimiento_articulo':
                      seccion_comparativa.titulo = 'Datos del Articulo en el Movimiento:';
                      break;
                    case 'stock':
                      seccion_comparativa.titulo = 'Datos del Stock (Lote) en Existencias:';
                      break;
                    case 'nuevo_stock':
                      seccion_comparativa.titulo = 'Datos del Nuevo Stock (Lote):';
                      break;
                    case 'carta_canje':
                      seccion_comparativa.titulo = 'Datos de la Carta de Canje:';
                      break;
                    case 'recepcion_transferencias':
                      seccion_comparativa.titulo = 'Datos de las Transferencias:';
                      break;
                    case 'movimientos_recepciones':
                      seccion_comparativa.titulo = 'Datos de los Movimientos de Recepción:';
                      break;
                    case 'salidas_seleccionadas':
                      seccion_comparativa.titulo = 'Datos de las Salidas Seleccionadas:';
                      break;
                    default:
                      seccion_comparativa.titulo = 'Sección sin titulo:';
                      break;
                  }
                  if(datos_registrados[key].es_arreglo){
                    seccion_comparativa.es_arreglo = true;
                    seccion_comparativa.datos = Object.values(datos_registrados[key].items);
                  }else{
                    seccion_comparativa.datos = datos_registrados[key];
                  }
                  comparativa_datos.push(seccion_comparativa);
                }
              }
              element.comparativa_datos = comparativa_datos;
              element.datos_registrados = datos_registrados;
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

  private generarObjetoDiferencias(diferencias:any, objeto:any, nivel:string):any{
    for(const parametro in objeto) {
      if(Object.prototype.hasOwnProperty.call(objeto, parametro)) {
        if(objeto[parametro]){
          if(parametro == 'id' || parametro.endsWith('_id')){
            continue;
          }

          if(!diferencias[parametro]){
            diferencias[parametro] = {};
          }

          if(objeto[parametro] && objeto[parametro].constructor == Array){
            if(!diferencias[parametro].items){
              diferencias[parametro] = {es_arreglo: true, items:{}};
            }

            objeto[parametro].forEach(element => {
              let item:any;
              item = diferencias[parametro].items[element.id]||{};
              
              item = this.generarObjetoDiferencias(item,element,nivel);
              diferencias[parametro].items[element.id] = item;
            });
            //console.log('asdfsdfsdf:',parametro);
            continue;
          }

          if(typeof objeto[parametro] == 'object'){
            diferencias[parametro] = this.generarObjetoDiferencias(diferencias[parametro],objeto[parametro],nivel);
          }else{
            if(!objeto[parametro]){
              objeto[parametro] = '---';
            }
            if(parametro == 'updated_at' || parametro == 'deleted_at' || parametro == 'created_at'){
              objeto[parametro] = objeto[parametro].substring(0,10);
            }else if(parametro == 'total_monto' || parametro == 'precio_unitario'){
              objeto[parametro] = '$ ' + this.decimalPipe.transform(objeto[parametro],'1.0-2');
            }else if((parametro != 'lote' && parametro != 'no_serie' && parametro != 'modelo' && parametro != 'memo_folio' && parametro != 'referencia_folio' && parametro != 'documento_folio') && !isNaN(objeto[parametro])){
              objeto[parametro] = this.decimalPipe.transform(objeto[parametro],'1.0-0');
            }

            diferencias[parametro][nivel] = objeto[parametro];

            if(!diferencias[parametro]['etiqueta']){
              let etiqueta:string;
              switch (parametro) {
                case 'user':
                  etiqueta = 'Usuario:';
                  break;
                case 'updated_at':
                  etiqueta = 'Actualizado el:';
                  break;
                case 'deleted_at':
                  etiqueta = 'Borrado el:';
                  break;
                case 'created_at':
                  etiqueta = 'Creado el:';
                  break;
                default:
                  etiqueta = this.formatearEtiqueta(parametro);
                  break;
              }
              diferencias[parametro]['etiqueta'] = etiqueta;
            }
          }
        }
      }
    }

    return diferencias;
  }
  
  private formatearEtiqueta(string:string) {
    string = string.replace('_',' ');
    return string.charAt(0).toUpperCase() + string.slice(1) + ':';
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