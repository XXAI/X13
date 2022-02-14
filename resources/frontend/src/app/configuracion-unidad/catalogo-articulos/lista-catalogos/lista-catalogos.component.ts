import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CatalogoArticulosService } from '../catalogo-articulos.service';
import { SharedService } from 'src/app/shared/shared.service';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatInput } from '@angular/material/input';
import { ConfirmActionDialogComponent } from 'src/app/utils/confirm-action-dialog/confirm-action-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-lista-catalogos',
  templateUrl: './lista-catalogos.component.html',
  styleUrls: ['./lista-catalogos.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed, void', style({ height: '0px' })), 
      state('expanded', style({ height: '*' })), 
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')), 
      transition('expanded <=> void', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)'))
    ]),
  ],
})
export class ListaCatalogosComponent implements OnInit {
  @ViewChild('cantidadMinima') inputFormField: ElementRef;

  @ViewChild(MatPaginator) articulosPaginator: MatPaginator;
  @ViewChild(MatTable) articulosTable: MatTable<any>;
  @ViewChild(MatSort) sort: MatSort;
  
  constructor(
    private sharedService: SharedService,
    private catalogoArticulosService: CatalogoArticulosService,
    private formBuilder: FormBuilder,
    private dialog: MatDialog
  ) { }

  isLoadingCatalogos: boolean;
  isLoadingArticulos: boolean;
  isSaving: boolean;
  idCatalogoSeleccionado: number;
  idTipoArticuloSeleccionado: number;

  catalogosDisponibles:any[];

  idArticuloSeleccionado:number;
  filtroArticulos:string;
  filtroAplicado:boolean;

  pageEvent: PageEvent;
  currentPage: number = 0;
  pageSize: number = 25;
  pageSizeOptions: number[] = [25, 30, 50, 100];
  dataSourceArticulos: MatTableDataSource<any>;

  displayedColumns: string[] = ['estatus','clave','articulo','cantidad_minima','cantidad_maxima','es_indispensable','actions'];
  
  puedeEditarElementos: boolean;

  modoSelecionMultiple: boolean;
  listaArticulosSeleccionados: any;
  conteoArticulosSeleccionados: number;

  formArticulo:FormGroup;

  ngOnInit(): void {
    this.isLoadingArticulos = false;
    this.isLoadingCatalogos = true;
    this.catalogosDisponibles = [];
    this.puedeEditarElementos = false;
    this.dataSourceArticulos = new MatTableDataSource<any>([]);
    this.dataSourceArticulos.paginator = this.articulosPaginator;
    this.dataSourceArticulos.sort = this.sort;

    this.catalogoArticulosService.getCatalogos().subscribe(
      response =>{
        if(response.error) {
          let errorMessage = response.error.message;
          this.sharedService.showSnackBar(errorMessage, null, 3000);
        } else {
          this.catalogosDisponibles = response.data;
        }
        this.isLoadingCatalogos = false;
      },
      errorResponse =>{
        var errorMessage = "Ocurrió un error.";
        if(errorResponse.status == 409){
          errorMessage = errorResponse.error.error.message;
        }
        this.sharedService.showSnackBar(errorMessage, null, 3000);
        this.isLoadingCatalogos = false;
      }
    );
  }

  seleccionarCatalogo(catalogo){
    this.idCatalogoSeleccionado = catalogo.id;
    this.idTipoArticuloSeleccionado = catalogo.tipo_bien_servicio_id;
    this.isLoadingArticulos = true;
    this.puedeEditarElementos = catalogo.puede_editar;
    this.dataSourceArticulos = new MatTableDataSource<any>([]);

    if(!this.puedeEditarElementos && this.modoSelecionMultiple){
      this.desactivarSeleccionMultiple();
    }else if(this.modoSelecionMultiple){
      this.conteoArticulosSeleccionados = 0;
      this.listaArticulosSeleccionados = {};
    }

    let params:any = {catalogo_id:catalogo.id};
    
    this.catalogoArticulosService.getListaArticulos(params).subscribe(
      response =>{
        if(response.error) {
          let errorMessage = response.error.message;
          this.sharedService.showSnackBar(errorMessage, null, 3000);
        } else {
          this.dataSourceArticulos = new MatTableDataSource<any>(response.data);
          this.dataSourceArticulos.paginator = this.articulosPaginator;
          this.dataSourceArticulos.sort = this.sort; 
        }
        this.isLoadingArticulos = false;
      },
      errorResponse =>{
        var errorMessage = "Ocurrió un error.";
        if(errorResponse.status == 409){
          errorMessage = errorResponse.error.error.message;
        }
        this.sharedService.showSnackBar(errorMessage, null, 3000);
        this.isLoadingArticulos = false;
      }
    );
  }

