import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { AlertPanelComponent } from 'src/app/shared/components/alert-panel/alert-panel.component';
import { AlmacenService } from '../../almacen.service';
import { DialogoPreviewMovimientoComponent } from '../dialogo-preview-movimiento/dialogo-preview-movimiento.component';

export interface DialogData {
  resultadoModificacion: any;
}

@Component({
  selector: 'app-dialogo-movimientos-afectados',
  templateUrl: './dialogo-movimientos-afectados.component.html',
  styleUrls: ['./dialogo-movimientos-afectados.component.css']
})
export class DialogoMovimientosAfectadosComponent implements OnInit {
  @ViewChild(MatPaginator) movimientosPaginator: MatPaginator;
  @ViewChild(AlertPanelComponent) alertPanel:AlertPanelComponent;

  constructor(
    public dialogRef: MatDialogRef<DialogoMovimientosAfectadosComponent>,
    private dialog: MatDialog, 
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private almacenService: AlmacenService,
  ) { }

  isLoadingMovimientos: boolean;

  pageEvent: PageEvent;
  resultsLength: number = 0;
  currentPage: number = 0;
  pageSize: number = 15;
  displayedColumns: string[] = ['estatus','folio','preview','fecha_movimiento','referencia','tipo_movimiento','direccion_movimiento'];
  dataSourceMovimientos: MatTableDataSource<any>;

  subDialogRef: any;

  listaEstatusIconos: any;
  listaEstatusClaves: any;
  listaEstatusLabels: any;

  ngOnInit(): void {
    this.listaEstatusIconos = this.almacenService.listaIconos;
    this.listaEstatusClaves = this.almacenService.listaClaves;
    this.listaEstatusLabels = this.almacenService.listaEtiquetas;

    console.log('data: ',this.data);
    
    this.data.resultadoModificacion.lista_movimientos.forEach(element => {
      console.log('trabajar: ',element);
      if(element.direccion_movimiento == 'SAL'){
        element.direccion_movimiento = 'Salida';
      }else if(element.direccion_movimiento == 'ENT'){
        element.direccion_movimiento = 'Entrada';
        element.origen_destino = (element.almacen)?element.almacen:element.unidad_medica;
      }
    });

    this.dataSourceMovimientos = new MatTableDataSource<any>(this.data.resultadoModificacion.lista_movimientos);
    this.dataSourceMovimientos.paginator = this.movimientosPaginator;
  }

  previewMovimiento(id){
    let configDialog = {
      width: '80%',
      height: '90%',
      maxWidth: '100%',
      disableClose: false,
      data:{id: id},
      panelClass: 'no-padding-dialog'
    };

    this.subDialogRef = this.dialog.open(DialogoPreviewMovimientoComponent, configDialog);
  }

  cerrar(){
    this.dialogRef.close();
  }
}
