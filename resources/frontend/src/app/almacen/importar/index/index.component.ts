import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import { ImportarService } from '../importar.service';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.css']
})
export class IndexComponent implements OnInit, OnDestroy {

  importing:boolean;
  
  public acciones:any = [
    {value: 1, name: "Importar entradas por proveedor"},
    {value: 2, name: "Importar salidas por transferencia a unidades"},
    {value: 3, name: "Importar existencias"}
  ];

  accion:any = {};
  errorDetails:any;
  data = {
    almacen_id:0
  }

  file:File;

  catalogos:any = {};
  almacenes:any[] = [];
  unidadMedicaId:any;
  almacenId:any;
  
  loadingCatalogos:boolean; 


  catalogosSubscription: Subscription;
  importSubscription:Subscription;
  constructor(private apiService:ImportarService, private _snackBar: MatSnackBar) { }
  ngOnInit(): void {

    this.loadingCatalogos = true;
    this.catalogosSubscription = this.apiService.catalogos().subscribe(
      response => {
        this.catalogos = response;
        this.loadingCatalogos = false;  
        this.unidadMedicaId= this.catalogos.unidad_medica_principal_id;                      
        this.updateAlmacenes();
      }, error => {
        this.loadingCatalogos = false;
        console.log(error);
      }
    );
  }
  ngOnDestroy(): void {
    if(this.catalogosSubscription != null){
      this.catalogosSubscription.unsubscribe();
    }

    if(this.importSubscription != null){
      this.importSubscription.unsubscribe();
    }
  }
  
  updateAlmacenes(){
  
    for(var i = 0; i< this.catalogos.unidades_medicas.length; i++){
      if(this.catalogos.unidades_medicas[i].id == this.unidadMedicaId){
        this.almacenes = this.catalogos.unidades_medicas[i].almacenes;
        break;
      }
    }
    
    if(this.almacenes.length > 0){
      this.data.almacen_id = this.almacenes[0].id;
    } else {
      this.data.almacen_id= -1;
    }
    
  }
  onFileSelect(event) 
  {
    if (event.target.files.length > 0) 
    {
      const file = event.target.files[0];
      this.file = file;
    }
  }

  subir()
  {
    

    var path = "";
    switch(this.accion)
    {
      case 1: path = "importar-entradas-excel"; break; 
      case 2: path = "importar-salidas-excel"; break; 
      case 3: path = "importar-existencias-excel"; break; 
    }

    this.errorDetails = null;
    this.importing = true;

    if(this.importSubscription != null){
      this.importSubscription.unsubscribe();
    }
    this.importSubscription = this.apiService.upload(this.data,this.file, path).subscribe(
      success => 
      {
        this.importing = false;
        console.log(success);

        this._snackBar.open("Importación satisfactoria","Cerrar");
      },
      error =>
      {
        this.importing = false;

        var dataError = error.error;
        console.error(error);
        var message = "Hubo en error al importar";
        if(error.status == 0)
        {
          message = "Hubo un error antes de subir el archivo.";
          this.errorDetails = "¿Modifico el archivo después de seleccionarlo? Si es así, por favor recargue la página o seleccione otro archivo.";
        }
        else if(error.status == 400)
        {
          message = dataError.message;
          this.errorDetails = dataError.data;
        }

        

        this._snackBar.open(message,"Cerrar",{duration:4000});
      }

    )
  }

}