  clickEnRow(row){
    if(this.modoSelecionMultiple){
      if(row.id){
        if(!this.listaArticulosSeleccionados[row.id]){
          this.listaArticulosSeleccionados[row.id] = true;
          this.conteoArticulosSeleccionados += 1;
        }else{
          delete this.listaArticulosSeleccionados[row.id];
          this.conteoArticulosSeleccionados -= 1;
        }
      }
    }else{
      this.idArticuloSeleccionado = this.idArticuloSeleccionado === row.bien_servicio_id ? null : row.bien_servicio_id;

      if(this.puedeEditarElementos && !this.formArticulo){
        this.formArticulo = this.formBuilder.group({
          id:[''],
          bien_servicio_id:[''],
          unidad_medica_catalogo_id:[''],
          cantidad_minima:[''],
          cantidad_maxima:[''],
          es_indispensable:['']
        });
      }

      if(this.puedeEditarElementos){
        this.formArticulo.patchValue(row);
        
        setTimeout(() => {
          if(this.inputFormField){
            this.inputFormField.nativeElement.focus();
          }
        }, 10);
      }
    }
  }

  guardarCambios(){
    if(this.formArticulo.valid){
      this.isSaving = true;
      let datosForm = this.formArticulo.value;

      if(datosForm.id){
        this.catalogoArticulosService.updateArticulo(datosForm.id,datosForm).subscribe(
          response =>{
            if(response.error) {
              let errorMessage = response.error.message;
              this.sharedService.showSnackBar(errorMessage, null, 3000);
            } else {
              this.sharedService.showSnackBar('Cambios almacenados con éxito', null, 3000);
              let articulo = this.dataSourceArticulos.data.find(item => item.bien_servicio_id == datosForm.bien_servicio_id);
              articulo.cantidad_minima = datosForm.cantidad_minima;
              articulo.cantidad_maxima = datosForm.cantidad_maxima;
              articulo.es_indispensable = datosForm.es_indispensable;
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
      }else{
        this.catalogoArticulosService.saveArticulo(datosForm).subscribe(
          response =>{
            if(response.error) {
              let errorMessage = response.error.message;
              this.sharedService.showSnackBar(errorMessage, null, 3000);
            } else {
              this.sharedService.showSnackBar('Articulo agregado con éxito', null, 3000);
              let articulo = this.dataSourceArticulos.data.find(item => item.bien_servicio_id == datosForm.bien_servicio_id);
              articulo.id = response.data.id;
              articulo.cantidad_minima = response.data.cantidad_minima;
              articulo.cantidad_maxima = response.data.cantidad_maxima;
              articulo.es_indispensable = response.data.es_indispensable;

              let catalogo = this.catalogosDisponibles.find(item => item.id == this.idCatalogoSeleccionado);
              catalogo.total_articulos += 1;
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
  }

  agregarArticulo(articulo){ 
    let index = this.dataSourceArticulos.data.findIndex(item => item.bien_servicio_id == articulo.id);
    let articulo_catalogo:any;
    console.log(index);
    if(index >= 0){
      articulo_catalogo = this.dataSourceArticulos.data[index];
      this.dataSourceArticulos.data.splice(index,1);
    }else{
      articulo_catalogo = articulo;
      articulo_catalogo.bien_servicio_id = articulo.id;
      articulo_catalogo.id = null;
      articulo_catalogo.unidad_medica_catalogo_id = this.idCatalogoSeleccionado;
      articulo_catalogo.especificaciones = articulo.descripcion;
      articulo_catalogo.articulo = articulo.nombre;
      delete articulo_catalogo.nombre;
      delete articulo_catalogo.descripcion;
      articulo_catalogo.cantidad_maxima = null;
      articulo_catalogo.cantidad_minima = null;
      articulo_catalogo.es_indispensable = null;
    }

    this.dataSourceArticulos.data.unshift(articulo_catalogo);
    
    this.articulosTable.renderRows();
    this.dataSourceArticulos.paginator = this.articulosPaginator;
    this.dataSourceArticulos.sort = this.sort;

    //this.idArticuloSeleccionado = articulo_catalogo.bien_servicio_id;
    this.clickEnRow(articulo_catalogo);
    console.log(articulo_catalogo);
  }

  quitarArticulo(articulo){ 
    const dialogRef = this.dialog.open(ConfirmActionDialogComponent, {
      width: '500px',
      data:{dialogTitle:'Quitar Articulo?',dialogMessage:'Esta seguro que desea quitar este articulo de su catalogo?',btnColor:'warn',btnText:'Quitar'}
    });

    dialogRef.afterClosed().subscribe(valid => {
      if(valid){
        this.catalogoArticulosService.deleteArticulo(articulo.id).subscribe(
          response =>{
            if(response.error) {
              let errorMessage = response.error.message;
              this.sharedService.showSnackBar(errorMessage, null, 3000);
            } else {
              this.sharedService.showSnackBar('Articulo removido con éxito', null, 3000);

              let index = this.dataSourceArticulos.data.findIndex(x => x.id === articulo.id);
              this.dataSourceArticulos.data.splice(index,1);
              this.articulosTable.renderRows();
              this.dataSourceArticulos.paginator = this.articulosPaginator;
              this.dataSourceArticulos.sort = this.sort;
              this.idArticuloSeleccionado = null;

              let catalogo = this.catalogosDisponibles.find(item => item.id == this.idCatalogoSeleccionado);
              catalogo.total_articulos -= 1;
            }
            //this.isSaving = false;
          },
          errorResponse =>{
            var errorMessage = "Ocurrió un error.";
            if(errorResponse.status == 409){
              errorMessage = errorResponse.error.error.message;
            }
            this.sharedService.showSnackBar(errorMessage, null, 3000);
            //this.isSaving = false;
          }
        );
      }
    });
  }

  quitarMultiplesArticulos(){
    const dialogRef = this.dialog.open(ConfirmActionDialogComponent, {
      width: '500px',
      data:{dialogTitle:'Quitar '+this.conteoArticulosSeleccionados+' Articulo(s)?',dialogMessage:'Esta seguro que desea quitar estos articulos de su catalogo?',btnColor:'warn',btnText:'Quitar'}
    });

    let articulo_id = 0;
    let lista_articulos_ids:string = '';
    let params:any = {borrado_multiple:true, unidad_medica_catalogo_id: this.idCatalogoSeleccionado, lista_ids:''};

    for (let key in this.listaArticulosSeleccionados){
      lista_articulos_ids += key+',';
    }
    params.lista_ids = lista_articulos_ids.slice(0,-1);

    dialogRef.afterClosed().subscribe(valid => {
      if(valid){
        this.isSaving = true;
        this.catalogoArticulosService.deleteArticulo(articulo_id,params).subscribe(
          response =>{
            if(response.error) {
              let errorMessage = response.error.message;
              this.sharedService.showSnackBar(errorMessage, null, 3000);
            } else {
              this.sharedService.showSnackBar('Articulos removidos con éxito', null, 3000);

              for (let id in this.listaArticulosSeleccionados){
                let index = this.dataSourceArticulos.data.findIndex(x => x.id === +id);
                this.dataSourceArticulos.data.splice(index,1);
              }

              this.articulosTable.renderRows();
              this.dataSourceArticulos.paginator = this.articulosPaginator;
              this.dataSourceArticulos.sort = this.sort;
              this.idArticuloSeleccionado = null;

              let catalogo = this.catalogosDisponibles.find(item => item.id == this.idCatalogoSeleccionado);
              catalogo.total_articulos -= this.conteoArticulosSeleccionados;

              this.conteoArticulosSeleccionados = 0;
              this.listaArticulosSeleccionados = {};
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
    });
  }

  cerrarCaptura(){
    if(this.idCatalogoSeleccionado && this.puedeEditarElementos){
      const dialogRef = this.dialog.open(ConfirmActionDialogComponent, {
        width: '500px',
        data:{dialogTitle:'Terminar la captura?',dialogMessage:'Esta seguro que desea terminar la captura de su catalogo?',btnColor:'warn',btnText:'Aceptar'}
      });
  
      dialogRef.afterClosed().subscribe(valid => {
        if(valid){
          this.catalogoArticulosService.cerrarCaptura(this.idCatalogoSeleccionado).subscribe(
            response =>{
              if(response.error) {
                let errorMessage = response.error.message;
                this.sharedService.showSnackBar(errorMessage, null, 3000);
              } else {
                this.sharedService.showSnackBar('Captura Terminada', null, 3000);
                let catalogo = this.catalogosDisponibles.find(item => item.id == this.idCatalogoSeleccionado);
                catalogo.puede_editar = false;
                catalogo.total_articulos = response.data.total_articulos;
                this.puedeEditarElementos = false;
              }
              //this.isSaving = false;
            },
            errorResponse =>{
              var errorMessage = "Ocurrió un error.";
              if(errorResponse.status == 409){
                errorMessage = errorResponse.error.error.message;
              }
              this.sharedService.showSnackBar(errorMessage, null, 3000);
              //this.isSaving = false;
            }
          );
        }
      });
    }
  }

  activarSeleccionMultiple(){
    this.modoSelecionMultiple = true;
    this.listaArticulosSeleccionados = {};
    this.conteoArticulosSeleccionados = 0;
    this.idArticuloSeleccionado = null;
  }

  desactivarSeleccionMultiple(){
    this.modoSelecionMultiple = false;
  }

  cancelarArticulo(articulo){
    let index = this.dataSourceArticulos.data.findIndex(x => x.bien_servicio_id === articulo.bien_servicio_id);
    this.dataSourceArticulos.data.splice(index,1);
    this.articulosTable.renderRows();
    this.dataSourceArticulos.paginator = this.articulosPaginator;
    this.dataSourceArticulos.sort = this.sort;
    this.idArticuloSeleccionado = null;
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

  limpiarFiltroArticulos(){ 
    this.filtroArticulos = '';
    this.dataSourceArticulos.filter = '';
    this.filtroAplicado = false;
  }

}
