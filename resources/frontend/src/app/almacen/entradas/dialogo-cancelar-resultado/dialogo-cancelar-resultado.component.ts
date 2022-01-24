import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';

export interface DialogData {
  error: string;
  data?: any[];
}

@Component({
  selector: 'app-dialogo-cancelar-resultado',
  templateUrl: './dialogo-cancelar-resultado.component.html',
  styleUrls: ['./dialogo-cancelar-resultado.component.css']
})
export class DialogoCancelarResultadoComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<DialogoCancelarResultadoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) { }

  errorMessage: string;
  displayedColumns: string[] = ['nombre','lote','feca_caducidad','existencia'];
  dataSource: MatTableDataSource<any>;

  ngOnInit(): void {
    this.errorMessage = this.data.error;
    let itemsList:any[] = [];
    this.data.data.forEach(item => {
      itemsList.push({
        clave: (item.articulo.clave_cubs)?item.articulo.clave_cubs:item.articulo.clave_local,
        nombre: item.articulo.articulo,
        descripcion: item.articulo.especificaciones,
        fecha_caducidad: item.fecha_caducidad,
        lote: item.lote,
        existencia: item.existencia
      });
    });
    this.dataSource = new MatTableDataSource<any>(itemsList);
  }

  cerrar(){
    this.dialogRef.close();
  }

  downloadFile() {
    let data:any = this.dataSource.data;

    const replacer = (key, value) => (value === null ? '' : value); // specify how you want to handle null values here
    const header = Object.keys(data[0]);
    const csv = data.map((row) =>
      header
        .map((fieldName) => JSON.stringify(row[fieldName], replacer))
        .join(',')
    );
    csv.unshift(header.join(','));
    const csvArray = csv.join('\r\n');
  
    const a = document.createElement('a');
    const blob = new Blob([csvArray], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
  
    a.href = url;
    a.download = 'errores-layout-entrada-excel.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  }

}
