import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';


@Component({
  selector: 'app-salida',
  templateUrl: './salida.component.html',
  styleUrls: ['./salida.component.css']
})
export class SalidaComponent implements OnInit {

  constructor(private formBuilder: FormBuilder) { }

  formSalida:FormGroup;
  catalogos: any;
  totales: any;

  ngOnInit() {
    this.formSalida = this.formBuilder.group({
      fecha_movimiento:['',Validators.required],
      programa_id:[''],
      folio:[''],
      descripcion:['',Validators.required],
      actor:['',Validators.required],
      observaciones:[''],
    });

    this.catalogos = {programas:[]};

    this.totales = {
      insumos: 0,
      medicamentos: 0,
      mat_curacion: 0
    }
  }

}
