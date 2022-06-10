import { trigger, state, style, transition, animate } from '@angular/animations';
import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

export interface DialogData {
  id: number;
}

@Component({
  selector: 'app-dialogo-preview-movimiento',
  templateUrl: './dialogo-preview-movimiento.component.html',
  styleUrls: ['./dialogo-preview-movimiento.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed, void', style({ height: '0px' })), 
      state('expanded', style({ height: '*' })), 
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')), 
      transition('expanded <=> void', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)'))
    ]),
  ],
})
export class DialogoPreviewMovimientoComponent implements OnInit {
  @ViewChild(MatPaginator) articulosPaginator: MatPaginator;
  @ViewChild(MatTable) articulosTable: MatTable<any>;
  @ViewChild(MatSort) sort: MatSort;
  
  constructor(
    private http: HttpClient,
    public dialogRef: MatDialogRef<DialogoPreviewMovimientoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private dialog: MatDialog, 
    private router: Router,
  ) { }

  isLoading:boolean;
  urlPreviewMovimiento:string = `${environment.base_url}/movimientos/preview-movimiento/`;

  movimiento: any;
  tipoMovimiento: string;
  estatusMovimiento: string;

  currentPage: number = 0;
  pageSize: number = 50;
  pageSizeOptions: number[] = [10, 30, 50, 100];
  displayedColumns: string[] = ['estatus','clave','nombre','total_lotes','total_cantidad','actions'];
  dataSourceArticulos: MatTableDataSource<any>;

  idArticuloSeleccionado:number;
  
  listaEstatusIconos: any = { 'BOR':'content_paste',  'FIN':'assignment_turned_in',   'CAN':'cancel',     'PERE':'pending_actions',       'SOL':'edit_notifications',         'MOD':'note_alt'};
  listaEstatusClaves: any = { 'BOR':'borrador',       'FIN':'concluido',              'CAN':'cancelado',  'PERE':'pendiente-recepcion',   'SOL':'peticion-modificacion',      'MOD':'modificacion-aprobada'};
  listaEstatusLabels: any = { 'BOR':'Borrador',       'FIN':'Concluido',              'CAN':'Cancelado',  'PERE':'Pendiente de Recepción','SOL':'Petición de Modificación',   'MOD':'Modificación Activa'};

  ngOnInit(): void {
    this.isLoading = true;
    this.idArticuloSeleccionado = null;

    this.cargarDatos(this.data.id).subscribe(
      response =>{
        if(response.error) {
          let errorMessage = response.error;
          //this.sharedService.showSnackBar(errorMessage, null, 3000);
        } else {
          this.movimiento = response.data;
          this.estatusMovimiento = response.data.estatus;
          switch(response.data.direccion_movimiento){
            case 'ENT':
              this.tipoMovimiento = 'ENTRADA';
              break;
            case 'SAL':
              this.tipoMovimiento = 'SALIDA';
              break;
            default:
              this.tipoMovimiento = 'MOVIMIENTO';
              break;
          }

          let lista_articulos:any[] = [];
          let control_articulos:any = {};
          for (let i = 0; i < response.data.lista_articulos.length; i++) {
            const item = response.data.lista_articulos[i];
            let articulo:any;
            
            if(isNaN(control_articulos[item.articulo.id])){
              articulo = {
                id:                 item.articulo.id,
                clave:              (item.articulo.clave_local)?item.articulo.clave_local:item.articulo.clave_cubs,
                nombre:             item.articulo.articulo,
                descripcion:        item.articulo.especificaciones,
                tipo_bien_servicio: item.articulo.tipo_bien_servicio,
                clave_form:         item.articulo.clave_form,
                descontinuado:      item.articulo.descontinuado,
                en_catalogo_unidad: item.articulo.en_catalogo_unidad,
                es_normativo:       item.articulo.es_normativo,
                total_lotes:        0,
                total_cantidad:     0,
                lotes:              [],
              };
              lista_articulos.push(articulo);
              control_articulos[item.articulo.id] = lista_articulos.length-1;
            }else{
              articulo = lista_articulos[control_articulos[item.articulo.id]];
            }

            articulo.total_lotes += 1;
            articulo.total_cantidad += item.cantidad;

            if(item.stock){
              let lote:any = {
                lote:             item.stock.lote,
                fecha_caducidad:  item.stock.fecha_caducidad,
                codigo_barras:    item.stock.codigo_barras,
                marca:            item.stock.marca,
                modelo:           item.stock.modelo,
                no_serie:         item.stock.no_serie,
                detalle:          (item.stock.empaque_detalle)?item.stock.empaque_detalle.descripcion:'Pieza',
                unidad_medida:    (item.stock.empaque_detalle)?item.stock.empaque_detalle.unidad_medida.descripcion:'Pieza',
                programa:         (item.stock.programa)?item.stock.programa.descripcion:'Sin Programa',
                modo_movimiento:  item.modo_movimiento,
                cantidad:         item.cantidad,
              };
              articulo.lotes.push(lote);
            }
          }
          this.dataSourceArticulos = new MatTableDataSource<any>(lista_articulos);
          this.dataSourceArticulos.paginator = this.articulosPaginator;
          this.dataSourceArticulos.sort = this.sort;

          delete this.movimiento.lista_articulos;
          delete this.movimiento.lista_articulos_borrador;
        }
        this.isLoading = false;
      },
      errorResponse =>{
        var errorMessage = "Ocurrió un error.";
        if(errorResponse.status == 409){
          errorMessage = errorResponse.error.error.message;
        }
        //this.sharedService.showSnackBar(errorMessage, null, 3000);
        this.isLoading = false;
      }
    );
  }

  cargarDatos(id):Observable<any> {
    return this.http.get<any>(this.urlPreviewMovimiento+id,{params:{}}).pipe(
      map( response => {
        return response;
      })
    );
  }

  abrirMovmiento(){
    this.dialog.closeAll();
    if(this.movimiento.direccion_movimiento == 'SAL'){
      this.router.navigateByUrl('/almacen/salidas/editar/'+this.movimiento.id);
    }else{
      this.router.navigateByUrl('/almacen/entradas/editar/'+this.movimiento.id);
    }
  }

  expandirRow(row){
    this.idArticuloSeleccionado = this.idArticuloSeleccionado === row.id ? null : row.id;
  }
  
  cerrar(){
    this.dialogRef.close();
  }
}
