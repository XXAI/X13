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
    this.listaAcciones = [
      {codigo:'DIV',descripcion:'Dividir la cantidad de cada insumo entre las unidades seleccionadas'},
      {codigo:'MUL',descripcion:'Multiplicar la cantidad de cada insumo entre las unidades seleccionadas'},
      {codigo:'SEL',descripcion:'Asignar la cantidad del insumo a una unidad seleccionada'}
    ];

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
    this.dialogRef.close({accion: this.accionSeleccionada, unidad_seleccionada: this.unidadSeleccionada.value});
  }

  close(): void {
    this.dialogRef.close();
  }
}
