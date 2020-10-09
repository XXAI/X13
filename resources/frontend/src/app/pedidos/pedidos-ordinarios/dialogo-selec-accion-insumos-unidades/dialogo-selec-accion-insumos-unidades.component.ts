import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

export interface UnidadesData {
  tipo_accion: string;
  lista_unidades?: any[];
  unidades_con_insumos?: any;
}

@Component({
  selector: 'app-dialogo-selec-accion-insumos-unidades',
  templateUrl: './dialogo-selec-accion-insumos-unidades.component.html',
  styleUrls: ['./dialogo-selec-accion-insumos-unidades.component.css']
})
export class DialogoSelecAccionInsumosUnidadesComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<DialogoSelecAccionInsumosUnidadesComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UnidadesData,
    private formBuilder: FormBuilder
  ) { }

  listaAcciones: any[];
  accionSeleccionada: string;

  listaUnidades:any[];
  unidadesFiltradas: Observable<any[]>;
  unidadSeleccionada:FormControl;

  ngOnInit() {
    if(this.data.tipo_accion == 'ICSU' || this.data.tipo_accion == 'EUCU'){
      this.listaAcciones = [
        {codigo:'DIV',descripcion:'Dividir la cantidad de cada insumo entre las unidades seleccionadas'},
        {codigo:'MUL',descripcion:'Multiplicar la cantidad de cada insumo entre las unidades seleccionadas'},
        {codigo:'SEL',descripcion:'Asignar la cantidad del insumo a una unidad seleccionada'}
      ];
    }else if(this.data.tipo_accion == 'EUSU'){
      this.listaAcciones = [
        {codigo:'MAN',descripcion:'Mantener la cantidad total asignada a cada insumo'},
        {codigo:'SEL',descripcion:'Asignar la cantidad de una unidad seleccionada al insumo'}
      ];
    }

    if(this.data.lista_unidades.length){
      this.unidadSeleccionada = new FormControl();
      this.listaUnidades = this.data.lista_unidades;

      this.unidadesFiltradas = this.unidadSeleccionada.valueChanges.pipe(
        startWith(''),
        map(value => {
          if(!(typeof value === 'object')){
            return this._filter(value);
          }
        })
      );
    }
    
    console.log(this.data);
  }

  mostrarTextoValor(unidad:any){
    if(unidad){ return unidad.nombre; }
  }

  private _filter(value:string): any[]{
    const filterValue = value.toLowerCase();
    return this.listaUnidades.filter(unidad => unidad.nombre.toLowerCase().indexOf(filterValue) >= 0);
  }

  aplicarAccion(){
    let response:any = {};
    response.tipo_accion = this.accionSeleccionada;

    if(this.accionSeleccionada == 'SEL'){
      response.unidad_seleccionada = this.unidadSeleccionada.value;
    }

    this.dialogRef.close(response);
  }

  close(): void {
    this.dialogRef.close();
  }
}
