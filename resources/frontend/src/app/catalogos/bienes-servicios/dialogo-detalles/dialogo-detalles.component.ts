import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { map, startWith, timeout } from 'rxjs/operators';
import { SharedService } from 'src/app/shared/shared.service';
import { BienesServiciosService } from '../bienes-servicios.service';

export interface DialogData {
  id: number;
}

@Component({
  selector: 'app-dialogo-detalles',
  templateUrl: './dialogo-detalles.component.html',
  styleUrls: ['./dialogo-detalles.component.css']
})
export class DialogoDetallesComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<DialogoDetallesComponent>,
    private sharedService: SharedService,
    private bienesServiciosService: BienesServiciosService,
    private formBuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) { }

  isLoading:boolean;
  isSaving:boolean;
  formArticulo: FormGroup;
  formDetalles: FormGroup;
  ultimaActualizacion: Date;

  catalogo_autocomplete:any = {partidas:[], familias:[], empaques:[], unidades_medida:[]};
  select_tipos_articulo:any[];

  filteredPartidas: Observable<any[]>;
  filteredFamilias: Observable<any[]>;
  filteredEmpaques: Observable<any[]>;
  filteredUnidadesMedida: Observable<any[]>;

  ngOnInit(): void {
    this.select_tipos_articulo = [];

    this.formArticulo = this.formBuilder.group({
      'id':                         [''],
      'partida_especifica':         ['',Validators.required],
      'clave_partida_especifica':   [''],
      'familia':                    ['',Validators.required],
      'familia_id':                 [''],
      'tipo_bien_servicio_id':      ['',Validators.required],
      'clave_cubs':                 [''],
      'clave_local':                [''],
      'articulo':                   ['',Validators.required],
      'especificaciones':           ['',Validators.required],
      'destacar':                   [''],
      'descontinuado':              [''],
      'tiene_fecha_caducidad':      [''],
      'puede_surtir_unidades':      [''],
    });

    this.formDetalles = this.formBuilder.group({
      'id':                         [''],
      'descripcion':                ['',Validators.required],
      'empaque':                    ['',Validators.required],
      'empaque_id':                 [''],
      'unidad_medida':              ['',Validators.required],
      'unidad_medida_id':           [''],
      'piezas_x_empaque':           ['',Validators.required],
      'en_especificaciones':        [''],
    });

    this.bienesServiciosService.getCatalogos().subscribe(
      response =>{
        if(response.error) {
          let errorMessage = response.error;
          this.sharedService.showSnackBar(errorMessage, null, 3000);
        } else {
          this.select_tipos_articulo = response.data.tipos_bien_servicio;
          this.catalogo_autocomplete['partidas'] = response.data.partidas_especificas;
          this.catalogo_autocomplete['familias'] = response.data.familias;
          this.catalogo_autocomplete['empaques'] = response.data.empaques;
          this.catalogo_autocomplete['unidades_medida'] = response.data.unidades_medida;

          this.filteredPartidas = this.formArticulo.get('partida_especifica').valueChanges.pipe( startWith(''), map(value => typeof value === 'string' ? value : (value)?value.descripcion:''),
                                      map(descripcion => descripcion ? this._filter('partidas',descripcion,'descripcion') : this.catalogo_autocomplete['partidas'].slice())
                                    );
          this.filteredFamilias = this.formArticulo.get('familia').valueChanges.pipe( startWith(''), map(value => typeof value === 'string' ? value : (value)?value.nombre:''),
                                    map(nombre => nombre ? this._filter('familias',nombre,'nombre') : this.catalogo_autocomplete['familias'].slice())
                                  );
          this.filteredEmpaques = this.formDetalles.get('empaque').valueChanges.pipe( startWith(''), map(value => typeof value === 'string' ? value : (value)?value.descripcion:''),
                                    map(descripcion => descripcion ? this._filter('empaques',descripcion,'descripcion') : this.catalogo_autocomplete['empaques'].slice())
                                  );
          this.filteredUnidadesMedida = this.formDetalles.get('unidad_medida').valueChanges.pipe( startWith(''), map(value => typeof value === 'string' ? value : (value)?value.descripcion:''),
                                    map(descripcion => descripcion ? this._filter('unidades_medida',descripcion,'descripcion') : this.catalogo_autocomplete['unidades_medida'].slice())
                                  );
          //
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
  }

  nuevoArticulo(){
    //
  }

  guardarArticulo(){
    //
  }

  validarOpcionSeleccionada(campo:string){
    setTimeout (() => {
      if(typeof this.formArticulo.get(campo).value == 'string' && this.formArticulo.get(campo).value != ''){
        this.formArticulo.get(campo).setErrors({notSelected:true});
      }
    }, 100);
  }

  validarOpcionSeleccionadaDetalles(campo:string){
    setTimeout (() => {
      if(typeof this.formDetalles.get(campo).value == 'string' && this.formDetalles.get(campo).value != ''){
        this.formDetalles.get(campo).setErrors({notSelected:true});
      }
    }, 100);
  }

  getDisplayFn(label: string){
    return (val) => this.displayFn(val,label);
  }

  displayFn(value: any, valueLabel: string){
    return value ? value[valueLabel] : '';
  }

  private _filter(catalogo: string, value: string, field: string): any[] {
    const filterValue = value.toLowerCase();
    return this.catalogo_autocomplete[catalogo].filter(option => option[field].toLowerCase().includes(filterValue));
  }

  cerrar(){
    this.dialogRef.close();
  }
}
