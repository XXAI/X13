import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { InsumoLoteDialogoComponent } from '../insumo-lote-dialogo/insumo-lote-dialogo.component';

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
  filtroTipoInsumo:string;
  claveInsumoSeleccionado:string;

  iconoMedicamento:string = 'assets/icons-ui/MED.svg';
  iconoMatCuracion:string = 'assets/icons-ui/MTC.svg';

  listadoLotesMovimiento:any[];
  controlInsumosAgregados:any;
  
  ngOnInit() {
    this.mostrarBuscadorInsumos = false;
    this.filtroTipoInsumo = '*';
    this.listadoLotesMovimiento = [];
    this.controlInsumosAgregados = {};

    this.formEntrada = this.formBuilder.group({
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

  applySearch(){
    console.log(this.insumoQuery);
    this.listadoInsumos = [];
    /*this.selectedItemIndex = -1;
    this.paginator.pageIndex = 0;
    this.paginator.pageSize = this.pageSize;
    this.loadListadoLlamadas(null);*/
    for (let index = 0; index < 10; index++) {
      let tipo_insumo = Math.floor(Math.random() * (10 - 1 + 1)) + 1;
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

  agregarInsumo(insumo){
    let insumoLote;
    if(this.controlInsumosAgregados[insumo.id]){
      let index = this.listadoLotesMovimiento.findIndex(x => x.id === insumo.id);
      insumoLote = this.listadoLotesMovimiento[index];
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
          this.listadoLotesMovimiento.push(response);
          this.totales.insumos = this.listadoLotesMovimiento.length;
          
          if(response.tipo_insumo == 'MED'){
            this.totales.medicamentos += 1;
          }else{
            this.totales.mat_curacion += 1;
          }
          this.controlInsumosAgregados[response.id] = true;
        }else{
          let index = this.listadoLotesMovimiento.findIndex(x => x.id === response.id);
          this.listadoLotesMovimiento[index] = response;
        }
      }else{
        console.log('Cancelar');
      }
    });
  }

  cleanSearch(){
    this.insumoQuery = '';
  }

}
