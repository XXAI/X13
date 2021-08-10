import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { FormBuilder } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { DialogoSelecAccionArticulosUnidadesComponent } from '../dialogo-selec-accion-articulos-unidades/dialogo-selec-accion-articulos-unidades.component';

export interface GrupoData {
  listaUnidades: any;
  listaSeleccionadas: any[];
  unidadesConArticulos: any;
  hayArticulosCapturados: boolean;
}

@Component({
  selector: 'app-dialogo-seleccionar-unidades-medicas',
  templateUrl: './dialogo-seleccionar-unidades-medicas.component.html',
  styleUrls: ['./dialogo-seleccionar-unidades-medicas.component.css']
})
export class DialogoSeleccionarUnidadesMedicasComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<DialogoSeleccionarUnidadesMedicasComponent>,
    @Inject(MAT_DIALOG_DATA) public data: GrupoData,
    private formBuilder: FormBuilder,
    private dialog: MatDialog
  ) { }

  grupo:any;
  hayArticulosCapturados:boolean;

  filtroUnidadesGrupo:string;
  filtroUnidadesPedido:string;
  unidadesGrupoDataSource: MatTableDataSource<any>;
  unidadesPedidoDataSource: MatTableDataSource<any>;
  listaUnidadesGrupo:any[];
  listaUnidadesPedido:any[];

  unidadesConArticulos:any;
  unidadesEliminarArticulos:any;

  controlUnidadesSeleccionadas:any;

  ngOnInit() {
    let grupo = JSON.parse(JSON.stringify(this.data));
    this.listaUnidadesGrupo = [];
    this.listaUnidadesPedido = [];
    this.controlUnidadesSeleccionadas = {};
    this.unidadesConArticulos = {};
    this.unidadesEliminarArticulos = {};

    if(grupo.hayArticulosCapturados){
      this.hayArticulosCapturados = true;
    }else{
      this.hayArticulosCapturados = false;
    }

    if(grupo.listaUnidades){
      this.unidadesGrupoDataSource = new MatTableDataSource<any>(grupo.listaUnidades);

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

      //Unidades seleccionadas para el pedido
      let unidadesSeleccionadas:any[] = [];
      if(grupo.listaSeleccionadas.length){
        unidadesSeleccionadas = grupo.listaSeleccionadas;
        for(let i in unidadesSeleccionadas){
          this.controlUnidadesSeleccionadas[unidadesSeleccionadas[i].id] = true;
        }
      }
      
      //Unidades con insumos asignados
      if(grupo.unidadesConArticulos){
        this.unidadesConArticulos = grupo.unidadesConArticulos;
      }
      
      this.unidadesPedidoDataSource = new MatTableDataSource<any>(unidadesSeleccionadas);

      this.unidadesPedidoDataSource.filterPredicate = (data:any, filter:string) => {
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
      this.listaUnidadesPedido = this.unidadesPedidoDataSource.connect().value;
    }
  }

  aplicarFiltroGrupo(){
    this.unidadesGrupoDataSource.filter = this.filtroUnidadesGrupo;
    this.listaUnidadesGrupo = this.unidadesGrupoDataSource.connect().value;
  }

  aplicarFiltroPedido(){
    this.unidadesPedidoDataSource.filter = this.filtroUnidadesPedido || ' ';
    this.listaUnidadesPedido = this.unidadesPedidoDataSource.connect().value;
  }

  toggleRemoverUnidadMedica(unidad){
    if(this.unidadesConArticulos[unidad.id]){
      this.marcarEliminarArticulos(unidad);
    }else{
      this.quitarUnidadMedica(unidad);
    }
  }

  toggleSeleccionarUnidadMedica(unidad){
    if(this.unidadesConArticulos[unidad.id]){
      return false;
    }

    if(!this.controlUnidadesSeleccionadas[unidad.id]){
      this.agregarUnidadMedica(unidad);
    }else{
      this.quitarUnidadMedica(unidad);
    }
  }

  agregarUnidadMedica(unidad){
    this.controlUnidadesSeleccionadas[unidad.id] = true;
    this.unidadesPedidoDataSource.data.unshift(unidad);
    this.aplicarFiltroPedido();
  }

  quitarUnidadMedica(unidad){
    let index = this.unidadesPedidoDataSource.data.findIndex(x => x.id === unidad.id);
    if(index >= 0){
      this.controlUnidadesSeleccionadas[unidad.id] = false;
      this.unidadesPedidoDataSource.data.splice(index,1);
      this.aplicarFiltroPedido();
    }
  }

  marcarEliminarArticulos(unidad){
    if(this.unidadesEliminarArticulos[unidad.id]){
      this.unidadesEliminarArticulos[unidad.id] = false;
    }else{
      this.unidadesEliminarArticulos[unidad.id] = true;
    }
  }

  aplicarCambios(){
    let aplicar_accion:boolean = false;
    let data_accion:any;
    let unidades_eliminadas:any[] = [];

    let lista_unidades_eliminar:number[] = [];
    for(let i in this.unidadesEliminarArticulos){
      if(this.unidadesEliminarArticulos[i]){
        let unidad_id = +i;
        lista_unidades_eliminar.push(unidad_id);
      }
    }

    if(lista_unidades_eliminar.length){
      for(let i in lista_unidades_eliminar){
        let unidad_id = lista_unidades_eliminar[i];
        let index_eliminar = this.unidadesPedidoDataSource.data.findIndex(x => x.id === unidad_id);
        unidades_eliminadas.push(this.unidadesPedidoDataSource.data[index_eliminar]);
      }
    }

    let unidades_con_articulos = 0;
    for(let i in this.unidadesConArticulos){
      if(this.unidadesConArticulos[i]){
        unidades_con_articulos++;
      }
    }

    if(unidades_con_articulos == 0 && this.hayArticulosCapturados && this.unidadesPedidoDataSource.data.length > 0){
      aplicar_accion = true;
      data_accion = {tipo_accion:'ICSU', lista_unidades: this.unidadesPedidoDataSource.data};
    }

    /*if(unidades_con_articulos > 0 && this.hayArticulosCapturados &&  this.unidadesPedidoDataSource.data.length > 0){
      aplicar_accion = false;
      data_accion = {tipo_accion:'ICUS', lista_unidades: this.unidadesPedidoDataSource.data, unidades_con_articulos: this.unidadesConArticulos};
    }*/

    //eliminar unidades con aritculos asignados, dejando unidades sin asignar
    if(unidades_con_articulos > 0 && unidades_eliminadas.length == unidades_con_articulos && this.hayArticulosCapturados && this.unidadesPedidoDataSource.data.length == unidades_eliminadas.length){
      aplicar_accion = true;
      data_accion = {tipo_accion:'EUSU', lista_unidades: unidades_eliminadas};
    }

    if(unidades_con_articulos > 0 && unidades_eliminadas.length == unidades_con_articulos && this.hayArticulosCapturados && this.unidadesPedidoDataSource.data.length > unidades_eliminadas.length){
      aplicar_accion = true;
      let unidades_restantes:any[] = [];
      for(let i in this.unidadesPedidoDataSource.data){
        let index = lista_unidades_eliminar.indexOf(this.unidadesPedidoDataSource.data[i].id);
        if(index < 0){
          unidades_restantes.push(this.unidadesPedidoDataSource.data[i]);
        }
      }
      data_accion = {tipo_accion:'EUCU', lista_unidades: unidades_restantes};
    }

    if(aplicar_accion){
      let configDialog = {
        width: '90%',
        maxHeight: '90vh',
        //height: '643px',
        data: data_accion,
        panelClass: 'no-padding-dialog'
      };
  
      const dialogRef = this.dialog.open(DialogoSelecAccionArticulosUnidadesComponent, configDialog);
  
      dialogRef.afterClosed().subscribe(response => {
        if(response){
          this._aplicarCerrar({unidadesSeleccionadas:this.unidadesPedidoDataSource.data, unidadesEliminarArticulos:lista_unidades_eliminar, accion:response},lista_unidades_eliminar);
        }
      });
    }else{
      this._aplicarCerrar({unidadesSeleccionadas:this.unidadesPedidoDataSource.data, unidadesEliminarArticulos:lista_unidades_eliminar},lista_unidades_eliminar);
    }
  }

  private _aplicarCerrar(return_data,eliminar_unidades:number[] = []){
    if(eliminar_unidades.length){
      for(let i in eliminar_unidades){
        let unidad_id = eliminar_unidades[i];
        let index_eliminar = this.unidadesPedidoDataSource.data.findIndex(x => x.id === unidad_id);
        this.unidadesPedidoDataSource.data.splice(index_eliminar,1);
      }
    }
    this.dialogRef.close(return_data);
  }

  close(): void {
    this.dialogRef.close();
  }

}
