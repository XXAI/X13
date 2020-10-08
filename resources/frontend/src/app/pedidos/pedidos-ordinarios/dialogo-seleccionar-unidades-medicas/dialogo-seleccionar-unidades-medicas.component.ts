import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { DialogoSelecAccionInsumosUnidadesComponent } from '../dialogo-selec-accion-insumos-unidades/dialogo-selec-accion-insumos-unidades.component';

export interface GrupoData {
  listaUnidades: any;
  listaSeleccionadas: any[];
  unidadesConInsumos: any;
  hayInsumosCapturados: boolean;
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
  hayInsumosCapturados:boolean;

  filtroUnidadesGrupo:string;
  filtroUnidadesPedido:string;
  unidadesGrupoDataSource: MatTableDataSource<any>;
  unidadesPedidoDataSource: MatTableDataSource<any>;
  listaUnidadesGrupo:any[];
  listaUnidadesPedido:any[];

  unidadesConInsumos:any;
  unidadesEliminarInsumos:any;

  controlUnidadesSeleccionadas:any;

  ngOnInit() {
    let grupo = JSON.parse(JSON.stringify(this.data));
    this.listaUnidadesGrupo = [];
    this.listaUnidadesPedido = [];
    this.controlUnidadesSeleccionadas = {};
    this.unidadesConInsumos = {};
    this.unidadesEliminarInsumos = {};

    if(grupo.hayInsumosCapturados){
      this.hayInsumosCapturados = true;
    }else{
      this.hayInsumosCapturados = false;
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
      if(grupo.unidadesConInsumos){
        this.unidadesConInsumos = grupo.unidadesConInsumos;
      }
      //console.log(this.unidadesConInsumos);
      
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
    if(this.unidadesConInsumos[unidad.id]){
      this.marcarEliminarInsumos(unidad);
    }else{
      this.quitarUnidadMedica(unidad);
    }
  }

  toggleSeleccionarUnidadMedica(unidad){
    if(this.unidadesConInsumos[unidad.id]){
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

  marcarEliminarInsumos(unidad){
    if(this.unidadesEliminarInsumos[unidad.id]){
      this.unidadesEliminarInsumos[unidad.id] = false;
    }else{
      this.unidadesEliminarInsumos[unidad.id] = true;
    }
  }

  aplicarCambios(){
    let aplicar_accion:boolean = false;
    let data_accion:any;

    let listaUnidadesEliminar:number[] = [];
    for(let i in this.unidadesEliminarInsumos){
      if(this.unidadesEliminarInsumos[i]){
        let unidad_id = +i;
        listaUnidadesEliminar.push(unidad_id);
      }
    }

    if(listaUnidadesEliminar.length){
      for(let i in listaUnidadesEliminar){
        let unidad_id = listaUnidadesEliminar[i];
        let index_eliminar = this.unidadesPedidoDataSource.data.findIndex(x => x.id === unidad_id);
        this.unidadesPedidoDataSource.data.splice(index_eliminar,1);
      }
    }

    let unidades_con_insumos = 0;
    for(let i in this.unidadesConInsumos){
      if(this.unidadesConInsumos[i]){
        unidades_con_insumos++;
      }
    }

    if(unidades_con_insumos == 0 && this.hayInsumosCapturados && this.unidadesPedidoDataSource.data.length > 0){
      console.log('######### Acción requerida: ya hay insumos capturados, sin unidades seleccionadas anteriormente');
      aplicar_accion = true;
      data_accion = {tipo_accion:'ICSU', lista_unidades: this.unidadesPedidoDataSource.data};
    }

    if(unidades_con_insumos > 0 && this.hayInsumosCapturados &&  this.unidadesPedidoDataSource.data.length > 0){
      console.log('######### Acción requerida: ya hay insumos capturados con unidades seleccionadas anteriormente con insumos asignados');
      aplicar_accion = false;
      data_accion = {tipo_accion:'ICUS', lista_unidades: this.unidadesPedidoDataSource.data, unidades_con_insumos: this.unidadesConInsumos};
    }

    if(aplicar_accion){
      let configDialog = {
        width: '90%',
        maxHeight: '90vh',
        //height: '643px',
        data: data_accion,
        panelClass: 'no-padding-dialog'
      };
  
      const dialogRef = this.dialog.open(DialogoSelecAccionInsumosUnidadesComponent, configDialog);
  
      dialogRef.afterClosed().subscribe(response => {
        if(response){
          this.dialogRef.close({unidadesSeleccionadas:this.unidadesPedidoDataSource.data, unidadesEliminarInsumos:listaUnidadesEliminar, accion:response});
        }else{
          console.log('Cancelar');
        }
      });
    }else{
      this.dialogRef.close({unidadesSeleccionadas:this.unidadesPedidoDataSource.data, unidadesEliminarInsumos:listaUnidadesEliminar});
    }
  }

  close(): void {
    this.dialogRef.close();
  }

}
