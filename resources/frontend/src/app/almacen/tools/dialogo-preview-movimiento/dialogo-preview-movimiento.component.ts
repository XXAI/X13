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

  filtroArticulos:string;

  listadoEstatusUsuarios: any[];
  verListadoUsuarios: boolean;

  currentPage: number = 0;
  pageSize: number = 50;
  pageSizeOptions: number[] = [10, 30, 50, 100];
  displayedColumns: string[] = ['estatus','clave','nombre','total_lotes','total_cantidad','actions'];
  dataSourceArticulos: MatTableDataSource<any>;

  idArticuloSeleccionado:number;
  
  listaEstatusIconos: any = { 'BOR':'content_paste',  'FIN':'assignment_turned_in',   'CAN':'cancel',     'PERE':'pending_actions',       'SOL':'edit_notifications',         'MOD':'note_alt'};
  listaEstatusClaves: any = { 'BOR':'borrador',       'FIN':'concluido',              'CAN':'cancelado',  'PERE':'pendiente-recepcion',   'SOL':'peticion-modificacion',      'MOD':'modificacion-aprobada'};
  listaEstatusLabels: any = { 'BOR':'Borrador',       'FIN':'Concluido',              'CAN':'Cancelado',  'PERE':'Pendiente de Recepción','SOL':'Petición de Modificación',   'MOD':'Modificación Activa'};

  listaClasesCaducidad:any = { 1:'caducidad-verde', 2:'caducidad-ambar', 3:'caducidad-rojo' };
  listaIconosCaducidad:any = { 1:'task_alt', 2:'notification_important', 3:'warning' };
  listaEtiquetasCaducidad:any = { 1:'', 2:'Por Caducar', 3:'Caducado' };

  ngOnInit(): void {
    this.isLoading = true;
    this.idArticuloSeleccionado = null;

    this.listadoEstatusUsuarios = [];
    this.verListadoUsuarios = false;

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

          this.cargarDatosUsuarios(this.movimiento);

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
                estatus_caducidad:  1,  // 0 = Sin Caducidad, 1 = Normal, 2 = Por Caducar, 3 = Caducado
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
              let estatus = 1;
              if(item.articulo.tiene_fecha_caducidad){
                estatus = this.verificarFechaCaducidad(item.stock.fecha_caducidad);
                if(estatus > articulo.estatus_caducidad){
                  articulo.estatus_caducidad = estatus;
                }
              }

              let lote:any = {
                lote:               item.stock.lote,
                fecha_caducidad:    item.stock.fecha_caducidad,
                codigo_barras:      item.stock.codigo_barras,
                marca:              item.stock.marca,
                modelo:             item.stock.modelo,
                no_serie:           item.stock.no_serie,
                detalle:            (item.stock.empaque_detalle)?item.stock.empaque_detalle.descripcion:'Pieza',
                unidad_medida:      (item.stock.empaque_detalle)?item.stock.empaque_detalle.unidad_medida.descripcion:'Pieza',
                programa:           (item.stock.programa)?item.stock.programa.descripcion:'Sin Programa',
                modo_movimiento:    item.modo_movimiento,
                cantidad:           item.cantidad,
                estatus_caducidad:  estatus,
              };
              articulo.lotes.push(lote);
            }
          }
          this.dataSourceArticulos = new MatTableDataSource<any>(lista_articulos);
          this.dataSourceArticulos.paginator = this.articulosPaginator;
          this.dataSourceArticulos.sort = this.sort;

          this.dataSourceArticulos.filterPredicate = function (record,filter) {
            let filtro = filter.toLowerCase();
            let result:boolean = false;
            
            if(record.clave.includes(filtro) || record.nombre.toLowerCase().includes(filtro) || record.descripcion.toLowerCase().includes(filtro)){
              result = true;
            }

            for(let index = 0; index < record.lotes.length; index++){
              if(record.lotes[index] && (record.lotes[index].lote.toLowerCase().includes(filtro))){
                result = true;
                break;
              }
            }

            return result;
          }

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

  verificarFechaCaducidad(fecha_caducidad):number{
    let estatus_caducidad:number = 1;

    if(fecha_caducidad){
      let fecha_caducidad_date = new Date(fecha_caducidad + 'T00:00:00');
      
      let fecha_comparacion = new Date(this.movimiento.fecha_movimiento + 'T00:00:00');
      
      let diferencia_fechas = new Date(fecha_caducidad_date.getTime() - fecha_comparacion.getTime());
      let diferencia_dias = Math.floor(diferencia_fechas.getTime() / (1000*60*60*24));

      if (diferencia_dias < 0){
        estatus_caducidad = 3;
      }else if (diferencia_dias >= 90){
        estatus_caducidad = 1;
      }else{
        estatus_caducidad = 2;
      }
    }

    return estatus_caducidad;
  }

  aplicarFiltroArticulos(event){
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceArticulos.filter = filterValue.trim().toLowerCase();
  }

  cargarDatos(id):Observable<any> {
    return this.http.get<any>(this.urlPreviewMovimiento+id,{params:{}}).pipe(
      map( response => {
        return response;
      })
    );
  }

  cargarDatosUsuarios(datos_movimiento){
    this.listadoEstatusUsuarios = [];
    if(datos_movimiento.cancelado_por){
      this.listadoEstatusUsuarios.push({
        'etiqueta': 'Cancelado por',
        'nombre': datos_movimiento.cancelado_por.name,
        'fecha': new Date(datos_movimiento.fecha_cancelacion+'T12:00:00'),
      });
    }

    if(datos_movimiento.concluido_por){
      this.listadoEstatusUsuarios.push({
        'etiqueta': 'Concluido por',
        'nombre': datos_movimiento.concluido_por.name,
        'fecha': new Date(datos_movimiento.updated_at),
      });
    }else if(datos_movimiento.modificado_por){
      this.listadoEstatusUsuarios.push({
        'etiqueta': 'Modificado por',
        'nombre': datos_movimiento.modificado_por.name,
        'fecha': new Date(datos_movimiento.updated_at),
      });
    }

    if(datos_movimiento.creado_por){
      this.listadoEstatusUsuarios.push({
        'etiqueta': 'Creado por',
        'nombre': datos_movimiento.creado_por.name,
        'fecha': new Date(datos_movimiento.created_at),
      });
    }
  }

  cerrarListaUsuarios(event){
    if(event.code == 'Escape'){
      this.verListadoUsuarios = false;
    }
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
