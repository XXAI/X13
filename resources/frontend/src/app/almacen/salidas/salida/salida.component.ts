import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlmacenService } from '../../almacen.service';
import { SalidasService } from '../salidas.service';
import { SharedService } from '../../../shared/shared.service';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatDrawer } from '@angular/material/sidenav';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { ConfirmActionDialogComponent } from '../../../utils/confirm-action-dialog/confirm-action-dialog.component';
import { DatePipe } from '@angular/common';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { MatSort } from '@angular/material/sort';
import {animate, state, style, transition, trigger} from '@angular/animations';

@Component({
  selector: 'app-salida',
  templateUrl: './salida.component.html',
  styleUrls: ['./salida.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed, void', style({ height: '0px' })), 
      state('expanded', style({ height: '*' })), 
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')), 
      transition('expanded <=> void', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)'))
    ]),
  ],
})
export class SalidaComponent implements OnInit {
  @ViewChild(MatPaginator) articulosPaginator: MatPaginator;
  @ViewChild(MatTable) articulosTable: MatTable<any>;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    private datepipe: DatePipe,
    private formBuilder: FormBuilder, 
    private almacenService: AlmacenService, 
    private salidasService: SalidasService, 
    private sharedService: SharedService, 
    private dialog: MatDialog, 
    private route: ActivatedRoute
  ) { }

  formMovimiento:FormGroup;
  catalogos:any;

  idArticuloSeleccionado:number;

  controlArticulosAgregados:any;
  controlArticulosModificados:any;
  listadoArticulosEliminados:any[];

  filtroArticulos:string;
  filtroAplicado:boolean;

  filteredUnidades: Observable<any[]>;
  filteredProgramas: Observable<any[]>;

  totalesSalida: any;

  pageEvent: PageEvent;
  resultsLength: number = 0;
  currentPage: number = 0;
  pageSize: number = 10;
  pageSizeOptions: number[] = [10, 20, 30, 50];
  dataSourceArticulos: MatTableDataSource<any>;

  displayedColumns: string[] = ['estatus','clave','nombre','no_lotes','total_piezas','total_monto','actions'];
  
  editable: boolean;
  puedeEditarElementos: boolean;

  verBoton: any;
  isLoading: boolean;
  isSaving: boolean;
  estatusMovimiento: string;
  maxFechaMovimiento: Date;

  listaEstatusIconos: any = { 'NV':'save_as', 'BOR':'content_paste',  'CON':'description', 'CAN':'cancel'  };
  listaEstatusClaves: any = { 'NV':'nuevo',   'BOR':'borrador',       'CON':'concluido',   'CAN':'cancelado' };
  listaEstatusLabels: any = { 'NV':'Nuevo',   'BOR':'Borrador',       'CON':'Concluido',   'CAN':'Cancelado' };
  
  estatusArticulosColores = {1:'verde', 2:'ambar', 3:'rojo'};
  estatusArticulosIconos = {1:'check_circle_outline', 2:'notification_important', 3:'warning'};

  ngOnInit() {
    this.isLoading = true;

    this.editable = false;
    this.puedeEditarElementos = false;
    //this.listadoArticulosEliminados = [];
    this.controlArticulosAgregados = {};
    //this.controlArticulosModificados = {};

    this.totalesSalida = {
      claves: 0,
      lotes: 0,
      articulos: 0,
      monto: parseFloat('0'),
      por_caducar: {
        claves: 0,
        lotes: 0,
        articulos: 0,
        monto: parseFloat('0'),
      },
      caducados:{
        claves: 0,
        lotes: 0,
        articulos: 0,
        monto: parseFloat('0'),
      }
    }
    
    this.catalogos = {
      'almacenes':[],
      'programas':[],
      'unidades_medicas':[],
      'tipos_movimiento':[],
    };

    this.maxFechaMovimiento = new Date();
    
    this.formMovimiento = this.formBuilder.group({
      id:[''],
      tipo_movimiento_id:['',Validators.required],
      fecha_movimiento: [new Date(),Validators.required], //Por default la fecha actual
      unidad_medica_destino: [''],
      unidad_medica_destino_id: ['',Validators.required],
      almacen_id: ['',Validators.required],
      programa: [''],
      programa_id: [''],
      observaciones: [''],
    });

    this.filteredProgramas = this.formMovimiento.get('programa').valueChanges.pipe( startWith(''), map(value => typeof value === 'string' ? value : (value)?value.descripcion:''),
                                map(descripcion => descripcion ? this._filter('programas',descripcion) : this.catalogos['programas'].slice())
                              );

    this.filteredUnidades = this.formMovimiento.get('unidad_medica_destino').valueChanges.pipe( startWith(''), map(value => typeof value === 'string' ? value : (value)?value.descripcion:''),
                                map(descripcion => descripcion ? this._filter('unidades_medicas',descripcion) : this.catalogos['unidades_medicas'].slice())
                              );

    this.verBoton = {
      concluir:false,
      guardar:false,
      agregar_articulos:false
    };

    let lista_catalogos:any = {almacenes:'*',programas:'*',unidades_medicas:'*',tipos_movimiento:'movimiento.SAL'};
    
    this.almacenService.obtenerMovimientoCatalogos(lista_catalogos).subscribe(
      response =>{
        if(response.error) {
          let errorMessage = response.error.message;
          this.sharedService.showSnackBar(errorMessage, null, 3000);
        } else {
          this.catalogos['almacenes'] = response.data.almacenes;
          this.catalogos['programas'] = response.data.programas;
          this.catalogos['unidades_medicas'] = response.data.unidades_medicas;
          this.catalogos['tipos_movimiento'] = response.data.tipos_movimiento;

          if(this.catalogos['almacenes'].length == 1){
            this.formMovimiento.get('almacen_id').patchValue(this.catalogos['almacenes'][0].id);
          }

          if(this.catalogos['tipos_movimiento'].length == 1){
            this.formMovimiento.get('tipo_movimiento_id').patchValue(this.catalogos['tipos_movimiento'][0].id);
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

    this.route.paramMap.subscribe(params => {
      if(params.get('id')){
        this.salidasService.verSalida(params.get('id')).subscribe(
          response =>{
            if(response.error) {
              let errorMessage = response.error.message;
              this.sharedService.showSnackBar(errorMessage, null, 3000);
            } else {
              response.data.fecha_movimiento = new Date(response.data.fecha_movimiento+'T12:00:00');
              if(response.data.referencia_fecha){
                response.data.referencia_fecha = new Date(response.data.referencia_fecha+'T12:00:00');
              }
              this.formMovimiento.patchValue(response.data);

              if(response.data.estatus == 'BOR'){
                this.estatusMovimiento = 'BOR';
                this.editable = true;
                this.puedeEditarElementos = true;
                this.verBoton = {
                  concluir:true,
                  guardar:true,
                  agregar_articulos:true
                };
              }else if(response.data.estatus == 'FIN'){
                this.estatusMovimiento = 'CON';
              }else if(response.data.estatus == 'CANCL'){
                this.estatusMovimiento = 'CAN';
              }

              let articulos_temp = [];
              let lista_articulos;

              if(this.estatusMovimiento == 'BOR'){
                lista_articulos = response.data.lista_articulos_borrador;
              }else{
                lista_articulos = response.data.lista_articulos;
              }

              for(let i in lista_articulos){
                lista_articulos[i].total_monto = parseFloat(lista_articulos[i].total_monto||0);

                if(!this.controlArticulosAgregados[lista_articulos[i].articulo.id]){
                  let articulo:any = {
                    id: lista_articulos[i].articulo.id,
                    estatus: 1,
                    clave: (lista_articulos[i].articulo.clave_cubs)?lista_articulos[i].articulo.clave_cubs:lista_articulos[i].articulo.clave_local,
                    nombre: lista_articulos[i].articulo.articulo,
                    descripcion: lista_articulos[i].articulo.especificaciones,
                    partida_clave: lista_articulos[i].articulo.clave_partida_especifica,
                    partida_descripcion: lista_articulos[i].articulo.partida_especifica,
                    familia: lista_articulos[i].articulo.familia,
                    tiene_fecha_caducidad: (lista_articulos[i].articulo.tiene_fecha_caducidad)?true:false,
                    en_catalogo: (lista_articulos[i].articulo.en_catalogo_unidad)?true:false,
                    indispensable: (lista_articulos[i].articulo.es_indispensable)?true:false,
                    descontinuado: (lista_articulos[i].articulo.descontinuado)?true:false,
                    total_monto: lista_articulos[i].total_monto,
                  };

                  /*articulo.lotes = [{
                    lote:             (lista_articulos[i].stock)?lista_articulos[i].stock.lote:lista_articulos[i].lote,
                    cantidad:         lista_articulos[i].cantidad,
                    fecha_caducidad:  (lista_articulos[i].stock)?lista_articulos[i].stock.fecha_caducidad:lista_articulos[i].fecha_caducidad,
                    codigo_barras:    (lista_articulos[i].stock)?lista_articulos[i].stock.codigo_barras:lista_articulos[i].codigo_barras,
                    precio_unitario:  lista_articulos[i].precio_unitario,
                    iva:              lista_articulos[i].iva,
                    total_monto:      lista_articulos[i].total_monto,
                    memo_folio:       (lista_articulos[i].carta_canje)?lista_articulos[i].carta_canje.memo_folio:lista_articulos[i].memo_folio,
                    memo_fecha:       (lista_articulos[i].carta_canje)?lista_articulos[i].carta_canje.memo_fecha:lista_articulos[i].memo_fecha,
                    vigencia_meses:       (lista_articulos[i].carta_canje)?lista_articulos[i].carta_canje.vigencia_meses:lista_articulos[i].vigencia_meses,
                  }];*/
                  
                  /*articulo.no_lotes = 1;
                  articulo.total_piezas = lista_articulos[i].cantidad;*/
                  articulos_temp.push(articulo);

                  this.controlArticulosAgregados[articulo.id] = true;
                  this.totalesSalida.claves += 1;
                }else{
                  let index = articulos_temp.findIndex(x => x.id == lista_articulos[i].articulo.id);
                  let articulo:any = articulos_temp[index];

                  /*articulo.lotes.push({
                    lote:             (lista_articulos[i].stock)?lista_articulos[i].stock.lote:lista_articulos[i].lote,
                    cantidad:         lista_articulos[i].cantidad,
                    fecha_caducidad:  (lista_articulos[i].stock)?lista_articulos[i].stock.fecha_caducidad:lista_articulos[i].fecha_caducidad,
                    codigo_barras:    (lista_articulos[i].stock)?lista_articulos[i].stock.codigo_barras:lista_articulos[i].codigo_barras,
                    precio_unitario:  lista_articulos[i].precio_unitario,
                    iva:              lista_articulos[i].iva,
                    total_monto:      lista_articulos[i].total_monto,
                    memo_folio:       (lista_articulos[i].carta_canje)?lista_articulos[i].carta_canje.memo_folio:lista_articulos[i].memo_folio,
                    memo_fecha:       (lista_articulos[i].carta_canje)?lista_articulos[i].carta_canje.memo_fecha:lista_articulos[i].memo_fecha,
                    vigencia_meses:       (lista_articulos[i].carta_canje)?lista_articulos[i].carta_canje.vigencia_meses:lista_articulos[i].vigencia_meses,
                  });*/
                  
                  /*articulo.no_lotes += 1;
                  articulo.total_piezas += lista_articulos[i].cantidad;
                  articulo.total_monto += lista_articulos[i].total_monto;*/
                }

                this.totalesSalida.articulos += lista_articulos[i].cantidad;
                this.totalesSalida.monto += lista_articulos[i].total_monto;
              }

              this.dataSourceArticulos = new MatTableDataSource<any>(articulos_temp);
              this.dataSourceArticulos.paginator = this.articulosPaginator;
              this.dataSourceArticulos.sort = this.sort;
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
      }else{
        this.estatusMovimiento = 'NV';
        this.dataSourceArticulos = new MatTableDataSource<any>([]);
        this.dataSourceArticulos.paginator = this.articulosPaginator;
        this.dataSourceArticulos.sort = this.sort;
        this.editable = true;
        this.puedeEditarElementos = true;
        this.verBoton = {
          concluir:true,
          guardar:true,
          agregar_articulos:true
        };
      }
    });
  }

  agregarArticulo(articulo){
    console.log(articulo);
  }

  quitarArticulo(articulo){ 
    const dialogRef = this.dialog.open(ConfirmActionDialogComponent, {
      width: '500px',
      data:{dialogTitle:'Eliminar Articulo?',dialogMessage:'Esta seguro de eliminar este articulo?',btnColor:'warn',btnText:'Eliminar'}
    });

    dialogRef.afterClosed().subscribe(valid => {
      if(valid){
        this.controlArticulosAgregados[articulo.id] = false;
        
        this.totalesSalida.claves -= 1;
        this.totalesSalida.articulos -= articulo.total_piezas;
        this.totalesSalida.monto -= articulo.total_monto;

        let index = this.dataSourceArticulos.data.findIndex(x => x.id === articulo.id);

        //Guardar para papelera
        let articulo_copia = JSON.parse(JSON.stringify(this.dataSourceArticulos.data[index]));
        this.listadoArticulosEliminados.push(articulo_copia);

        this.dataSourceArticulos.data.splice(index,1);
        this.articulosTable.renderRows();
        this.dataSourceArticulos.paginator = this.articulosPaginator;
        this.dataSourceArticulos.sort = this.sort;

        this.idArticuloSeleccionado = null;
      }
    });
  }

  concluirMovimiento(){
    const dialogRef = this.dialog.open(ConfirmActionDialogComponent, {
      width: '500px',
      data:{dialogTitle:'Concluir Movimiento?',dialogMessage:'Esta seguro de concluir esta salida? escriba CONCLUIR para confirmar la acción',validationString:'CONCLUIR',btnColor:'primary',btnText:'Concluir'}
    });

    dialogRef.afterClosed().subscribe(valid => {
      if(valid){
        this.guardarMovimiento(true);
      }
    });
  }

  guardarMovimiento(concluir:boolean = false){
    //
  }

  aplicarFiltroArticulos(event: Event){ 
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceArticulos.filter = filterValue.trim().toLowerCase();
    if(filterValue.trim().toLowerCase() == ''){
      this.filtroAplicado = false;
    }else{
      this.filtroAplicado = true;
    }
  }

  expandirRow(row){
    this.idArticuloSeleccionado = this.idArticuloSeleccionado === row.id ? null : row.id;
  }
  
  limpiarFiltroArticulos(){ 
    this.filtroArticulos = '';
    this.dataSourceArticulos.filter = '';
    this.filtroAplicado = false;
  }

  getDisplayFn(label: string){
    return (val) => this.displayFn(val,label);
  }

  displayFn(value: any, valueLabel: string){
    return value ? value[valueLabel] : '';
  }

  private _filter(catalogo: string, nombre: string): any[] {
    const filterValue = nombre.toLowerCase();
    return this.catalogos[catalogo].filter(option => option.nombre.toLowerCase().includes(filterValue));
  }

}
