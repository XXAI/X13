import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';

export interface GrupoData {
  listaUnidades: any;
  listaSeleccionadas: any[];
  unidadesConInsumos: any;
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
    private formBuilder: FormBuilder
  ) { }

  grupo:any;

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
      console.log(this.unidadesConInsumos);
      
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
    
    this.dialogRef.close({unidadesSeleccionadas:this.unidadesPedidoDataSource.data, unidadesEliminarInsumos:listaUnidadesEliminar});
  }

  close(): void {
    this.dialogRef.close();
  }

}
