import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { InsumoLoteDialogoComponent } from '../insumo-lote-dialogo/insumo-lote-dialogo.component';
import { ConfirmActionDialogComponent } from '../../../utils/confirm-action-dialog/confirm-action-dialog.component';
import { CustomValidator } from '../../../utils/classes/custom-validator';
import { startWith, map } from 'rxjs/operators';

@Component({
  selector: 'app-entrada',
  templateUrl: './entrada.component.html',
  styleUrls: ['./entrada.component.css']
})
export class EntradaComponent implements OnInit {
  constructor(private formBuilder: FormBuilder, private dialog: MatDialog) { }

  formEntrada:FormGroup;
  catalogos: any;
  totales: any;
  mostrarBuscadorInsumos:boolean;

  insumoQuery:string;
  listadoInsumos:any[];
  busquedaTipoInsumo:string;
  claveInsumoSeleccionado:string;

  iconoMedicamento:string = 'assets/icons-ui/MED.svg';
  iconoMatCuracion:string = 'assets/icons-ui/MTC.svg';

  listadoInsumosMovimiento:any[];
  filtroInsumosMovimiento:any[];
  controlInsumosAgregados:any;

  filtroInsumos:string;
  filtroTipoInsumos:string;
  
  ngOnInit() {
    this.mostrarBuscadorInsumos = false;
    this.busquedaTipoInsumo = '*';
    this.listadoInsumosMovimiento = [];
    this.controlInsumosAgregados = {};
    this.listadoInsumos = [];

    this.formEntrada = this.formBuilder.group({
      fecha_movimiento:['',[Validators.required,CustomValidator.isValidDate()]],
      programa_id:[''],
      folio:[''],
      descripcion:['',Validators.required],
      actor:['',Validators.required],
      observaciones:[''],
    });

    this.filtrarInsumos();

    this.catalogos = {programas:[]};

    this.totales = {
      insumos: 0,
      medicamentos: 0,
      mat_curacion: 0
    }
  }

  applySearch(){
    this.listadoInsumos = [];
    /*this.selectedItemIndex = -1;
    this.paginator.pageIndex = 0;
    this.paginator.pageSize = this.pageSize;
    this.loadListadoLlamadas(null);*/
    let total_resultados = Math.floor(Math.random() * (150 - 1 + 1) + 1);
    for (let index = 0; index < total_resultados; index++) {
      let tipo_insumo = 0;

      if(this.busquedaTipoInsumo == 'MED'){
        tipo_insumo = 10;
      }else if(this.busquedaTipoInsumo == 'MTC'){
        tipo_insumo = 1;
      }else{
        tipo_insumo = Math.floor(Math.random() * (10 - 1 + 1)) + 1;
      }
      

      let id = Math.floor(Math.random() * (1000 - 1 + 1) + 1);

      let clave = id+"";
      while (clave.length < 4) clave = "0" + clave;

      this.listadoInsumos.push({
        id:id,
        icono:(tipo_insumo < 5)?this.iconoMatCuracion:this.iconoMedicamento,
        tipo_insumo:(tipo_insumo < 5)?'MTC':'MED',
        clave:'0052.0136.0025.'+clave,
        //color:(tipo_insumo < 5)?'coral':'cornflowerblue',
        nombre:'REACTIVOS Y JUEGOS DE REACTIVOS',
        info:'informacion del medicamento',
        descripcion:'The Shiba Inu is the smallest of the six original and distinct spitz breeds of dog from Japan. A small, agile dog that copes very well with mountainous terrain, the Shiba Inu was originally bred for hunting.'
      });
    }
  }

  private filtrarInsumos(){
    let filterValue;
    let filterTipoInsumo;

    if(this.filtroInsumos){
      filterValue = this.filtroInsumos.toLowerCase();
    }

    if(this.filtroTipoInsumos != '*'){
      filterTipoInsumo = this.filtroTipoInsumos;
    }
    //TODO:Agregar filtros por tipo de medicamento
    if(filterValue || filterTipoInsumo){
      this.filtroInsumosMovimiento = this.listadoInsumosMovimiento.filter(
        option => (!filterValue || ( filterValue && (option.clave.toLowerCase().includes(filterValue.toLowerCase()) || option.nombre.toLowerCase().includes(filterValue.toLowerCase())) )) && ( !filterTipoInsumo || ( filterTipoInsumo && (option.tipo_insumo == filterTipoInsumo) ) )
      );  
    }else{
      this.filtroInsumosMovimiento = this.listadoInsumosMovimiento;
    }
  }

  agregarInsumo(insumo){
    let insumoLote;
    if(this.controlInsumosAgregados[insumo.id]){
      let index = this.listadoInsumosMovimiento.findIndex(x => x.id === insumo.id);
      insumoLote = this.listadoInsumosMovimiento[index];
    }else{
      insumoLote = insumo;
    }

    this.agregarLoteInsumo(insumoLote);
  }

  agregarLoteInsumo(insumo){
    this.claveInsumoSeleccionado = insumo.clave;
    //console.log(insumo);
    
    let configDialog = {
      width: '99%',
      maxHeight: '90vh',
      height: '643px',
      data:{insumoLotes: insumo},
      panelClass: 'no-padding-dialog'
    };

    const dialogRef = this.dialog.open(InsumoLoteDialogoComponent, configDialog);

    dialogRef.afterClosed().subscribe(response => {
      if(response){
        if(!this.controlInsumosAgregados[response.id]){
          this.listadoInsumosMovimiento.push(response);
          this.totales.insumos = this.listadoInsumosMovimiento.length;
          
          if(response.tipo_insumo == 'MED'){
            this.totales.medicamentos += 1;
          }else{
            this.totales.mat_curacion += 1;
          }
          this.controlInsumosAgregados[response.id] = true;
        }else{
          let index = this.listadoInsumosMovimiento.findIndex(x => x.id === response.id);
          this.listadoInsumosMovimiento[index] = response;
        }

        this.filtrarInsumos();
      }else{
        console.log('Cancelar');
      }
    });
  }

  eliminarInsumo(index:number){
    const dialogRef = this.dialog.open(ConfirmActionDialogComponent, {
      width: '500px',
      data:{dialogTitle:'Eliminar Insumo',dialogMessage:'Esta seguro de eliminar este insumo y todos sus lotes?',btnColor:'warn',btnText:'Eliminar'}
    });

    dialogRef.afterClosed().subscribe(valid => {
      if(valid){
        this.claveInsumoSeleccionado = '';
        let insumo = this.listadoInsumosMovimiento[index];
        this.totales.insumos -= 1;
        if(insumo.tipo_insumo == 'MED'){
          this.totales.medicamentos -= 1;
        }else{
          this.totales.mat_curacion -= 1;
        }
        this.controlInsumosAgregados[insumo.id] = false;
        this.listadoInsumosMovimiento.splice(index,1);

        this.filtrarInsumos();
      }
    });
  }

  cleanSearch(){
    this.insumoQuery = '';
  }

}
