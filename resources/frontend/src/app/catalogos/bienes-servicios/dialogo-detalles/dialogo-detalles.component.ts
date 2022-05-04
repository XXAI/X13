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
  modificarEnExistencias: boolean;

  empaqueDetalles:any[];

  selectedDetalleIndex:number;

  autoClaveLocal:boolean;
  autoDescripcion:boolean;

  catalogoAutocomplete:any = {partidas:[], familias:[], empaques:[], unidades_medida:[]};
  selectTiposArticulo:any[];

  filteredPartidas: Observable<any[]>;
  filteredFamilias: Observable<any[]>;
  filteredEmpaques: Observable<any[]>;
  filteredUnidadesMedida: Observable<any[]>;

  ngOnInit(): void {
    this.selectTiposArticulo = [];
    this.empaqueDetalles = [];
    this.autoClaveLocal = false;
    this.modificarEnExistencias = false;
    this.selectedDetalleIndex = -1;

    this.formArticulo = this.formBuilder.group({
      'id':                         [''],
      'partida_especifica':         ['',Validators.required],
      'clave_partida_especifica':   [''],
      'familia':                    ['',Validators.required],
      'familia_id':                 [''],
      'tipo_bien_servicio_id':      ['',Validators.required],
      'clave_cubs':                 [''],
      'clave_local':                ['',Validators.required],
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
      'eliminar':                   [false],
    });

    this.toggleDescripcionAutomatica(true);

    this.isLoading = true;
    this.bienesServiciosService.getCatalogos().subscribe(
      response =>{
        let keep:boolean = false;
        if(response.error) {
          let errorMessage = response.error;
          this.sharedService.showSnackBar(errorMessage, null, 3000);
        } else {
          this.selectTiposArticulo = response.data.tipos_bien_servicio;
          this.catalogoAutocomplete['partidas'] = response.data.partidas_especificas;
          this.catalogoAutocomplete['familias'] = response.data.familias;
          this.catalogoAutocomplete['empaques'] = response.data.empaques;
          this.catalogoAutocomplete['unidades_medida'] = response.data.unidades_medida;

          this.filteredPartidas = this.formArticulo.get('partida_especifica').valueChanges.pipe( startWith(''), map(value => typeof value === 'string' ? value : (value)?value.descripcion:''),
                                      map(descripcion => descripcion ? this._filter('partidas',descripcion,'descripcion') : this.catalogoAutocomplete['partidas'].slice())
                                    );
          this.filteredFamilias = this.formArticulo.get('familia').valueChanges.pipe( startWith(''), map(value => typeof value === 'string' ? value : (value)?value.nombre:''),
                                    map(nombre => nombre ? this._filter('familias',nombre,'nombre') : this.catalogoAutocomplete['familias'].slice())
                                  );
          this.filteredEmpaques = this.formDetalles.get('empaque').valueChanges.pipe( startWith(''), map(value => typeof value === 'string' ? value : (value)?value.descripcion:''),
                                    map(descripcion => descripcion ? this._filter('empaques',descripcion,'descripcion') : this.catalogoAutocomplete['empaques'].slice())
                                  );
          this.filteredUnidadesMedida = this.formDetalles.get('unidad_medida').valueChanges.pipe( startWith(''), map(value => typeof value === 'string' ? value : (value)?value.descripcion:''),
                                    map(descripcion => descripcion ? this._filter('unidades_medida',descripcion,'descripcion') : this.catalogoAutocomplete['unidades_medida'].slice())
                                  );
          //
          if(this.data.id){
            keep = true;
            this.bienesServiciosService.getBienServicio(this.data.id).subscribe(
              response =>{
                if(response.error) {
                  let errorMessage = response.error;
                  this.sharedService.showSnackBar(errorMessage, null, 3000);
                } else {
                  
                  this.formArticulo.patchValue(response.data);
                  this.empaqueDetalles = response.data.empaque_detalle;

                  if(response.data.updated_at){
                    this.ultimaActualizacion = new Date(response.data.updated_at);
                  }else{
                    this.ultimaActualizacion = new Date();
                  }

                  if(response.data.existencias){
                    this.modificarEnExistencias = true;
                  }
                  
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
        }
        this.isLoading = keep;
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

  modificarLotes(){
    //
  }

  nuevoArticulo(){
    this.formArticulo.reset();
    this.formDetalles.reset();
    this.modificarEnExistencias = false;
    this.ultimaActualizacion = null;
    this.empaqueDetalles = [];
    this.autoClaveLocal = false;
    this.selectedDetalleIndex = -1;
  }

  eliminaArticulo(){
    //
  }

  guardarArticulo(){
    if(this.formArticulo.valid){
      this.isSaving = true;

      let datosArticulo:any = JSON.parse(JSON.stringify(this.formArticulo.value));
      if(this.autoClaveLocal){
        datosArticulo.generar_clave_local = true;
      }

      datosArticulo.familia_id = datosArticulo.familia.id;
      datosArticulo.clave_partida_especifica = datosArticulo.partida_especifica.clave;
      
      delete datosArticulo.familia;
      delete datosArticulo.partida_especifica;

      datosArticulo.detalles = [];
      this.empaqueDetalles.forEach(item =>{
        let detalle = JSON.parse(JSON.stringify(item));
        //let detalle = item;
        detalle.empaque_id = detalle.empaque.id;
        detalle.unidad_medida_id = detalle.unidad_medida.id;
        delete detalle.empaque;
        delete detalle.unidad_medida;
        datosArticulo.detalles.push(detalle);
      });
      
      this.bienesServiciosService.saveBienServicio(datosArticulo).subscribe(
        response =>{
          if(response.error) {
            let errorMessage = response.error;
            this.sharedService.showSnackBar(errorMessage, null, 3000);
          } else {
            this.formArticulo.get('id').patchValue(response.data.id);
            //this.empaqueDetalles = response.data.empaque_detalle;
            this.ultimaActualizacion = new Date(response.data.updated_at);
          }
          this.isSaving = false;
        },
        errorResponse =>{
          var errorMessage = "Ocurrió un error.";
          if(errorResponse.status == 409){
            errorMessage = errorResponse.error.error.message;
          }
          this.sharedService.showSnackBar(errorMessage, null, 3000);
          this.isSaving = false;
        }
      );
    }
  }

  aceptarDetalles(){
    if(this.formDetalles.valid){
      let datosDetalle = this.formDetalles.value;

      if(this.autoDescripcion){
        datosDetalle.descripcion = datosDetalle.empaque.descripcion + ' con ' + datosDetalle.piezas_x_empaque + ' ( ' + datosDetalle.unidad_medida.descripcion + ' )';
      }

      if(this.selectedDetalleIndex >= 0){
        if(datosDetalle.id){
          datosDetalle.editado = true;
        }
        this.empaqueDetalles[this.selectedDetalleIndex] = datosDetalle;
      }else{
        this.empaqueDetalles.push(datosDetalle);
      }
    }
    this.selectedDetalleIndex = -1;
    this.formDetalles.reset();
    this.toggleDescripcionAutomatica(true);
  }

  toggleMarcarEliminar(){
    let eliminar = this.formDetalles.get('eliminar').value;
    this.formDetalles.get('eliminar').patchValue(!eliminar);
  }

  cancelarDetalles(){
    this.selectedDetalleIndex = -1;
    this.formDetalles.reset();
    this.toggleDescripcionAutomatica(true);
  }

  seleccionarDetalle(event){
    let detalle = event.option.value;
    let index = this.empaqueDetalles.indexOf(detalle);
    this.selectedDetalleIndex = index;
    this.toggleDescripcionAutomatica(false);
    this.formDetalles.patchValue(detalle);
  }

  toggleClaveLocal(){
    this.autoClaveLocal = !this.autoClaveLocal;
    if(this.autoClaveLocal){
      this.formArticulo.get('clave_local').patchValue('Generar clave CL-000...');
      this.formArticulo.get('clave_local').disable();
    }else{
      this.formArticulo.get('clave_local').patchValue('');
      this.formArticulo.get('clave_local').enable();
      this.formArticulo.get('clave_local').markAsDirty();
      this.formArticulo.get('clave_local').markAsTouched();
    }
  }

  toggleDescripcionAutomatica(value:boolean){
    this.autoDescripcion = value;
    if(this.autoDescripcion){
      this.formDetalles.get('descripcion').patchValue('Descripcion automatica...');
      this.formDetalles.get('descripcion').disable();
    }else{
      this.formDetalles.get('descripcion').patchValue('');
      this.formDetalles.get('descripcion').enable();
      this.formDetalles.get('descripcion').markAsDirty();
      this.formDetalles.get('descripcion').markAsTouched();
    }
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
    return this.catalogoAutocomplete[catalogo].filter(option => option[field].toLowerCase().includes(filterValue));
  }

  cerrar(){
    this.dialogRef.close();
  }
}
